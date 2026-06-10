/**
 * Fire N production-equivalent chapter-generation calls and tabulate the exact
 * outcome of each (ok / 503 overload / 429 rate-limit / 429 credits-depleted /
 * 401 / other / truncated). Measures the real per-call failure rate so we can
 * compute the chapter-level rate given the 2-call architecture.
 *   npx tsx scripts/probe-gemini.ts 20
 */
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getSetting } from "../src/lib/dna/settings";
import { buildChapterPrompt, parseChapterResponse, looksTruncated } from "../src/lib/dna/prompt";
import type { ChoiceLogEntry } from "../src/types/database";

const KEY = process.env.GEMINI_API_KEY!;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const prompt = buildChapterPrompt({
  chapterNo: 3, settingSheet: getSetting("the-kitchen")!, vibe: "rose", spice: 3, archetype: "tortured",
  protagonistName: null, choiceLog: [{ id: "1", text: "You hold his gaze.", tag: "open" }, { id: "1", text: "You don't step back.", tag: "open" }] as ChoiceLogEntry[],
  ending: null, finalWords: null,
});

async function one(): Promise<string> {
  let r: Response;
  try {
    r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST", headers: { "x-goog-api-key": KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.9, topP: 0.95, topK: 40, maxOutputTokens: 4000, thinkingConfig: { thinkingBudget: 0 } } }),
    });
  } catch (e) { return "network-error"; }
  const status = r.status;
  const d = await r.json().catch(() => ({}));
  if (d?.error) {
    const code = d.error.code, msg = (d.error.message || "").toLowerCase();
    if (code === 429 && msg.includes("prepay")) return "429-CREDITS-DEPLETED";
    if (code === 429) return "429-rate-limit";
    if (code === 503) return "503-overload";
    if (code === 401 || code === 403) return `${code}-auth/quota`;
    return `err-${code}`;
  }
  const text = d?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) return `empty(${status},finish=${d?.candidates?.[0]?.finishReason})`;
  const prose = parseChapterResponse(text).prose;
  return looksTruncated(prose) ? "ok-but-TRUNCATED" : "ok";
}

async function main() {
  const N = Number(process.argv[2] || 20);
  const tally: Record<string, number> = {};
  for (let i = 0; i < N; i++) {
    const r = await one();
    tally[r] = (tally[r] || 0) + 1;
    process.stdout.write(`${i + 1}:${r}  `);
    await new Promise((s) => setTimeout(s, 300));
  }
  console.log("\n\n=== TALLY (of " + N + ") ===");
  for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${((v / N) * 100).toFixed(0)}%  ${k}  (${v})`);
  }
  const ok = (tally["ok"] || 0);
  console.log(`\nper-call success: ${((ok / N) * 100).toFixed(0)}%`);
}
main().catch((e) => { console.error(e); process.exit(1); });
