/**
 * Pre-generate all 72 chapter-1 variations (4 vibe x 3 spice x 6 archetype)
 * for one or more adventures, using the live DNA/prompt + settings registry.
 *
 *   npx tsx scripts/pre-generate-chapter-1-all.ts                          # cedar-hollow, the-acquisition, the-inheritance
 *   npx tsx scripts/pre-generate-chapter-1-all.ts the-kitchen             # one adventure
 */
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import WebSocket from "ws";

import { getSetting } from "../src/lib/dna/settings";
import { buildChapterPrompt, buildChoicesPrompt, parseChapterResponse, looksTruncated, analyzeDialogue, passesDialogueGate } from "../src/lib/dna/prompt";
import { generateText } from "../src/lib/gemini/client";
import type { Vibe, SpiceLevel, HeroArchetype, ChoiceLogEntry } from "../src/types/database";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: WebSocket } }
);

const VIBES: Vibe[] = ["dark", "gold", "rose", "sage"];
const SPICE_LEVELS: SpiceLevel[] = [1, 2, 3];
const ARCHETYPES: HeroArchetype[] = ["brooding", "cinnamon", "rogue", "protector", "tortured", "golden"];
const CHAPTER_NO = 1;
const PATH_HASH = crypto.createHash("sha256").update(JSON.stringify([])).digest("hex").slice(0, 16);

function sceneUrl(adventureId: string, vibe: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/scene-images/${adventureId}/arrival_${vibe}.png`;
}

async function generateAndCache(adventureId: string, vibe: Vibe, spice: SpiceLevel, archetype: HeroArchetype) {
  const key = `${adventureId} ${vibe}-${spice}-${archetype}`;
  const settingSheet = getSetting(adventureId);
  if (!settingSheet) { console.error(`  no setting for ${adventureId}`); return "error"; }

  const { data: existing } = await supabase
    .from("chapters_cache").select("id")
    .eq("adventure_id", adventureId).eq("chapter_no", CHAPTER_NO)
    .eq("vibe", vibe).eq("spice", spice).eq("archetype", archetype).eq("path_hash", PATH_HASH)
    .single();
  if (existing) { console.log(`  [skip] ${key}`); return "skipped"; }

  const params = {
    chapterNo: CHAPTER_NO, settingSheet, vibe, archetype, spice,
    protagonistName: null, choiceLog: [] as ChoiceLogEntry[], ending: null, finalWords: null,
  };
  // QUALITY GATE: only cache a chapter that is FULL (not short/truncated) AND
  // has real scene-specific choices. Anything else is skipped (re-runnable),
  // never cached, so the cache only ever holds good chapters.
  let prose = "";
  let choices = null;
  let bestShare = -1;
  for (let attempt = 0; attempt < 3; attempt++) {
    const parsed = parseChapterResponse(await generateText(buildChapterPrompt(params)));
    if (!parsed.prose || looksTruncated(parsed.prose)) continue;
    const { wordSharePct } = analyzeDialogue(parsed.prose);
    if (wordSharePct > bestShare) { bestShare = wordSharePct; prose = parsed.prose; choices = parsed.choices; }
    if (passesDialogueGate(parsed.prose, CHAPTER_NO)) break;
  }
  if (!prose || looksTruncated(prose)) { console.error(`  [skip:prose] ${key} (short/truncated)`); return "error"; }
  if (!passesDialogueGate(prose, CHAPTER_NO)) { console.error(`  [skip:dialogue] ${key} (${bestShare}% share)`); return "error"; }

  const choicesPrompt = buildChoicesPrompt(prose, params);
  for (let attempt = 0; choicesPrompt && (!choices || choices.length === 0) && attempt < 3; attempt++) {
    choices = parseChapterResponse(await generateText(choicesPrompt!)).choices;
  }
  if (choicesPrompt && (!choices || choices.length === 0)) { console.error(`  [skip:choices] ${key}`); return "error"; }

  const { error } = await supabase.from("chapters_cache").insert({
    adventure_id: adventureId, chapter_no: CHAPTER_NO, vibe, spice, archetype,
    path_hash: PATH_HASH, prose, choices, scene_image_url: sceneUrl(adventureId, vibe),
  });
  if (error) { console.error(`  [fail-db] ${key}: ${error.message}`); return "error"; }
  console.log(`  [ok]   ${key} (${prose.length} chars)`);
  return "generated";
}

async function main() {
  const ids = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const targets = ids.length ? ids : ["cedar-hollow", "the-acquisition", "the-inheritance"];
  const tally = { generated: 0, skipped: 0, error: 0 };

  for (const id of targets) {
    console.log(`\n=== ${id}: ${VIBES.length * SPICE_LEVELS.length * ARCHETYPES.length} variations ===`);
    for (const vibe of VIBES) for (const spice of SPICE_LEVELS) for (const archetype of ARCHETYPES) {
      try {
        const r = await generateAndCache(id, vibe, spice, archetype);
        tally[r as keyof typeof tally]++;
        if (r === "generated") await new Promise((res) => setTimeout(res, 400));
      } catch (e) {
        console.error(`  [error] ${id} ${vibe}-${spice}-${archetype}: ${e instanceof Error ? e.message : e}`);
        tally.error++;
        await new Promise((res) => setTimeout(res, 1500));
      }
    }
  }
  console.log(`\n=== Summary: generated=${tally.generated} skipped=${tally.skipped} error=${tally.error} ===`);
}

main().catch((e) => { console.error(e); process.exit(1); });
