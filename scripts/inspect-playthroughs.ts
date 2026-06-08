/**
 * Read-only inspection of the playthroughs table.
 * Helps decide what counts as abandoned/duplicate test data before any cleanup.
 *   npx tsx scripts/inspect-playthroughs.ts
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
  const { data, error } = await supabase
    .from("playthroughs")
    .select("id, reader_id, anonymous_token, adventure_id, current_chapter, protagonist_name, created_at, updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  const rows = data || [];
  console.log(`TOTAL playthroughs: ${rows.length}\n`);

  // Group by reader (or anon) + adventure
  const groups = new Map<string, typeof rows>();
  for (const r of rows) {
    const owner = r.reader_id ? `user:${r.reader_id.slice(0, 8)}` : `anon:${(r.anonymous_token || "none").slice(0, 8)}`;
    const key = `${owner} | ${r.adventure_id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(r);
  }

  console.log("=== Grouped by owner + adventure ===");
  for (const [key, g] of [...groups.entries()].sort((a, b) => b[1].length - a[1].length)) {
    const chapters = g.map((r) => r.current_chapter).sort((a, b) => a - b);
    const atCh1 = g.filter((r) => r.current_chapter <= 1).length;
    const progressed = g.filter((r) => r.current_chapter > 1).length;
    const finished = g.filter((r) => r.current_chapter >= 10).length;
    console.log(
      `${g.length.toString().padStart(3)}  ${key}\n` +
      `      chapters=[${chapters.join(",")}]  atCh1=${atCh1} progressed=${progressed} finished=${finished}`
    );
  }

  // How many distinct authed users / anon
  const users = new Set(rows.filter((r) => r.reader_id).map((r) => r.reader_id));
  const anon = rows.filter((r) => !r.reader_id).length;
  console.log(`\nDistinct authed users: ${users.size}; anonymous playthroughs: ${anon}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
