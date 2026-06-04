/**
 * Pre-generate all 72 chapter 1 variations for The Kitchen
 *
 * Combinations:
 * - vibe: 4 (dark, gold, rose, sage)
 * - spice: 3 (1, 2, 3)
 * - archetype: 6 (brooding, cinnamon, rogue, protector, tortured, golden)
 *
 * Total: 4 × 3 × 6 = 72 variations
 *
 * Run with: npx tsx scripts/pre-generate-chapter-1.ts
 */

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Inline the Gemini client to avoid import issues
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function generateText(prompt: string): Promise<string> {
  const MAX_RETRIES = 3;
  const INITIAL_BACKOFF_MS = 1000;
  const MAX_BACKOFF_MS = 10000;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.9,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
            ],
          }),
        }
      );

      if (!response.ok) {
        const status = response.status;
        if ((status === 503 || status === 429 || status === 500 || status === 502 || status === 504) && attempt < MAX_RETRIES - 1) {
          const backoffMs = Math.min(INITIAL_BACKOFF_MS * Math.pow(2, attempt), MAX_BACKOFF_MS);
          console.log(`  Retrying in ${backoffMs}ms (attempt ${attempt + 1})...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        if (attempt < MAX_RETRIES - 1) {
          const backoffMs = Math.min(INITIAL_BACKOFF_MS * Math.pow(2, attempt), MAX_BACKOFF_MS);
          console.log(`  Empty response, retrying in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }
        throw new Error("Empty response from Gemini");
      }
      return text;
    } catch (error) {
      if (attempt < MAX_RETRIES - 1) {
        const backoffMs = Math.min(INITIAL_BACKOFF_MS * Math.pow(2, attempt), MAX_BACKOFF_MS);
        console.log(`  Error, retrying in ${backoffMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Max retries exceeded");
}

// Import the setting sheet and prompt builder
import { THE_KITCHEN } from "../src/lib/dna/settings/the-kitchen";
import { buildChapterPrompt, parseChapterResponse } from "../src/lib/dna/prompt";
import type { Vibe, SpiceLevel, HeroArchetype } from "../src/types/database";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VIBES: Vibe[] = ["dark", "gold", "rose", "sage"];
const SPICE_LEVELS: SpiceLevel[] = [1, 2, 3];
const ARCHETYPES: HeroArchetype[] = ["brooding", "cinnamon", "rogue", "protector", "tortured", "golden"];

const ADVENTURE_ID = "the-kitchen";
const CHAPTER_NO = 1;

// Chapter 1 has no prior choices, so path_hash is always the same
const PATH_HASH = crypto.createHash("sha256").update(JSON.stringify([])).digest("hex").slice(0, 16);

function getSceneImageUrl(vibe: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/scene-images/${ADVENTURE_ID}/arrival_${vibe}.png`;
}

async function generateAndCache(vibe: Vibe, spice: SpiceLevel, archetype: HeroArchetype): Promise<boolean> {
  const key = `${vibe}-${spice}-${archetype}`;

  // Check if already cached
  const { data: existing } = await supabase
    .from("chapters_cache")
    .select("id")
    .eq("adventure_id", ADVENTURE_ID)
    .eq("chapter_no", CHAPTER_NO)
    .eq("vibe", vibe)
    .eq("spice", spice)
    .eq("archetype", archetype)
    .eq("path_hash", PATH_HASH)
    .single();

  if (existing) {
    console.log(`  [${key}] Already cached, skipping`);
    return false;
  }

  // Generate the chapter
  const prompt = buildChapterPrompt({
    chapterNo: CHAPTER_NO,
    settingSheet: THE_KITCHEN,
    vibe,
    archetype,
    spice,
    protagonistName: null,
    choiceLog: [],
    ending: null,
    finalWords: null,
  });

  console.log(`  [${key}] Generating...`);
  const response = await generateText(prompt);
  const { prose, choices } = parseChapterResponse(response);

  if (!prose) {
    console.error(`  [${key}] Failed to parse prose`);
    return false;
  }

  // Cache the chapter
  const { error } = await supabase.from("chapters_cache").insert({
    adventure_id: ADVENTURE_ID,
    chapter_no: CHAPTER_NO,
    vibe,
    spice,
    archetype,
    path_hash: PATH_HASH,
    prose,
    choices,
    scene_image_url: getSceneImageUrl(vibe),
  });

  if (error) {
    console.error(`  [${key}] Cache error:`, error.message);
    return false;
  }

  console.log(`  [${key}] Cached successfully (${prose.length} chars)`);
  return true;
}

async function main() {
  console.log("=== Pre-generating Chapter 1 Variations ===");
  console.log(`Adventure: ${ADVENTURE_ID}`);
  console.log(`Total combinations: ${VIBES.length * SPICE_LEVELS.length * ARCHETYPES.length}`);
  console.log("");

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const vibe of VIBES) {
    console.log(`\nVibe: ${vibe}`);

    for (const spice of SPICE_LEVELS) {
      for (const archetype of ARCHETYPES) {
        try {
          const wasGenerated = await generateAndCache(vibe, spice, archetype);
          if (wasGenerated) {
            generated++;
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            skipped++;
          }
        } catch (error) {
          console.error(`  [${vibe}-${spice}-${archetype}] Error:`, error);
          errors++;
          // Longer delay on error
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Generated: ${generated}`);
  console.log(`Skipped (already cached): ${skipped}`);
  console.log(`Errors: ${errors}`);
  console.log(`Total: ${generated + skipped + errors}`);
}

main().catch(console.error);
