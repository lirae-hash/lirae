/**
 * Upsert all adventures from the code settings registry into the DB
 * `adventures` table (published=true) so playthroughs + the library join work.
 * Idempotent. The app generates chapters from the code settings, not from the
 * stored setting_sheet, but the row is still required for the FK + catalogue.
 *
 *   npx tsx scripts/seed-adventures.ts
 */
import * as dotenv from "dotenv";
import ws from "ws";
import { createClient } from "@supabase/supabase-js";
import { ALL_SETTINGS } from "../src/lib/dna/settings";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
);

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;

async function main() {
  let order = 1;
  for (const s of ALL_SETTINGS) {
    const row = {
      id: s.id,
      title: s.title,
      trope: s.trope,
      blurb: s.blurb,
      setting_sheet: {
        heroName: s.heroName,
        setting: s.setting,
        worldDetails: s.worldDetails,
      },
      cover_image_url: `${BASE}/storage/v1/object/public/scene-images/${s.id}/arrival_dark.png`,
      published: true,
      sort_order: order++,
    };

    const { error } = await supabase
      .from("adventures")
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.error(`  ✗ ${s.id}: ${error.message}`);
    } else {
      console.log(`  ✓ ${s.id} (sort ${row.sort_order}) "${s.title}" — ${s.heroName}`);
    }
  }

  const { data } = await supabase
    .from("adventures")
    .select("id, title, published, sort_order")
    .order("sort_order");
  console.log("\nadventures table now:");
  for (const a of data || []) console.log(`  ${a.sort_order}. ${a.id} (published=${a.published})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
