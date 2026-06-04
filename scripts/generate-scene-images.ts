/**
 * Batch scene image generation for Lirae
 *
 * Usage:
 *   npx tsx scripts/generate-scene-images.ts --vibe dark          # Generate dark vibe only (10 scenes)
 *   npx tsx scripts/generate-scene-images.ts --vibe dark --presence  # + 4 presence test images
 *   npx tsx scripts/generate-scene-images.ts --all                # Generate all 4 vibes (40 scenes)
 *   npx tsx scripts/generate-scene-images.ts --upload             # Upload local images to Supabase
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import ws from "ws";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const IMAGE_MODEL = "gemini-3.1-flash-image";
const OUTPUT_DIR = path.join(process.cwd(), "generated-images", "the-kitchen");

// Global style suffix
const STYLE_SUFFIX = "cinematic, moody, atmospheric, shallow depth of field, film grain, photographic, no text, no watermark";

// Vibe modifiers
const VIBES: Record<string, string> = {
  dark: "low-key lighting, deep shadows, candlelight and pools of darkness, gothic, intense, near-black background, single warm light source",
  gold: "warm golden light, amber and honey tones, cinematic glow, sunlight or warm lamplight, rich and inviting",
  rose: "moody rose and mauve tones, soft diffused light, sensual atmosphere, dusky pinks and deep plum shadows, ethereal",
  sage: "deep emerald and forest tones, old-world richness, muted green shadows, lush, mysterious, candle and brass accents",
};

// Scene archetypes with their base prompts (without vibe)
const ARCHETYPES: Record<string, { chapter: number; prompt: string }> = {
  arrival: {
    chapter: 1,
    prompt: "an empty professional Michelin-star tasting kitchen at late afternoon, gleaming stainless steel surfaces, cold marble pastry station, copper pots, a single paring knife resting on a board, quiet and pristine, soft window light",
  },
  proximity: {
    chapter: 2,
    prompt: "a narrow professional kitchen pass at midnight, two empty workstations close together, a single long spoon on a steel shelf, intimate cramped space, low overhead light, after-service stillness",
  },
  truce: {
    chapter: 3,
    prompt: "a cold marble pastry station at 2am, mise en place bowls, a single plated dessert under dimmed lights, spun sugar and a glazed cherry, scattered tasting spoons, quiet focused workspace",
  },
  crack: {
    chapter: 4,
    prompt: "the interior of a professional walk-in cold room, racks of pristine produce and aging cheese, an overturned empty milk crate in the center, cold condensation, frost in the air, stark and quiet, a single bare bulb",
  },
  almost: {
    chapter: 5,
    prompt: "a professional kitchen pass at half-light after service, an open dusty wine bottle and two crystal glasses of red wine, lights dimmed to half, long soft shadows, charged intimate emptiness",
  },
  setback: {
    chapter: 6,
    prompt: "a small utilitarian back office in a restaurant, an industrial printer with a single sheet of paper in the tray, harsh fluorescent light, cramped and cold, a sense of something exposed",
  },
  reckoning: {
    chapter: 7,
    prompt: "a Paris rooftop at pale dawn, zinc rooftops and chimney pots stretching to a hazy horizon, cold morning light, two empty spaces at the edge, raw and exposed, the city waking below",
  },
  confession: {
    chapter: 8,
    prompt: "the interior of a night train compartment, empty facing seats by a dark window, city lights streaking past in the distance, warm dim interior light, quiet intimate motion",
  },
  surrender: {
    chapter: 9,
    prompt: "a darkened pastry kitchen at midnight, a single exquisite finished plated dessert on a cold steel counter under a pool of light, security lights low, profound quiet, the air charged",
  },
  resolution: {
    chapter: 10,
    prompt: "the same Michelin tasting kitchen in low October afternoon light, bruised silver light through high windows, a linen apron hanging ready, warm and settled, a sense of belonging",
  },
};

// Presence test images (Julian glimpses - dark vibe only initially)
const PRESENCE_IMAGES: Record<string, string> = {
  julian_hands: "close-up of a chef's hands holding a small paring knife, broad strong elegant hands, mid-motion peeling a vegetable, no face visible, only hands and forearms in rolled white sleeves, dramatic side light",
  julian_silhouette: "the silhouette of a tall man in a chef's jacket standing in a kitchen doorway, backlit, face in shadow and unreadable, framed by the doorway, atmospheric, no facial detail",
  julian_back: "a man in a dark chef's jacket seen from behind at a kitchen pass, shoulders and back of head only, no face, leaning slightly, low light",
  julian_distance: "a lone male figure at the far end of a darkened kitchen, half-lit by security lights, too distant to see his face, atmospheric and moody",
};

async function generateImage(prompt: string): Promise<Buffer> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": GEMINI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
        generationConfig: { responseModalities: ["image"] },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.candidates?.[0]?.content?.parts) {
    throw new Error("No image generated: " + JSON.stringify(data));
  }

  const imagePart = data.candidates[0].content.parts.find(
    (part: { inlineData?: { data: string } }) => part.inlineData
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error("No image data in response");
  }

  return Buffer.from(imagePart.inlineData.data, "base64");
}

function buildPrompt(basePrompt: string, vibe: string): string {
  return `${VIBES[vibe]}, ${basePrompt}, ${STYLE_SUFFIX}`;
}

async function generateSceneImages(vibes: string[]) {
  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let total = 0;
  let success = 0;

  for (const vibe of vibes) {
    console.log(`\n=== Generating ${vibe.toUpperCase()} vibe ===\n`);

    for (const [archetype, config] of Object.entries(ARCHETYPES)) {
      total++;
      const filename = `${archetype}_${vibe}.png`;
      const filepath = path.join(OUTPUT_DIR, filename);

      // Skip if already exists
      if (fs.existsSync(filepath)) {
        console.log(`  [skip] ${filename} (already exists)`);
        success++;
        continue;
      }

      const prompt = buildPrompt(config.prompt, vibe);
      console.log(`  [gen] ${filename}...`);

      try {
        const imageBuffer = await generateImage(prompt);
        fs.writeFileSync(filepath, imageBuffer);
        console.log(`        ✓ saved (${(imageBuffer.length / 1024).toFixed(0)}KB)`);
        success++;

        // Rate limit pause
        await new Promise((r) => setTimeout(r, 2000));
      } catch (err) {
        console.error(`        ✗ failed: ${err}`);
      }
    }
  }

  console.log(`\n=== Complete: ${success}/${total} images ===`);
  console.log(`Output directory: ${OUTPUT_DIR}`);
}

async function generatePresenceImages() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\n=== Generating PRESENCE test images (dark vibe) ===\n`);

  for (const [name, basePrompt] of Object.entries(PRESENCE_IMAGES)) {
    const filename = `${name}_dark.png`;
    const filepath = path.join(OUTPUT_DIR, filename);

    if (fs.existsSync(filepath)) {
      console.log(`  [skip] ${filename} (already exists)`);
      continue;
    }

    const prompt = buildPrompt(basePrompt, "dark");
    console.log(`  [gen] ${filename}...`);

    try {
      const imageBuffer = await generateImage(prompt);
      fs.writeFileSync(filepath, imageBuffer);
      console.log(`        ✓ saved (${(imageBuffer.length / 1024).toFixed(0)}KB)`);
      await new Promise((r) => setTimeout(r, 2000));
    } catch (err) {
      console.error(`        ✗ failed: ${err}`);
    }
  }
}

async function uploadToSupabase() {
  console.log("\n=== Uploading to Supabase Storage ===\n");

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    realtime: { transport: ws },
  });

  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === "scene-images")) {
    await supabase.storage.createBucket("scene-images", {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
    });
  }

  const files = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".png"));
  let uploaded = 0;

  for (const file of files) {
    const filepath = path.join(OUTPUT_DIR, file);
    const buffer = fs.readFileSync(filepath);
    const storagePath = `the-kitchen/${file}`;

    console.log(`  [upload] ${storagePath}...`);

    const { error } = await supabase.storage
      .from("scene-images")
      .upload(storagePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error(`           ✗ ${error.message}`);
    } else {
      console.log(`           ✓ uploaded`);
      uploaded++;
    }
  }

  console.log(`\n=== Uploaded ${uploaded}/${files.length} images ===`);

  // Get public URLs and update adventures table
  const { data: urlData } = supabase.storage.from("scene-images").getPublicUrl("the-kitchen/");
  console.log(`\nBase URL: ${urlData.publicUrl}`);
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes("--upload")) {
  uploadToSupabase().catch(console.error);
} else if (args.includes("--all")) {
  generateSceneImages(["dark", "gold", "rose", "sage"]).catch(console.error);
} else if (args.includes("--vibe")) {
  const vibeIndex = args.indexOf("--vibe") + 1;
  const vibe = args[vibeIndex];
  if (!VIBES[vibe]) {
    console.error(`Invalid vibe: ${vibe}. Use: dark, gold, rose, sage`);
    process.exit(1);
  }

  generateSceneImages([vibe]).then(() => {
    if (args.includes("--presence")) {
      return generatePresenceImages();
    }
  }).catch(console.error);
} else {
  console.log(`
Lirae Scene Image Generator

Usage:
  npx tsx scripts/generate-scene-images.ts --vibe dark          # Generate dark vibe (10 scenes)
  npx tsx scripts/generate-scene-images.ts --vibe dark --presence  # + 4 presence tests
  npx tsx scripts/generate-scene-images.ts --all                # All 4 vibes (40 scenes)
  npx tsx scripts/generate-scene-images.ts --upload             # Upload to Supabase

Output: ./generated-images/the-kitchen/
  `);
}
