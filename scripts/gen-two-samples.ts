/**
 * Generate ch1 for two adventures on flash-lite (cheap) with sturdy 503 retry,
 * print prose + choices + dialogue stats. Does NOT touch the cache.
 *   npx tsx scripts/gen-two-samples.ts
 */
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getSetting } from "../src/lib/dna/settings";
import { buildChapterPrompt, buildChoicesPrompt, parseChapterResponse, looksTruncated, analyzeDialogue, passesDialogueGate } from "../src/lib/dna/prompt";
import type { ChoiceLogEntry } from "../src/types/database";

const KEY = process.env.GEMINI_API_KEY!;
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = process.argv[2] || "gemini-2.5-flash-lite";

const sleep = (ms: number) => new Promise((s) => setTimeout(s, ms));

async function gen(prompt: string): Promise<string> {
  const g = { temperature: 0.9, topP: 0.95, topK: 40, maxOutputTokens: 4000, thinkingConfig: { thinkingBudget: 0 } };
  let lastErr = "";
  for (let a = 0; a < 12; a++) {
    const r = await fetch(`${BASE}/models/${MODEL}:generateContent?key=${KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: g }),
    });
    const d = await r.json();
    if (d?.error) {
      lastErr = `${d.error.code} ${d.error.status}`;
      // 503 high-demand is transient — back off and retry the same model.
      await sleep(Math.min(1000 + a * 1500, 8000));
      continue;
    }
    const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (t) return t;
    lastErr = `no-text finishReason=${d?.candidates?.[0]?.finishReason}`;
    await sleep(1500);
  }
  throw new Error(`gen failed after retries: ${lastErr}`);
}

async function one(id: string, vibe: string, spice: number, arche: string) {
  const params: any = { chapterNo: 1, settingSheet: getSetting(id)!, vibe, archetype: arche, spice, protagonistName: null, choiceLog: [] as ChoiceLogEntry[], ending: null, finalWords: null };
  const prose = parseChapterResponse(await gen(buildChapterPrompt(params))).prose;
  let choices: { tag: string; text: string }[] | null = null;
  const cp = buildChoicesPrompt(prose, params);
  for (let a = 0; cp && !choices && a < 4; a++) choices = parseChapterResponse(await gen(cp)).choices as any;

  const d = analyzeDialogue(prose);
  console.log(`\n========================================================================`);
  console.log(`${id} ch1 (${vibe}/${spice}/${arche}) | ${prose.length} chars | dialogue ${d.wordSharePct}% / ${d.substantiveTurns} substantive turns | gate=${passesDialogueGate(prose, 1) ? "PASS" : "FAIL"} | truncated=${looksTruncated(prose)}`);
  console.log(`========================================================================\n`);
  console.log(prose);
  console.log("\n----- CHOICES -----");
  (choices || []).forEach((c) => console.log(`  [${c.tag}] ${c.text}`));
}

async function main() {
  await one("cedar-hollow", "dark", 2, "brooding");
  await one("the-acquisition", "dark", 2, "brooding");
}
main().catch((e) => { console.error(e); process.exit(1); });
