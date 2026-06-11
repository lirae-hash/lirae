import * as dotenv from "dotenv"; import path from "path"; import crypto from "crypto";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { createClient } from "@supabase/supabase-js"; import ws from "ws";
const SITE = "https://lirae.me";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { realtime: { transport: ws } });

function normHash(log: any[]) {
  const n = (log || []).map((c) => ({ id: c.id, text: c.text, tag: c.tag }));
  return crypto.createHash("sha256").update(JSON.stringify(n)).digest("hex").slice(0, 16);
}
async function jpost(p: string, b: unknown) { const r = await fetch(SITE + p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }); return { status: r.status, json: await r.json().catch(() => null) }; }

async function main() {
  const s = await jpost("/api/playthrough", { adventureId: "the-kitchen", vibe: "dark", spice: 2, archetype: "brooding" });
  const pid = s.json.playthrough.id, tok = s.json.anonymousToken;
  const c1 = await jpost("/api/chapter", { playthroughId: pid, chapterNo: 1, anonymousToken: tok });
  const pick = c1.json.chapter.choices[0];
  console.log("ch1 choice[0]:", JSON.stringify(pick));

  // prefetch ch2 for this branch
  const branchLog = [{ id: pick.id, text: pick.text, tag: pick.tag }];
  const pf = await jpost("/api/chapter", { playthroughId: pid, chapterNo: 2, anonymousToken: tok, prefetch: true, branchChoiceLog: branchLog });
  console.log("prefetch result:", JSON.stringify(pf.json));
  console.log("expected prefetch hash normHash(branchLog):", normHash(branchLog));

  // what did it cache?
  const { data: cacheRows } = await sb.from("chapters_cache").select("path_hash,choices").eq("adventure_id", "the-kitchen").eq("chapter_no", 2).eq("vibe", "dark").eq("spice", 2).eq("archetype", "brooding");
  console.log("cached ch2 path_hashes:", (cacheRows || []).map((r) => r.path_hash));

  // submit the choice, see stored choice_log
  await jpost("/api/choice", { playthroughId: pid, choice: { id: pick.id, text: pick.text, tag: pick.tag }, anonymousToken: tok });
  const { data: pt } = await sb.from("playthroughs").select("choice_log").eq("id", pid).single();
  console.log("stored choice_log:", JSON.stringify(pt!.choice_log));
  console.log("real request hash normHash(stored):", normHash(pt!.choice_log as any[]));
}
main().catch((e) => { console.error(e); process.exit(1); });
