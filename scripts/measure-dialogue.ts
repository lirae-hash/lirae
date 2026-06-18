/**
 * Generate a spread of chapters with the REAL production prompt and measure how
 * dialogue-forward they actually are — so we can see whether live output meets
 * the 40-60% dialogue target before changing anything.
 *
 *   npx tsx scripts/measure-dialogue.ts [model]
 *
 * Metrics per chapter:
 *   words           total word count of the prose
 *   dlgWords%       % of words that fall inside paired double-quotes (the real
 *                   "how much of this chapter is spoken" number)
 *   turns           number of separate quoted utterances (back-and-forth proxy)
 *   dlgParas%       % of paragraphs that contain any spoken line
 *   pairCount       what the current gate counts (quote pairs) — for comparison
 */
import * as dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { getSetting } from "../src/lib/dna/settings";
import { buildChapterPrompt, parseChapterResponse, countDialogueLines, passesDialogueGate } from "../src/lib/dna/prompt";
import type { ChoiceLogEntry } from "../src/types/database";

const KEY = process.env.GEMINI_API_KEY!;
const BASE = "https://generativelanguage.googleapis.com/v1beta";

async function gen(model: string, prompt: string): Promise<string> {
  const g: Record<string, unknown> = { temperature: 0.9, topP: 0.95, topK: 40, maxOutputTokens: 4000 };
  if (model.includes("2.5")) g.thinkingConfig = { thinkingBudget: 0 };
  for (let a = 0; a < 5; a++) {
    const r = await fetch(`${BASE}/models/${model}:generateContent?key=${KEY}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: g }),
    });
    const d = await r.json();
    if (d?.error) { await new Promise((s) => setTimeout(s, 1500)); continue; }
    const t = d?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (t) return t;
  }
  throw new Error("gen failed");
}

const QUOTE = /[“”„‟«»"]/g;
const words = (s: string) => (s.trim().match(/\S+/g) || []).length;

// Pull out the text inside paired double-quotes. Treat any of the curly/straight
// double-quote glyphs as quote delimiters, pairing them in order.
function dialogueSpans(prose: string): string[] {
  const spans: string[] = [];
  const marks = [...prose.matchAll(QUOTE)];
  for (let i = 0; i + 1 < marks.length; i += 2) {
    spans.push(prose.slice(marks[i].index! + 1, marks[i + 1].index!));
  }
  return spans;
}

function measure(prose: string) {
  const total = words(prose);
  const spans = dialogueSpans(prose);
  const dlgWords = spans.reduce((n, s) => n + words(s), 0);
  const paras = prose.split(/\n\s*\n/).filter((p) => p.trim());
  const dlgParas = paras.filter((p) => QUOTE.test(p) && (p.match(QUOTE)!.length >= 2)).length;
  return {
    words: total,
    dlgWordsPct: total ? Math.round((dlgWords / total) * 100) : 0,
    turns: spans.length,
    dlgParasPct: paras.length ? Math.round((dlgParas / paras.length) * 100) : 0,
    pairCount: countDialogueLines(prose),
  };
}

// A representative spread: different settings, chapters, archetypes. Chapters
// 1 (no real convo by design), 2, 4, 7 (the talky reckoning), 9.
const CASES: Array<[string, number, string, string]> = [
  ["the-kitchen", 1, "gold", "cinnamon"],
  ["the-kitchen", 2, "dark", "brooding"],
  ["the-acquisition", 4, "dark", "brooding"],
  ["the-inheritance", 7, "sage", "tortured"],
  ["cedar-hollow", 9, "rose", "protector"],
];

async function main() {
  const model = process.argv[2] || "gemini-2.5-flash";
  console.log(`\nMODEL: ${model}   (gate: beat-aware via passesDialogueGate)\n`);
  console.log("setting           ch arch        words dlgWords% turns dlgParas% pairCount gate");
  console.log("─".repeat(86));
  const rows: ReturnType<typeof measure>[] = [];
  for (const [id, ch, vibe, arche] of CASES) {
    const log: ChoiceLogEntry[] = ch > 1 ? [{ id: "1", text: "You hold his gaze, refusing to look away first.", tag: "open" }] : [];
    const params = { chapterNo: ch, settingSheet: getSetting(id)!, vibe: vibe as any, archetype: arche as any, spice: 2 as any, protagonistName: null, choiceLog: log, ending: null, finalWords: null };
    try {
      const prose = parseChapterResponse(await gen(model, buildChapterPrompt(params))).prose;
      const m = measure(prose);
      rows.push(m);
      const gate = passesDialogueGate(prose, ch) ? "PASS" : "FAIL";
      console.log(
        `${id.padEnd(17)} ${String(ch).padStart(2)} ${arche.padEnd(11)} ${String(m.words).padStart(5)} ${String(m.dlgWordsPct).padStart(8)}% ${String(m.turns).padStart(5)} ${String(m.dlgParasPct).padStart(8)}% ${String(m.pairCount).padStart(9)} ${gate}`
      );
    } catch (e) {
      console.log(`${id.padEnd(17)} ${String(ch).padStart(2)} ${arche.padEnd(11)} ERROR ${(e as Error).message}`);
    }
  }
  if (rows.length) {
    const avg = (k: keyof typeof rows[0]) => Math.round(rows.reduce((n, r) => n + (r[k] as number), 0) / rows.length);
    console.log("─".repeat(86));
    console.log(`AVG (${rows.length})                            ${String(avg("words")).padStart(5)} ${String(avg("dlgWordsPct")).padStart(8)}% ${String(avg("turns")).padStart(5)} ${String(avg("dlgParasPct")).padStart(8)}% ${String(avg("pairCount")).padStart(9)}`);
    console.log(`\nTarget: dlgWords% in 40–60.  ${avg("dlgWordsPct") < 40 ? "⚠️  BELOW TARGET — chapters are description-heavy." : "✅ in/above target band."}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
