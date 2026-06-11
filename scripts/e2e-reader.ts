/**
 * Simulate a real reader against the LIVE site and measure tap-to-chapter
 * latency with branch prefetch: fetch ch1 (cache) -> prefetch ch2 branches ->
 * pick a choice -> measure ch2 (should be a prefetched cache hit). Repeat to ch4.
 *   npx tsx scripts/e2e-reader.ts
 */
const SITE = process.env.SITE || "https://lirae.me";

type Choice = { id: string; text: string; tag: string };
const ms = () => Date.now();

async function jpost(path: string, body: unknown) {
  const r = await fetch(`${SITE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const t = await r.text();
  let j: any = null; try { j = JSON.parse(t); } catch {}
  return { status: r.status, json: j, raw: t };
}

async function main() {
  const start = await jpost("/api/playthrough", { adventureId: "the-kitchen", vibe: "dark", spice: 2, archetype: "brooding" });
  const pid = start.json.playthrough.id;
  const tok = start.json.anonymousToken || "";
  const log: Choice[] = [];

  for (let n = 1; n <= 4; n++) {
    const t0 = ms();
    const res = await jpost("/api/chapter", { playthroughId: pid, chapterNo: n, anonymousToken: tok });
    const fetchMs = ms() - t0;
    if (res.status !== 200 || !res.json?.chapter) { console.log(`ch${n}: FAILED http=${res.status} ${res.raw.slice(0, 100)}`); return; }
    const ch = res.json.chapter;
    const choices: Choice[] = ch.choices || [];
    console.log(`ch${n}: fetch=${fetchMs}ms | fromCache=${ch.fromCache} | ${ch.prose.length} chars | ${choices.length} choices`);

    if (n >= 4) break;

    // Prefetch all branches of ch(n+1) (what the reader does in the background)
    const pt0 = ms();
    const branches = choices.length ? choices : [{ id: "continue", text: "Continue", tag: "open" }];
    const pres = await Promise.all(branches.map((c) =>
      jpost("/api/chapter", { playthroughId: pid, chapterNo: n + 1, anonymousToken: tok, prefetch: true, branchChoiceLog: [...log, { id: c.id, text: c.text, tag: c.tag }] })
    ));
    const prefetchMs = ms() - pt0;
    const warmed = pres.filter((p) => p.json?.prefetched).length;
    const skipped = pres.filter((p) => p.json?.prefetched === false).map((p) => p.json.reason);
    console.log(`   prefetch ch${n + 1}: ${branches.length} branches in ${prefetchMs}ms | warmed=${warmed}${skipped.length ? ` | skipped=[${skipped}]` : ""}`);

    // Reader taps the first choice
    const pick = branches[0];
    const tapStart = ms();
    await jpost("/api/choice", { playthroughId: pid, choice: { id: pick.id, text: pick.text, tag: pick.tag }, anonymousToken: tok });
    log.push({ id: pick.id, text: pick.text, tag: pick.tag });
    // (the next loop iteration fetches ch(n+1) and times it — that's the cache hit)
    console.log(`   tapped "[${pick.tag}] ${pick.text.slice(0, 40)}..." (choice submit ${ms() - tapStart}ms)`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
