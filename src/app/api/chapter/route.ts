import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateText } from "@/lib/gemini/client";
import { buildChapterPrompt, buildChoicesPrompt, parseChapterResponse, looksTruncated, fallbackChoices } from "@/lib/dna/prompt";
import { getSetting } from "@/lib/dna/settings";
import crypto from "crypto";
import type { ChoiceLogEntry, Vibe, SpiceLevel, HeroArchetype } from "@/types/database";

// Chapter generation makes up to two Gemini calls (prose + choices) with
// 503-retry backoff; the default ~10s function limit cut those retries off
// mid-flight (504), turning recoverable overload into hard failures. Give it
// real headroom.
export const runtime = "nodejs";
export const maxDuration = 60;

// Emails with full access (bypass paywall)
const FULL_ACCESS_EMAILS = [
  "maknight142@gmail.com",
  "csanandaji@gmail.com",
  "anisek5@gmail.com",
];

// Map chapter numbers to scene archetypes for image lookup
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
  // Normalize each entry to a FIXED key order before hashing. choice_log is
  // stored as JSONB (which doesn't preserve key order), so a freshly-built
  // prefetch branch and the DB-round-tripped log must hash identically.
  const normalized = (choiceLog || []).map((c) => ({ id: c.id, text: c.text, tag: c.tag }));
  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex").slice(0, 16);
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { playthroughId, chapterNo, anonymousToken, prefetch, branchChoiceLog } = body as {
      playthroughId: string;
      chapterNo: number;
      anonymousToken?: string;
      // Prefetch mode: warm a SPECULATIVE branch (a hypothetical full choice_log
      // for the next chapter) without mutating the playthrough. Quality-gated.
      prefetch?: boolean;
      branchChoiceLog?: ChoiceLogEntry[];
    };

    if (!playthroughId || !chapterNo) {
      return NextResponse.json(
        { error: "Missing required fields: playthroughId, chapterNo" },
        { status: 400 }
      );
    }

    // AUTH GATE: Chapter 4+ requires authentication
    if (chapterNo >= 4 && !user) {
      return NextResponse.json(
        { error: "Sign in required to continue", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    // Fetch playthrough - handle both authenticated and anonymous access
    let playthrough;

    if (user) {
      // Authenticated user - can access their own playthroughs
      const { data, error } = await supabase
        .from("playthroughs")
        .select("*, adventures(cover_image_url)")
        .eq("id", playthroughId)
        .or(`reader_id.eq.${user.id},and(reader_id.is.null,anonymous_token.eq.${anonymousToken || ''})`)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Playthrough not found" }, { status: 404 });
      }
      playthrough = data;
    } else if (anonymousToken && chapterNo <= 3) {
      // Anonymous user accessing chapters 1-3 with token
      const { data, error } = await supabase
        .from("playthroughs")
        .select("*, adventures(cover_image_url)")
        .eq("id", playthroughId)
        .is("reader_id", null)
        .eq("anonymous_token", anonymousToken)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Playthrough not found" }, { status: 404 });
      }
      playthrough = data;
    } else {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Get scene image URL based on chapter archetype + vibe
    const sceneImageUrl = getSceneImageUrl(playthrough.adventure_id, chapterNo, playthrough.vibe);

    // PAYWALL: Chapters 4+ require purchase (after auth check)
    // Skip for full access emails
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
        return NextResponse.json(
          { error: "Payment required", code: "PAYWALL" },
          { status: 402 }
        );
      }
    }

    const settingSheet = getSetting(playthrough.adventure_id);
    if (!settingSheet) {
      return NextResponse.json(
        { error: "Adventure not found" },
        { status: 404 }
      );
    }

    // In prefetch mode, generate the speculative branch's choice_log instead of
    // the playthrough's stored one (the playthrough is never mutated here).
    const choiceLog = (prefetch && Array.isArray(branchChoiceLog))
      ? branchChoiceLog
      : ((playthrough.choice_log || []) as ChoiceLogEntry[]);
    const pathHash = hashChoiceLog(choiceLog);

    // Check cache first (keyed by adventure, chapter, vibe, spice, archetype, and path)
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
      if (prefetch) return NextResponse.json({ prefetched: true, alreadyCached: true });
      return NextResponse.json({
        chapter: {
          number: chapterNo,
          prose: cached.prose,
          choices: cached.choices,
          sceneImageUrl: cached.scene_image_url || sceneImageUrl,
          cardQuote: null,
          cardQuoteSpeaker: null,
          fromCache: true,
        },
      });
    }

    // Generate new chapter
    const promptParams = {
      chapterNo,
      settingSheet,
      vibe: playthrough.vibe as Vibe,
      archetype: (playthrough.archetype as HeroArchetype) || "brooding",
      spice: playthrough.spice as SpiceLevel,
      protagonistName: playthrough.protagonist_name,
      choiceLog,
      ending: chapterNo === 10 ? (playthrough.ending as "hea" | "hfn" | "heartbreak" | null) : null,
      finalWords: chapterNo === 10 ? playthrough.final_words : null,
    };
    console.log(`=== CHAPTER ${chapterNo} ${prefetch ? "PREFETCH" : "GEN"} ===`);

    // Shared wall-clock budget: prose + choices must finish within this so the
    // request returns before the 60s function limit (a clean 500 -> friendly
    // retry, never a raw 504). ~8s of margin.
    const deadline = Date.now() + 52_000;

    // Generate the prose; regenerate on truncation/short prose; retry on a
    // failed call — all within the shared deadline.
    let prose = "";
    let cardQuote: string | null = null;
    let cardQuoteSpeaker: string | null = null;
    let choices: ReturnType<typeof parseChapterResponse>["choices"] = null;
    for (let attempt = 0; attempt < 3 && Date.now() < deadline; attempt++) {
      try {
        const parsed = parseChapterResponse(await generateText(buildChapterPrompt(promptParams), { deadline }));
        prose = parsed.prose;
        cardQuote = parsed.cardQuote;
        cardQuoteSpeaker = parsed.cardQuoteSpeaker;
        choices = parsed.choices;
        if (prose && !looksTruncated(prose)) break;
        console.log(`Prose truncated/short (attempt ${attempt + 1}/3), regenerating`);
      } catch (err) {
        console.error(`Prose generation attempt ${attempt + 1}/3 failed:`, err);
      }
    }
    if (!prose || looksTruncated(prose)) {
      // QUALITY GATE: never cache/serve a short or truncated chapter.
      if (prefetch) return NextResponse.json({ prefetched: false, reason: "prose-quality" });
      throw new Error("Chapter generation is temporarily unavailable");
    }

    // Choices come from a separate focused call, within the same deadline.
    const choicesPrompt = buildChoicesPrompt(prose, promptParams);
    if (choicesPrompt) {
      for (let attempt = 0; (!choices || choices.length === 0) && attempt < 2 && Date.now() < deadline; attempt++) {
        try {
          choices = parseChapterResponse(await generateText(choicesPrompt, { deadline })).choices;
        } catch (err) {
          console.error("Choices generation failed:", err);
          break;
        }
      }
      if (!choices || choices.length === 0) {
        // QUALITY GATE: a prefetched branch must have REAL scene-specific choices
        // — if we couldn't get them, skip caching it (don't poison the cache with
        // generic choices). A live read instead degrades to a usable fallback.
        if (prefetch) return NextResponse.json({ prefetched: false, reason: "choices-quality" });
        console.log("Choices call failed — using fallback choices for live read");
        choices = fallbackChoices(chapterNo);
      }
    }
    console.log("=== PARSED CHOICES ===");
    console.log(JSON.stringify(choices, null, 2));
    if (chapterNo === 10) {
      console.log("=== CARD QUOTE ===");
      console.log("Quote:", cardQuote);
      console.log("Speaker:", cardQuoteSpeaker);
    }

    // Cache the chapter
    const { error: cacheError } = await supabase.from("chapters_cache").insert({
      adventure_id: playthrough.adventure_id,
      chapter_no: chapterNo,
      vibe: playthrough.vibe,
      spice: playthrough.spice,
      archetype: playthrough.archetype,
      path_hash: pathHash,
      prose,
      choices,
      scene_image_url: sceneImageUrl,
    });

    if (cacheError) {
      console.error("Cache insert error:", cacheError);
    }

    // Prefetch only needed to warm the cache; the branch is now ready for the
    // real request when the reader picks this choice.
    if (prefetch) return NextResponse.json({ prefetched: true });

    return NextResponse.json({
      chapter: {
        number: chapterNo,
        prose,
        choices,
        sceneImageUrl,
        cardQuote,
        cardQuoteSpeaker,
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
