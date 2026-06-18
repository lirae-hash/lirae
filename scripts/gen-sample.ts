/**
 * Generate one full chapter (prose + choices) with a specified model and print
 * it, to compare quality/voice.
 *   npx tsx scripts/gen-sample.ts gemini-2.5-flash-lite the-kitchen 2 dark 2 brooding
 */
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getSetting } from "../src/lib/dna/settings";
import { buildChapterPrompt, buildChoicesPrompt, parseChapterResponse, looksTruncated, analyzeDialogue, passesDialogueGate } from "../src/lib/dna/prompt";
import type { ChoiceLogEntry } from "../src/types/database";

const KEY = process.env.GEMINI_API_KEY!;
const BASE = "https://generativelanguage.googleapis.com/v1beta";

async function gen(model: string, prompt: string): Promise<string> {
  const g: Record<string, unknown> = { temperature: 0.9, topP: 0.95, topK: 40, maxOutputTokens: 4000 };
  if (model.includes("2.5")) g.thinkingConfig = { thinkingBudget: 0 };
  for (let a = 0; a < 4; a++) {
    const r = await fetch(`${BASE}/models/${model}:generateContent?key=${KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: g }),
    });
    const d = await r.json();
    if (d?.error) { await new Promise((s) => setTimeout(s, 1500)); continue; }
    const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (t) return t;
  }
  throw new Error("gen failed");
}

async function main() {
  const [model = "gemini-2.5-flash-lite", id = "the-kitchen", chStr = "2", vibe = "dark", spStr = "2", arche = "brooding"] = process.argv.slice(2);
  const ch = Number(chStr);
  const log: ChoiceLogEntry[] = ch > 1 ? [{ id: "1", text: "You hold his gaze, refusing to look away first.", tag: "open" }] : [];
  const params = { chapterNo: ch, settingSheet: getSetting(id)!, vibe: vibe as any, archetype: arche as any, spice: Number(spStr) as any, protagonistName: null, choiceLog: log, ending: null, finalWords: null };

  const prose = parseChapterResponse(await gen(model, buildChapterPrompt(params))).prose;
  let choices = null;
  const cp = buildChoicesPrompt(prose, params);
  for (let a = 0; cp && !choices && a < 3; a++) choices = parseChapterResponse(await gen(model, cp)).choices;

  const d = analyzeDialogue(prose);
  console.log(`\n===== MODEL: ${model} | ${id} ch${ch} (${vibe}/${spStr}/${arche}) | ${prose.length} chars | dialogue ${d.wordSharePct}% / ${d.substantiveTurns} turns | gate=${passesDialogueGate(prose, ch) ? "PASS" : "FAIL"} | truncated=${looksTruncated(prose)} =====\n`);
  console.log(prose);
  console.log("\n----- CHOICES -----");
  (choices || []).forEach((c: { tag: string; text: string }) => console.log(`  [${c.tag}] ${c.text}`));
}
main().catch((e) => { console.error(e); process.exit(1); });
