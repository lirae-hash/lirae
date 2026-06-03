import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateText } from "@/lib/gemini/client";
import { buildChapterPrompt, parseChapterResponse } from "@/lib/dna/prompt";
import { THE_KITCHEN } from "@/lib/dna/settings/the-kitchen";
import crypto from "crypto";
import type { ChoiceLogEntry, Vibe, SpiceLevel } from "@/types/database";

// Map adventure IDs to their setting data
const ADVENTURES: Record<string, typeof THE_KITCHEN> = {
  "the-kitchen": THE_KITCHEN,
};

function hashChoiceLog(choiceLog: ChoiceLogEntry[]): string {
  const str = JSON.stringify(choiceLog);
  return crypto.createHash("sha256").update(str).digest("hex").slice(0, 16);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { playthroughId, chapterNo } = body as {
      playthroughId: string;
      chapterNo: number;
    };

    if (!playthroughId || !chapterNo) {
      return NextResponse.json(
        { error: "Missing required fields: playthroughId, chapterNo" },
        { status: 400 }
      );
    }

    // Fetch playthrough
    const { data: playthrough, error: ptError } = await supabase
      .from("playthroughs")
      .select("*")
      .eq("id", playthroughId)
      .eq("reader_id", user.id)
      .single();

    if (ptError || !playthrough) {
      return NextResponse.json({ error: "Playthrough not found" }, { status: 404 });
    }

    // Check paywall (chapters 4+ require purchase)
    if (chapterNo >= 4) {
      const { data: purchase } = await supabase
        .from("purchases")
        .select("status")
        .eq("reader_id", user.id)
        .eq("adventure_id", playthrough.adventure_id)
        .eq("status", "paid")
        .single();

      if (!purchase) {
        return NextResponse.json(
          { error: "Payment required", code: "PAYWALL" },
          { status: 402 }
        );
      }
    }

    const settingSheet = ADVENTURES[playthrough.adventure_id];
    if (!settingSheet) {
      return NextResponse.json(
        { error: "Adventure not found" },
        { status: 404 }
      );
    }

    const choiceLog = (playthrough.choice_log || []) as ChoiceLogEntry[];
    const pathHash = hashChoiceLog(choiceLog);

    // Check cache first
    const { data: cached } = await supabase
      .from("chapters_cache")
      .select("*")
      .eq("adventure_id", playthrough.adventure_id)
      .eq("chapter_no", chapterNo)
      .eq("vibe", playthrough.vibe)
      .eq("spice", playthrough.spice)
      .eq("path_hash", pathHash)
      .single();

    if (cached) {
      return NextResponse.json({
        chapter: {
          number: chapterNo,
          prose: cached.prose,
          choices: cached.choices,
          sceneImageUrl: cached.scene_image_url,
          fromCache: true,
        },
      });
    }

    // Generate new chapter
    const prompt = buildChapterPrompt({
      chapterNo,
      settingSheet,
      vibe: playthrough.vibe as Vibe,
      spice: playthrough.spice as SpiceLevel,
      protagonistName: playthrough.protagonist_name,
      choiceLog,
    });

    const response = await generateText(prompt);
    const { prose, choices } = parseChapterResponse(response);

    // Cache the chapter
    const { error: cacheError } = await supabase.from("chapters_cache").insert({
      adventure_id: playthrough.adventure_id,
      chapter_no: chapterNo,
      vibe: playthrough.vibe,
      spice: playthrough.spice,
      path_hash: pathHash,
      prose,
      choices,
      scene_image_url: null, // Will be populated in M4
    });

    if (cacheError) {
      console.error("Cache insert error:", cacheError);
      // Don't fail the request, just log
    }

    return NextResponse.json({
      chapter: {
        number: chapterNo,
        prose,
        choices,
        sceneImageUrl: null,
        fromCache: false,
      },
    });
  } catch (err) {
    console.error("Chapter generation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
