import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ChoiceLogEntry, Ending } from "@/types/database";
import { determineEnding } from "@/lib/dna/enemies-to-lovers";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await request.json();
    const { playthroughId, choice, finalWords, anonymousToken } = body as {
      playthroughId: string;
      choice: {
        id: string;
        text: string;
        tag: "open" | "guarded";
      };
      finalWords?: string | null;
      anonymousToken?: string;
    };

    if (!playthroughId || !choice) {
      return NextResponse.json(
        { error: "Missing required fields: playthroughId, choice" },
        { status: 400 }
      );
    }

    // Fetch current playthrough - handle both authenticated and anonymous
    let playthrough;

    if (user) {
      const { data, error } = await supabase
        .from("playthroughs")
        .select("*")
        .eq("id", playthroughId)
        .or(`reader_id.eq.${user.id},and(reader_id.is.null,anonymous_token.eq.${anonymousToken || ''})`)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: "Playthrough not found" }, { status: 404 });
      }
      playthrough = data;
    } else if (anonymousToken) {
      const { data, error } = await supabase
        .from("playthroughs")
        .select("*")
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

    // Calculate next chapter
    const nextChapter = playthrough.current_chapter + 1;

    // AUTH GATE: If progressing to chapter 4+, require authentication
    if (nextChapter >= 4 && !user) {
      return NextResponse.json(
        { error: "Sign in required to continue", code: "AUTH_REQUIRED", nextChapter },
        { status: 401 }
      );
    }

    // Append choice to log
    const currentChoiceLog = (playthrough.choice_log || []) as ChoiceLogEntry[];
    const newChoiceLog: ChoiceLogEntry[] = [
      ...currentChoiceLog,
      {
        id: choice.id,
        text: choice.text,
        tag: choice.tag,
      },
    ];

    // Determine ending when reaching chapter 10
    let ending: Ending | null = null;
    if (nextChapter === 10) {
      // Filter out "continue" placeholder choices from no-choice beats
      const realChoices = newChoiceLog.filter(c => c.id !== "continue");
      ending = determineEnding(realChoices as { tag: "open" | "guarded" }[]) as Ending;
    }

    // Update playthrough
    const { data: updated, error: updateError } = await supabase
      .from("playthroughs")
      .update({
        choice_log: newChoiceLog,
        current_chapter: nextChapter,
        ending: ending || playthrough.ending,
        final_words: finalWords !== undefined ? finalWords : playthrough.final_words,
        updated_at: new Date().toISOString(),
      })
      .eq("id", playthroughId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating playthrough:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      playthrough: updated,
      nextChapter,
    });
  } catch (err) {
    console.error("Choice submission error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
