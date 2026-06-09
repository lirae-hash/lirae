/**
 * Exercise the production flow: prose-only chapter generation + separate
 * choices call. Confirms prose ends clean (no embedded choices) and choices
 * parse reliably.
 *   npx tsx scripts/debug-chapter.ts the-kitchen 1 rose 3 tortured
 */
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getSetting } from "../src/lib/dna/settings";
import { buildChapterPrompt, buildChoicesPrompt, parseChapterResponse } from "../src/lib/dna/prompt";
import type { Vibe, SpiceLevel, HeroArchetype, ChoiceLogEntry } from "../src/types/database";

const KEY = process.env.GEMINI_API_KEY!;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function gen(prompt: string): Promise<{ text: string; finish?: string } | null> {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST", headers: { "x-goog-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.9, topP: 0.95, topK: 40, maxOutputTokens: 4000, thinkingConfig: { thinkingBudget: 0 } } }),
  });
  const d = await r.json();
  if (d?.error) return null;
  const c = d?.candidates?.[0];
  return { text: c?.content?.parts?.[0]?.text || "", finish: c?.finishReason };
}

async function main() {
  const [id = "the-kitchen", chStr = "1", vibe = "rose", spStr = "3", arche = "tortured"] = process.argv.slice(2);
  const ch = Number(chStr);
  const params = { chapterNo: ch, settingSheet: getSetting(id)!, vibe: vibe as Vibe, archetype: arche as HeroArchetype, spice: Number(spStr) as SpiceLevel, protagonistName: null, choiceLog: [] as ChoiceLogEntry[], ending: null, finalWords: null };

  const proseRes = await gen(buildChapterPrompt(params));
  if (!proseRes) { console.log("prose gen: API error/503"); return; }
  const { prose } = parseChapterResponse(proseRes.text);
  console.log("PROSE: finish=", proseRes.finish, "chars=", prose.length);
  console.log("  last 180 chars:", JSON.stringify(prose.slice(-180)));

  const cp = buildChoicesPrompt(prose, params);
  let choices = null;
  for (let a = 0; cp && !choices && a < 3; a++) {
    const cr = await gen(cp);
    if (cr) choices = parseChapterResponse(cr.text).choices;
  }
  console.log("CHOICES:", choices ? choices.length : "null");
  (choices || []).forEach((c) => console.log(`  [${c.tag}] ${c.text}`));
}
main().catch((e) => { console.error(e); process.exit(1); });
