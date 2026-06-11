const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Primary + fallback models. `gemini-2.5-flash` and `gemini-2.5-flash-lite` are
// separate capacity pools, so when the primary is overloaded (503) we switch to
// the fallback IMMEDIATELY instead of grinding long backoff on a congested pool.
const PRIMARY_MODEL = MODEL;
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash-lite";

// Default wall-clock budget for a single generateText call when the caller
// doesn't pass a deadline. The chapter routes pass their own shared deadline so
// the whole request finishes before the 60s function limit (no raw 504).
const DEFAULT_BUDGET_MS = 50_000;
const MAX_BACKOFF_MS = 4000;

interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[];
    };
  }[];
  error?: {
    message: string;
    code: number;
  };
}

// Sleep helper
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Check if error is retryable (503 rate limit, 429 quota, network errors)
function isRetryableError(status: number): boolean {
  return status === 503 || status === 429 || status === 500 || status === 502 || status === 504;
}

// Streaming version that yields text chunks as they arrive
export async function* generateTextStream(prompt: string): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 4000,
          // gemini-2.5-flash spends "thinking" tokens out of maxOutputTokens.
          // With thinking on, long chapters got truncated before the CHOICE_
          // lines (short prose, missing choices). Creative writing doesn't need
          // it — disable so the full budget goes to prose + choices.
          thinkingConfig: { thinkingBudget: 0 },
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH",
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response body");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr && jsonStr !== "[DONE]") {
            try {
              const data = JSON.parse(jsonStr);
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                yield text;
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    }

    // Process any remaining data in buffer
    if (buffer.startsWith("data: ")) {
      const jsonStr = buffer.slice(6).trim();
      if (jsonStr && jsonStr !== "[DONE]") {
        try {
          const data = JSON.parse(jsonStr);
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            yield text;
          }
        } catch {
          // Skip malformed JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

const SAFETY_SETTINGS = [
  { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
  { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
];

function generationConfig(model: string) {
  const cfg: Record<string, unknown> = { temperature: 0.9, topP: 0.95, topK: 40, maxOutputTokens: 4000 };
  // gemini-2.5-* spends "thinking" tokens out of maxOutputTokens — disable it so
  // the whole budget goes to prose + choices (and generation is faster).
  if (model.includes("2.5")) cfg.thinkingConfig = { thinkingBudget: 0 };
  return cfg;
}

type CallResult = { ok: true; text: string } | { ok: false; fatal: boolean; info: string };

async function callModelOnce(model: string, prompt: string, apiKey: string): Promise<CallResult> {
  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: generationConfig(model),
          safetySettings: SAFETY_SETTINGS,
        }),
      }
    );
  } catch {
    return { ok: false, fatal: false, info: "network-error" };
  }
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return { ok: false, fatal: !isRetryableError(response.status), info: `${response.status} ${body.slice(0, 100)}` };
  }
  const data: GeminiResponse = await response.json().catch(() => ({} as GeminiResponse));
  if (data.error) return { ok: false, fatal: !isRetryableError(data.error.code), info: data.error.message };
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return { ok: false, fatal: false, info: "empty-content" };
  return { ok: true, text };
}

/**
 * Generate text with primary→fallback model rotation and a wall-clock deadline.
 * On a retryable failure (503 overload / empty / network) we IMMEDIATELY try the
 * other model instead of backing off on a congested pool. We only pause (short
 * backoff) after both models fail a round, and we never run past `deadline` —
 * so the chapter route stays under the 60s function limit (no raw 504).
 */
export async function generateText(prompt: string, opts?: { deadline?: number }): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

  const deadline = opts?.deadline ?? Date.now() + DEFAULT_BUDGET_MS;
  const models = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastInfo = "unknown";
  let round = 0;

  while (Date.now() < deadline) {
    for (const model of models) {
      if (Date.now() >= deadline) break;
      const res = await callModelOnce(model, prompt, apiKey);
      if (res.ok) return res.text;
      lastInfo = `${model}: ${res.info}`;
      if (res.fatal) throw new Error(`Gemini error (${lastInfo})`);
      // retryable → drop straight to the next model, no backoff
    }
    round++;
    const wait = Math.min(500 * 2 ** (round - 1), MAX_BACKOFF_MS);
    if (Date.now() + wait >= deadline) break;
    await sleep(wait);
  }
  throw new Error(`Gemini unavailable within budget (last: ${lastInfo})`);
}
