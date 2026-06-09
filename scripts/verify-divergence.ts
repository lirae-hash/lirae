/**
 * Generate two full 10-chapter playthroughs of one adventure using the live
 * prompt — one ALWAYS choosing the open option, one ALWAYS the guarded option —
 * and write both transcripts so they can be compared. Confirms choices are
 * scene-specific and that the two paths read as different experiences.
 *
 *   npx tsx scripts/verify-divergence.ts                 # the-kitchen, dark/2/brooding
 *   npx tsx scripts/verify-divergence.ts the-acquisition dark 3 brooding
 */
import * as dotenv from "dotenv";
import path from "path";
import * as fs from "fs";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { getSetting } from "../src/lib/dna/settings";
import { buildChapterPrompt, buildChoicesPrompt, parseChapterResponse } from "../src/lib/dna/prompt";
import { determineEnding } from "../src/lib/dna/enemies-to-lovers";
import type { Vibe, SpiceLevel, HeroArchetype, ChoiceLogEntry } from "../src/types/database";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function gen(prompt: string): Promise<string> {
  for (let a = 0; a < 5; a++) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9, topK: 40, topP: 0.95, maxOutputTokens: 4096, thinkingConfig: { thinkingBudget: 0 } },
          }),
        }
      );
      if (!r.ok) { await new Promise((s) => setTimeout(s, Math.min(1500 * 2 ** a, 12000))); continue; }
      const d = await r.json();
      const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (t) return t;
    } catch { /* retry */ }
    await new Promise((s) => setTimeout(s, 1500));
  }
  throw new Error("generation failed after retries");
}

async function playthrough(adventureId: string, stance: "open" | "guarded", vibe: Vibe, spice: SpiceLevel, archetype: HeroArchetype) {
  const setting = getSetting(adventureId)!;
  const choiceLog: ChoiceLogEntry[] = [];
  const out: string[] = [`# ${setting.title} — ALWAYS ${stance.toUpperCase()}  (${vibe}/${spice}/${archetype})\n`];

  for (let ch = 1; ch <= 10; ch++) {
    const ending = ch === 10 ? determineEnding(choiceLog) : null;
    const params = {
      chapterNo: ch, settingSheet: setting, vibe, archetype, spice,
      protagonistName: null, choiceLog, ending, finalWords: null,
    };
    const resp = await gen(buildChapterPrompt(params));
    const { prose } = parseChapterResponse(resp);
    let choices = parseChapterResponse(resp).choices;
    // Recovery: ensure choice-beats have choices (mirror production).
    const cp = buildChoicesPrompt(prose, params);
    for (let a = 0; cp && (!choices || choices.length === 0) && a < 2; a++) {
      choices = parseChapterResponse(await gen(cp)).choices;
    }
    out.push(`\n\n## Chapter ${ch}${ending ? ` — ending: ${ending}` : ""}\n\n${prose}`);

    if (choices && choices.length) {
      out.push(`\n\n_Choices offered:_`);
      choices.forEach((c) => out.push(`\n  - [${c.tag}] ${c.text}`));
      const picked = choices.find((c) => c.tag === stance) || choices[0];
      out.push(`\n\n**→ chose [${picked.tag}]: ${picked.text}**`);
      choiceLog.push({ id: picked.id, text: picked.text, tag: picked.tag });
    }
    process.stdout.write(`  ${stance} ch${ch} ✓ (${prose.length} chars${choices ? `, ${choices.length} choices` : ""})\n`);
  }
  const file = `/tmp/lirae-${stance}.md`;
  fs.writeFileSync(file, out.join(""));
  return { file, ending: determineEnding(choiceLog), choiceLog };
}

async function main() {
  const [id = "the-kitchen", vibe = "dark", spiceStr = "2", arche = "brooding"] = process.argv.slice(2);
  const spice = Number(spiceStr) as SpiceLevel;
  console.log(`=== Divergence test: ${id} (${vibe}/${spice}/${arche}) ===\n`);

  console.log("OPEN path:");
  const open = await playthrough(id, "open", vibe as Vibe, spice, arche as HeroArchetype);
  console.log("\nGUARDED path:");
  const guarded = await playthrough(id, "guarded", vibe as Vibe, spice, arche as HeroArchetype);

  console.log(`\n=== Done ===`);
  console.log(`OPEN    -> ${open.file}   (ending: ${open.ending})`);
  console.log(`GUARDED -> ${guarded.file} (ending: ${guarded.ending})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
