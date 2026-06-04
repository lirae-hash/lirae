/**
 * Test script to generate ONE image and upload to Supabase Storage.
 * Run with: npx tsx scripts/generate-test-image.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import ws from "ws";

// Load env vars from .env.local
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const IMAGE_MODEL = "gemini-2.5-flash-image";

const TEST_PROMPT = `candlelit empty Michelin-star kitchen at midnight, warm low light, faint steam rising, polished steel surfaces, cinematic, moody, photographic, no people, no text`;

async function generateImage(prompt: string): Promise<Buffer> {
  console.log("Generating image with prompt:", prompt);
  console.log("Using model:", IMAGE_MODEL);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": GEMINI_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `Generate an image: ${prompt}` }],
          },
        ],
        generationConfig: {
          responseModalities: ["image"],
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log("Response structure:", JSON.stringify(data, null, 2).slice(0, 1000));

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("No image generated - response: " + JSON.stringify(data));
  }

  const candidate = data.candidates[0];
  if (!candidate.content || !candidate.content.parts) {
    throw new Error("No content in response");
  }

  // Find the image part
  const imagePart = candidate.content.parts.find(
    (part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData
  );

  if (!imagePart || !imagePart.inlineData) {
    throw new Error("No image data in response - parts: " + JSON.stringify(candidate.content.parts));
  }

  console.log("Image mime type:", imagePart.inlineData.mimeType);
  const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
  console.log("Image size:", imageBuffer.length, "bytes");

  return imageBuffer;
}

async function uploadToSupabase(imageBuffer: Buffer, filename: string): Promise<string> {
  console.log("Uploading to Supabase Storage...");

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    realtime: {
      transport: ws,
    },
  });

  // Check if bucket exists, create if not
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some((b) => b.name === "scene-images");

  if (!bucketExists) {
    console.log("Creating scene-images bucket...");
    const { error: createError } = await supabase.storage.createBucket("scene-images", {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    });
    if (createError) {
      console.error("Bucket creation error:", createError);
      // Bucket might already exist, continue
    }
  }

  // Upload the image
  const { data, error } = await supabase.storage
    .from("scene-images")
    .upload(filename, imageBuffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    throw new Error(`Upload error: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("scene-images")
    .getPublicUrl(filename);

  console.log("Uploaded to:", urlData.publicUrl);
  return urlData.publicUrl;
}

async function updateAdventureImage(adventureId: string, imageUrl: string): Promise<void> {
  console.log("Updating adventure with image URL...");

  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!, {
    realtime: {
      transport: ws,
    },
  });

  // For now, store as cover_image_url on the adventure
  // Later we'll have a proper scene_images table
  const { error } = await supabase
    .from("adventures")
    .update({ cover_image_url: imageUrl })
    .eq("id", adventureId);

  if (error) {
    console.error("Update error:", error);
    throw new Error(`Failed to update adventure: ${error.message}`);
  }

  console.log("Adventure updated with image URL");
}

async function main() {
  console.log("=== Lirae Image Pipeline Test ===\n");

  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error("Supabase credentials not set");
  }

  try {
    // Step 1: Generate image
    const imageBuffer = await generateImage(TEST_PROMPT);

    // Save locally for inspection
    const localPath = path.join(process.cwd(), "test-kitchen-image.png");
    fs.writeFileSync(localPath, imageBuffer);
    console.log("Saved locally to:", localPath);

    // Step 2: Upload to Supabase
    const filename = `the-kitchen/test-scene-${Date.now()}.png`;
    const publicUrl = await uploadToSupabase(imageBuffer, filename);

    // Step 3: Update adventure
    await updateAdventureImage("the-kitchen", publicUrl);

    console.log("\n=== SUCCESS ===");
    console.log("Image URL:", publicUrl);
    console.log("\nThe image should now display in the reader for The Kitchen.");
  } catch (err) {
    console.error("\n=== ERROR ===");
    console.error(err);
    process.exit(1);
  }
}

main();
