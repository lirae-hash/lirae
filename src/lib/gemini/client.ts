const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 10000;

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

export async function generateText(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
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
              maxOutputTokens: 8192,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_ONLY_HIGH",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        // Retry on retryable errors
        if (isRetryableError(response.status) && attempt < MAX_RETRIES - 1) {
          const backoffMs = Math.min(INITIAL_BACKOFF_MS * Math.pow(2, attempt), MAX_BACKOFF_MS);
          console.log(`Gemini API returned ${response.status}, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
          await sleep(backoffMs);
          continue;
        }

        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      // Success - process response
      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(`Gemini error: ${data.error.message}`);
      }

      if (!data.candidates || data.candidates.length === 0) {
        console.error("Gemini response with no candidates:", JSON.stringify(data, null, 2));
        throw new Error("No response generated from Gemini - content may have been blocked by safety filters");
      }

      const candidate = data.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        console.error("Gemini response with empty content:", JSON.stringify(data, null, 2));
        throw new Error("Gemini returned empty content - may have been blocked by safety filters");
      }

      return candidate.content.parts[0].text;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Network errors are retryable
      if (err instanceof TypeError && err.message.includes("fetch") && attempt < MAX_RETRIES - 1) {
        const backoffMs = Math.min(INITIAL_BACKOFF_MS * Math.pow(2, attempt), MAX_BACKOFF_MS);
        console.log(`Network error, retrying in ${backoffMs}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
        await sleep(backoffMs);
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error("Max retries exceeded");
}
