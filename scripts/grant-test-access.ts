import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import ws from "ws";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { realtime: { transport: ws } }
);

async function grantAccess() {
  // Get the most recent playthrough
  const { data: pt } = await supabase
    .from("playthroughs")
    .select("reader_id, adventure_id")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!pt) {
    console.log("No playthrough found");
    return;
  }

  // Update or insert a paid purchase
  const { error } = await supabase.from("purchases")
    .upsert({
      reader_id: pt.reader_id,
      adventure_id: pt.adventure_id,
      status: "paid",
      amount_cents: 0,
    }, {
      onConflict: "reader_id,adventure_id",
      ignoreDuplicates: false
    });

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Access granted for", pt.adventure_id);
  }
}

grantAccess();
