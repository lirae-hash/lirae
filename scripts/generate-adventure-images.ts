/**
 * Generate cover + scene images for the new adventures and upload to Supabase
 * storage (scene-images/<id>/<archetype>_<vibe>.png).
 *
 * 10 scene archetypes x 4 vibes = 40 images per adventure. Cover = arrival_dark.
 * Atmospheric / cinematic, SETTINGS AND MOOD ONLY — no people, no text.
 * Skips files already present locally, so re-runs resume.
 *
 *   npx tsx scripts/generate-adventure-images.ts                 # all new adventures
 *   npx tsx scripts/generate-adventure-images.ts cedar-hollow    # one adventure
 *   npx tsx scripts/generate-adventure-images.ts --upload-only   # just upload local files
 */
import * as fs from "fs";
import * as path from "path";
import ws from "ws";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const IMAGE_MODEL = "gemini-3.1-flash-image";

// Strong "no people / no text" enforcement appended to every prompt.
const STYLE_SUFFIX =
  "cinematic, moody, atmospheric, shallow depth of field, film grain, photographic, " +
  "establishing shot of an empty place, no people, no person, no figures, no silhouettes, " +
  "unpopulated, no text, no words, no letters, no watermark, no logo";

const VIBES: Record<string, string> = {
  dark: "low-key lighting, deep shadows, pools of darkness, intense, near-black background, single warm light source",
  gold: "warm golden light, amber and honey tones, cinematic glow, rich and inviting",
  rose: "moody rose and mauve tones, soft diffused light, sensual atmosphere, dusky pinks and deep plum shadows",
  sage: "deep emerald and forest tones, old-world richness, muted green shadows, lush and mysterious",
};

const ARCHETYPE_ORDER = [
  "arrival", "proximity", "truce", "crack", "almost",
  "setback", "reckoning", "confession", "surrender", "resolution",
];

// Per-adventure base scene prompts (no people).
const SCENES: Record<string, Record<string, string>> = {
  "cedar-hollow": {
    arrival: "the interior of a small old-town library set up for a council meeting at night, a long wooden table ringed with empty chairs, warm lamplight, tall bookshelves, rain on the windows",
    proximity: "a cluttered lakehouse attic, stacked cardboard boxes and shrouded old furniture under a single bare bulb, dust drifting in a shaft of gray light, a water-damaged wooden roof beam, close and intimate",
    truce: "a half-rebuilt wooden dock on a calm lake at dusk, fresh-cut lumber and tools laid out, strings of festival lights being hung, storm clouds breaking, golden light spilling on the water",
    crack: "a small-town cemetery at dusk beneath tall pines, weathered headstones, long shadows, low mist on the grass, one grave with fresh flowers, melancholy and quiet",
    almost: "a finished lakeside dock at night, warm string lights glowing over dark still water, two empty wooden chairs, the festival packed away, intimate reflective stillness",
    setback: "an attic floor at midnight, an open box of old handwritten letters spilling across the boards under a small lamp, half-taped moving boxes around it, dust in the lamplight",
    reckoning: "a wooden lakehouse porch in heavy night rain, the porch light glowing, rain sheeting off the eaves, two empty rocking chairs, the black lake beyond, raw and charged",
    confession: "the cramped back office of an old hardware store, a worn wooden desk, an open drawer full of yellowed newspaper clippings, a warm desk lamp, shelves of tools and small parts behind",
    surrender: "a warm rustic lakehouse kitchen at night, a small table holding a stack of unsigned papers and a pen, a single pendant light, a window onto the dark lake, intimate and quiet",
    resolution: "a small old-town library in soft afternoon light, the long table, warm light through tall windows, architectural plans unrolled, a settled and hopeful calm",
  },
  "the-acquisition": {
    arrival: "a grand museum gala hall at night, marble columns and a sweeping staircase, a tray of empty champagne coupes, glittering chandeliers, black-tie opulence and no crowd, glamorous and cold",
    proximity: "a high-floor corporate boardroom at night, a long glossy conference table, a glass whiteboard covered in figures, cold coffee cups, the lit city skyline through floor-to-ceiling windows",
    truce: "a corporate war room before dawn, several glowing monitors showing stock charts, scattered papers, a loosened tie over a chair back, the gray pre-dawn city beyond the glass",
    crack: "an empty executive boardroom at 3am, one chair turned toward floor-to-ceiling windows, a phone glowing face-up on the table, the sleeping city far below, isolation and quiet",
    almost: "a luxury penthouse at night, low warm lighting, two crystal tumblers of amber whiskey on a bar cart, the glittering skyline through full-height glass, charged intimate emptiness",
    setback: "a sleek private office at midnight, a single open laptop glowing on a dark desk, confidential papers beside it, the cold skyline beyond, a sense of betrayal uncovered",
    reckoning: "a powerful corner office at dawn, a vast desk with documents thrown across it, pale gold light breaking over the skyline, two empty chairs facing off, stark and tense",
    confession: "a quiet executive office, a single document under a desk lamp with one clause highlighted, a closed laptop showing a diagram, the dim skyline beyond, a turning point",
    surrender: "an elegant private office late at night, soft lamplight, the dark city skyline, two glasses and a bottle on the desk, calm after the storm, intimate",
    resolution: "a glamorous ballroom at night, chandeliers and gold leaf, an empty polished dance floor, a champagne tower, opulent and warm, a sense of arrival",
  },
  "the-inheritance": {
    arrival: "the cavernous library of a gothic manor, floor-to-ceiling dark wood shelves, a roaring stone fireplace, rain lashing tall leaded windows, leather chairs arranged for a reading, candlelight and deep shadow",
    proximity: "a narrow dim servants' staircase in an old manor, worn stone steps, a single iron sconce, deep shadow, claustrophobic and intimate",
    truce: "an old estate records room at night, a heavy desk strewn with ledgers and account books, a green banker's lamp, towering archive shelves receding into shadow, secretive",
    crack: "the interior of a small private estate chapel at night, candlelit, a marble memorial carved with names, empty pews, dark stained glass, profound grief and stillness",
    almost: "a grand manor library during a blackout, a single candle on a table throwing long shadows across dark bookshelves, lightning flashing in tall windows, breathless and charged",
    setback: "a locked estate archive at 1am, a document under a single lamp, rain on the high windows, file boxes and ledgers in shadow, a chilling discovery",
    reckoning: "a dark wood-paneled manor study, a large desk with a single document on the leather top, a low fire, heavy drawn curtains, tense and confined",
    confession: "a shadowed study lit by the glow of a screen showing grainy surveillance footage, a spread of files and photographs across a desk, candle and lamplight, revelation in the dark",
    surrender: "the grand interior of a gothic manor at night, the storm passed, moonlight through tall windows, a fire burning low, tall doors standing open, a held breath released",
    resolution: "a gothic manor library, the same fire and rain on the windows, but the tall doors standing open to a warmly lit hall, softer light, a sense of choosing to stay",
  },
};

