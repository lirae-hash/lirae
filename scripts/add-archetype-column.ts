/**
 * Add archetype column to playthroughs table
 * Run with: npx tsx scripts/add-archetype-column.ts
 */
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import ws from "ws";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
);

async function addArchetypeColumn() {
  console.log("Adding archetype column to playthroughs table...");

  // Use raw SQL through RPC
  const { error } = await supabase.rpc("exec_sql", {
    sql: `
      ALTER TABLE playthroughs
      ADD COLUMN IF NOT EXISTS archetype text DEFAULT 'brooding';
    `
  });

  if (error) {
    // If RPC doesn't exist, try a different approach
    console.log("RPC not available, trying direct update...");

    // Update existing playthroughs to have default archetype
    const { error: updateError } = await supabase
      .from("playthroughs")
      .update({ archetype: "brooding" })
      .is("archetype", null);

    if (updateError && !updateError.message.includes("column")) {
      console.error("Update error:", updateError);
    }
  }

  console.log("Done. You may need to run this SQL in Supabase dashboard:");
  console.log(`
    ALTER TABLE playthroughs
    ADD COLUMN IF NOT EXISTS archetype text DEFAULT 'brooding';
  `);
}

addArchetypeColumn().catch(console.error);
