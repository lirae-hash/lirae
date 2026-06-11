/**
 * List available Gemini models and benchmark candidates for chapter generation:
 * 503 rate, latency, and output length — using the REAL chapter prompt.
 *   npx tsx scripts/benchmark-models.ts
 */
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getSetting } from "../src/lib/dna/settings";
import { buildChapterPrompt, parseChapterResponse, looksTruncated } from "../src/lib/dna/prompt";
import type { ChoiceLogEntry } from "../src/types/database";

const KEY = process.env.GEMINI_API_KEY!;
const BASE = "https://generativelanguage.googleapis.com/v1beta";

const prompt = buildChapterPrompt({
  chapterNo: 2, settingSheet: getSetting("the-kitchen")!, vibe: "dark", spice: 2, archetype: "brooding",
  protagonistName: null, choiceLog: [{ id: "1", text: "You hold his gaze, refusing to look away first.", tag: "open" }] as ChoiceLogEntry[],
  ending: null, finalWords: null,
});

const CANDIDATES = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash-lite", "gemini-flash-latest"];

async function listModels(): Promise<Set<string>> {
  const r = await fetch(`${BASE}/models?key=${KEY}&pageSize=100`);
  const d = await r.json();
  const names = new Set<string>();
  for (const m of d.models || []) {
    if ((m.supportedGenerationMethods || []).includes("generateContent")) {
      names.add((m.name || "").replace("models/", ""));
    }
  }
  return names;
}

async function one(model: string): Promise<{ ms: number; status: string; chars: number }> {
  const gen: Record<string, unknown> = { temperature: 0.9, topP: 0.95, topK: 40, maxOutputTokens: 4000 };
  if (model.includes("2.5")) gen.thinkingConfig = { thinkingBudget: 0 };
  const s = Date.now();
  let r: Response;
  try {
    r = await fetch(`${BASE}/models/${model}:generateContent?key=${KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: gen }),
    });
  } catch { return { ms: Date.now() - s, status: "neterr", chars: 0 }; }
  const ms = Date.now() - s;
  const d = await r.json().catch(() => ({}));
  if (d?.error) return { ms, status: String(d.error.code), chars: 0 };
  const text = d?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) return { ms, status: `empty(${d?.candidates?.[0]?.finishReason})`, chars: 0 };
  return { ms, status: looksTruncated(parseChapterResponse(text).prose) ? "ok-short" : "ok", chars: parseChapterResponse(text).prose.length };
}

async function main() {
  console.log("=== Available models supporting generateContent ===");
  const avail = await listModels();
  for (const c of CANDIDATES) console.log(`  ${avail.has(c) ? "✓" : "✗ NOT AVAILABLE"}  ${c}`);

  const N = 6;
  console.log(`\n=== Benchmark (${N} chapter-2 generations each) ===`);
  for (const model of CANDIDATES) {
    if (!avail.has(model)) { console.log(`  ${model}: (unavailable, skipped)`); continue; }
    const res = [];
    for (let i = 0; i < N; i++) { res.push(await one(model)); await new Promise((s) => setTimeout(s, 250)); }
    const ok = res.filter((r) => r.status === "ok");
    const b503 = res.filter((r) => r.status === "503").length;
    const okMs = ok.map((r) => r.ms);
    const avgOk = okMs.length ? Math.round(okMs.reduce((a, b) => a + b, 0) / okMs.length) : 0;
    const avgChars = ok.length ? Math.round(ok.reduce((a, r) => a + r.chars, 0) / ok.length) : 0;
    const statuses = res.map((r) => r.status).join(",");
    console.log(`  ${model.padEnd(24)} ok=${ok.length}/${N} 503=${b503} | avg-ok ${avgOk}ms | avg-chars ${avgChars} | [${statuses}]`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