function buildPrompt(base: string, vibe: string): string {
  return `${VIBES[vibe]}, ${base}, ${STYLE_SUFFIX}`;
}

async function generateImage(prompt: string): Promise<Buffer> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "x-goog-api-key": GEMINI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
        generationConfig: { responseModalities: ["image"] },
      }),
    }
  );
  if (!response.ok) throw new Error(`Gemini ${response.status}: ${(await response.text()).slice(0, 200)}`);
  const data = await response.json();
  const part = data?.candidates?.[0]?.content?.parts?.find((p: { inlineData?: { data: string } }) => p.inlineData);
  if (!part?.inlineData?.data) throw new Error("No image data: " + JSON.stringify(data).slice(0, 200));
  return Buffer.from(part.inlineData.data, "base64");
}

async function generateForAdventure(id: string) {
  const scenes = SCENES[id];
  if (!scenes) { console.error(`No scene prompts for ${id}`); return; }
  const outDir = path.join(process.cwd(), "generated-images", id);
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n=== ${id}: generating up to ${ARCHETYPE_ORDER.length * 4} images ===`);
  for (const archetype of ARCHETYPE_ORDER) {
    for (const vibe of Object.keys(VIBES)) {
      const file = path.join(outDir, `${archetype}_${vibe}.png`);
      if (fs.existsSync(file)) { console.log(`  [skip] ${archetype}_${vibe}`); continue; }
      try {
        const buf = await generateImage(buildPrompt(scenes[archetype], vibe));
        fs.writeFileSync(file, buf);
        console.log(`  [ok]   ${archetype}_${vibe} (${(buf.length / 1024).toFixed(0)}KB)`);
        await new Promise((r) => setTimeout(r, 1500));
      } catch (e) {
        console.error(`  [fail] ${archetype}_${vibe}: ${e instanceof Error ? e.message : e}`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
}

async function uploadForAdventure(id: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { realtime: { transport: ws } });
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === "scene-images")) {
    await supabase.storage.createBucket("scene-images", { public: true, fileSizeLimit: 5 * 1024 * 1024 });
  }
  const dir = path.join(process.cwd(), "generated-images", id);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".png"));
  let uploaded = 0;
  for (const f of files) {
    const buf = fs.readFileSync(path.join(dir, f));
    const { error } = await supabase.storage.from("scene-images").upload(`${id}/${f}`, buf, {
      contentType: "image/png",
      upsert: true,
    });
    if (error) console.error(`  upload ✗ ${id}/${f}: ${error.message}`);
    else uploaded++;
  }
  console.log(`  uploaded ${uploaded}/${files.length} for ${id}`);
}

async function main() {
  const args = process.argv.slice(2);
  const uploadOnly = args.includes("--upload-only");
  const ids = args.filter((a) => !a.startsWith("--"));
  const targets = ids.length ? ids : Object.keys(SCENES);

  for (const id of targets) {
    if (!uploadOnly) await generateForAdventure(id);
    await uploadForAdventure(id);
  }
  console.log("\nDone.");
}

main().catch((e) => { console.error(e); process.exit(1); });
