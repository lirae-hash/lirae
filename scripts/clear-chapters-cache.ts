/**
 * Clear the chapters_cache table.
 *
 * Use after changing the generation DNA/prompt so previously generated
 * chapters regenerate under the new rules. The cache is purely an optimization,
 * so this is always safe.
 *
 * Optionally pass an adventure id to clear only that adventure:
 *   npx tsx scripts/clear-chapters-cache.ts                 # clear everything
 *   npx tsx scripts/clear-chapters-cache.ts the-kitchen     # clear one adventure
 */

import * as dotenv from "dotenv";
import ws from "ws";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
);

async function main() {
  const adventureId = process.argv[2];

  const { count: before } = await supabase
    .from("chapters_cache")
    .select("*", { count: "exact", head: true });

  let query = supabase.from("chapters_cache").delete();
  if (adventureId) {
    query = query.eq("adventure_id", adventureId);
    console.log(`Clearing cached chapters for adventure: ${adventureId}`);
  } else {
    // Delete all rows (id is never null, so this matches everything)
    query = query.not("id", "is", null);
    console.log("Clearing ALL cached chapters");
  }

  const { error } = await query;
  if (error) {
    console.error("Error clearing cache:", error.message);
    process.exit(1);
  }

  const { count: after } = await supabase
    .from("chapters_cache")
    .select("*", { count: "exact", head: true });

  console.log(`Done. chapters_cache rows: ${before ?? "?"} -> ${after ?? "?"}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
