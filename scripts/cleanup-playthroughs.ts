/**
 * Clean up abandoned/duplicate test playthroughs for authed readers so the
 * "Continue Reading" list is clean.
 *
 * Rule, per authed reader + adventure:
 *   - keep the 3 furthest-progressed IN-PROGRESS reads (chapter 1..9),
 *     tie-broken by most recently updated
 *   - keep the 1 most-recently-updated FINISHED read (chapter >= 10)
 *   - delete the rest
 * Anonymous playthroughs (no reader_id) are left untouched.
 *
 *   npx tsx scripts/cleanup-playthroughs.ts           # dry run (no deletes)
 *   npx tsx scripts/cleanup-playthroughs.ts --apply   # actually delete
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

const KEEP_IN_PROGRESS = 3;
const KEEP_FINISHED = 1;
const apply = process.argv.includes("--apply");

type Row = {
  id: string;
  reader_id: string | null;
  adventure_id: string;
  current_chapter: number;
  updated_at: string;
};

async function main() {
  const { data, error } = await supabase
    .from("playthroughs")
    .select("id, reader_id, adventure_id, current_chapter, updated_at");
  if (error) { console.error(error.message); process.exit(1); }
  const rows = (data || []) as Row[];

  // Group authed rows by reader + adventure
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    if (!r.reader_id) continue; // leave anon alone
    const key = `${r.reader_id}|${r.adventure_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  const toDelete: Row[] = [];
  for (const [, g] of groups) {
    const finished = g.filter((r) => r.current_chapter >= 10)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    const inProgress = g.filter((r) => r.current_chapter < 10)
      .sort((a, b) => (b.current_chapter - a.current_chapter) || b.updated_at.localeCompare(a.updated_at));

    const keep = new Set<string>([
      ...inProgress.slice(0, KEEP_IN_PROGRESS).map((r) => r.id),
      ...finished.slice(0, KEEP_FINISHED).map((r) => r.id),
    ]);
    for (const r of g) if (!keep.has(r.id)) toDelete.push(r);
  }

  console.log(`Authed playthroughs: ${rows.filter((r) => r.reader_id).length}`);
  console.log(`Anonymous (untouched): ${rows.filter((r) => !r.reader_id).length}`);
  console.log(`To delete: ${toDelete.length}`);
  const keptCount = rows.filter((r) => r.reader_id).length - toDelete.length;
  console.log(`Will keep (authed): ${keptCount}`);
  console.log(`  delete chapters: [${toDelete.map((r) => r.current_chapter).sort((a, b) => a - b).join(",")}]`);

  if (!apply) {
    console.log("\nDRY RUN — pass --apply to delete.");
    return;
  }

  const ids = toDelete.map((r) => r.id);
  // Delete in one call
  const { error: delErr } = await supabase.from("playthroughs").delete().in("id", ids);
  if (delErr) { console.error("Delete error:", delErr.message); process.exit(1); }
  console.log(`\nDeleted ${ids.length} playthroughs.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
