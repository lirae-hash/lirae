import { createClient } from "@/lib/supabase/server";
import { generateTextStream } from "@/lib/gemini/client";
import { buildChapterPrompt, parseChapterResponse } from "@/lib/dna/prompt";
import { THE_KITCHEN } from "@/lib/dna/settings/the-kitchen";
import crypto from "crypto";
import type { ChoiceLogEntry, Vibe, SpiceLevel, HeroArchetype } from "@/types/database";

const ADVENTURES: Record<string, typeof THE_KITCHEN> = {
  "the-kitchen": THE_KITCHEN,
};

// Emails with full access (bypass paywall)
const FULL_ACCESS_EMAILS = [
  "maknight142@gmail.com",
  "csanandaji@gmail.com",
];

const CHAPTER_ARCHETYPES: Record<number, string> = {
  1: "arrival",
  2: "proximity",
  3: "truce",
  4: "crack",
  5: "almost",
  6: "setback",
  7: "reckoning",
  8: "confession",
  9: "surrender",
  10: "resolution",
};

function getSceneImageUrl(adventureId: string, chapterNo: number, vibe: string): string {
  const archetype = CHAPTER_ARCHETYPES[chapterNo];
  if (!archetype) return "";
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${baseUrl}/storage/v1/object/public/scene-images/${adventureId}/${archetype}_${vibe}.png`;
}

function hashChoiceLog(choiceLog: ChoiceLogEntry[]): string {
  const str = JSON.stringify(choiceLog);
  return crypto.createHash("sha256").update(str).digest("hex").slice(0, 16);
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  const encoder = new TextEncoder();

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { playthroughId, chapterNo, anonymousToken } = body as {
      playthroughId: string;
      chapterNo: number;
      anonymousToken?: string;
    };

    if (!playthroughId || !chapterNo) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // AUTH GATE: Chapter 4+ requires authentication
    if (chapterNo >= 4 && !user) {
      return new Response(
        JSON.stringify({ error: "Sign in required to continue", code: "AUTH_REQUIRED" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch playthrough
    let playthrough;
    if (user) {
      const { data, error } = await supabase
        .from("playthroughs")
        .select("*, adventures(cover_image_url)")
        .eq("id", playthroughId)
        .or(`reader_id.eq.${user.id},and(reader_id.is.null,anonymous_token.eq.${anonymousToken || ''})`)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Playthrough not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      playthrough = data;
    } else if (anonymousToken && chapterNo <= 3) {
      const { data, error } = await supabase
        .from("playthroughs")
        .select("*, adventures(cover_image_url)")
        .eq("id", playthroughId)
        .is("reader_id", null)
        .eq("anonymous_token", anonymousToken)
        .single();

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: "Playthrough not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
      playthrough = data;
    } else {
      return new Response(
        JSON.stringify({ error: "Not authorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const sceneImageUrl = getSceneImageUrl(playthrough.adventure_id, chapterNo, playthrough.vibe);

    // PAYWALL check - skip for full access emails
    const hasFullAccess = user?.email && FULL_ACCESS_EMAILS.includes(user.email.toLowerCase());
    if (chapterNo >= 4 && user && !hasFullAccess) {
      const { data: purchase } = await supabase
        .from("purchases")
        .select("status")
        .eq("reader_id", user.id)
        .eq("adventure_id", playthrough.adventure_id)
        .eq("status", "paid")
        .single();

      if (!purchase) {
        return new Response(
          JSON.stringify({ error: "Payment required", code: "PAYWALL" }),
          { status: 402, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const settingSheet = ADVENTURES[playthrough.adventure_id];
    if (!settingSheet) {
      return new Response(
        JSON.stringify({ error: "Adventure not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
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
      .eq("archetype", playthrough.archetype)
      .eq("path_hash", pathHash)
      .single();

    if (cached) {
      // Return cached content immediately as a complete stream
      const stream = new ReadableStream({
        start(controller) {
          // Send metadata first
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: "meta",
            sceneImageUrl: cached.scene_image_url || sceneImageUrl,
            fromCache: true,
          })}\n\n`));

          // Send full prose
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: "prose",
            text: cached.prose,
          })}\n\n`));

          // Send choices
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: "choices",
            choices: cached.choices,
          })}\n\n`));

          // Done
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Generate new chapter with streaming
    const prompt = buildChapterPrompt({
      chapterNo,
      settingSheet,
      vibe: playthrough.vibe as Vibe,
      archetype: (playthrough.archetype as HeroArchetype) || "brooding",
      spice: playthrough.spice as SpiceLevel,
      protagonistName: playthrough.protagonist_name,
      choiceLog,
      ending: chapterNo === 10 ? (playthrough.ending as "hea" | "hfn" | "heartbreak" | null) : null,
      finalWords: chapterNo === 10 ? playthrough.final_words : null,
    });

    let fullText = "";
    const stream = new ReadableStream({
      async start(controller) {
        // Send metadata first
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: "meta",
          sceneImageUrl,
          fromCache: false,
        })}\n\n`));

        try {
          for await (const chunk of generateTextStream(prompt)) {
            fullText += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: "chunk",
              text: chunk,
            })}\n\n`));
          }

          // Parse the complete response for choices
          const { prose, choices, cardQuote, cardQuoteSpeaker } = parseChapterResponse(fullText);

          // Cache the chapter (fire and forget)
          supabase.from("chapters_cache").insert({
            adventure_id: playthrough.adventure_id,
            chapter_no: chapterNo,
            vibe: playthrough.vibe,
            spice: playthrough.spice,
            archetype: playthrough.archetype,
            path_hash: pathHash,
            prose,
            choices,
            scene_image_url: sceneImageUrl,
          }).then(({ error }) => {
            if (error) console.error("Cache insert error:", error);
          });

          // Send choices
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: "choices",
            choices,
            cardQuote,
            cardQuoteSpeaker,
          })}\n\n`));

          // Done
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`));
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: "error",
            error: err instanceof Error ? err.message : "Generation failed",
          })}\n\n`));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    console.error("Stream chapter error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
