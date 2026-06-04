import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ChoiceLogEntry } from "@/types/database";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { playthroughId, rewindToChapter } = body as {
      playthroughId: string;
      rewindToChapter: number;
    };

    if (!playthroughId || !rewindToChapter) {
      return NextResponse.json(
        { error: "Missing required fields: playthroughId, rewindToChapter" },
        { status: 400 }
      );
    }

    // Fetch current playthrough
    const { data: playthrough, error: ptError } = await supabase
      .from("playthroughs")
      .select("*")
      .eq("id", playthroughId)
      .eq("reader_id", user.id)
      .single();

    if (ptError || !playthrough) {
      return NextResponse.json({ error: "Playthrough not found" }, { status: 404 });
    }

    // Can only rewind if we're past the target chapter
    if (playthrough.current_chapter <= rewindToChapter) {
      return NextResponse.json({ error: "Cannot rewind forward" }, { status: 400 });
    }

    // Trim choice log to the point just before the rewind chapter
    // (keep choices up to and including chapter rewindToChapter - 1)
    const currentChoiceLog = (playthrough.choice_log || []) as ChoiceLogEntry[];
    const trimmedChoiceLog = currentChoiceLog.slice(0, rewindToChapter - 1);

    // Update playthrough
    const { data: updated, error: updateError } = await supabase
      .from("playthroughs")
      .update({
        choice_log: trimmedChoiceLog,
        current_chapter: rewindToChapter,
        ending: null, // Clear the ending since we're replaying
        updated_at: new Date().toISOString(),
      })
      .eq("id", playthroughId)
      .select()
      .single();

    if (updateError) {
      console.error("Error rewinding playthrough:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      playthrough: updated,
      message: `Rewound to chapter ${rewindToChapter}`,
    });
  } catch (err) {
    console.error("Rewind error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
