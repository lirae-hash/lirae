/**
 * Generate one chapter and dump the RAW model output (to inspect choice format).
 *   npx tsx scripts/debug-chapter.ts the-kitchen 2 dark 2 brooding
 */
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getSetting } from "../src/lib/dna/settings";
import { buildChapterPrompt, parseChapterResponse } from "../src/lib/dna/prompt";
import type { Vibe, SpiceLevel, HeroArchetype, ChoiceLogEntry } from "../src/types/database";

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function gen(prompt: string): Promise<string> {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.9, maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 0 } } }),
  });
  const d = await r.json();
  return d?.candidates?.[0]?.content?.parts?.[0]?.text || ("NO TEXT: " + JSON.stringify(d).slice(0, 300));
}

async function main() {
  const [id = "the-kitchen", chStr = "2", vibe = "dark", spStr = "2", arche = "brooding"] = process.argv.slice(2);
  const ch = Number(chStr);
  // give it one prior choice so it's mid-arc
  const log: ChoiceLogEntry[] = ch > 1 ? [{ id: "1", text: "You hold his gaze and refuse to look away first.", tag: "open" }] : [];
  const prompt = buildChapterPrompt({ chapterNo: ch, settingSheet: getSetting(id)!, vibe: vibe as Vibe, archetype: arche as HeroArchetype, spice: Number(spStr) as SpiceLevel, protagonistName: null, choiceLog: log, ending: null, finalWords: null });
  const resp = await gen(prompt);
  console.log("=== RAW LAST 800 CHARS ===");
  console.log(resp.slice(-800));
  const parsed = parseChapterResponse(resp);
  console.log("\n=== PARSED: choices =", parsed.choices ? parsed.choices.length : "null", "===");
}
main().catch((e) => { console.error(e); process.exit(1); });
