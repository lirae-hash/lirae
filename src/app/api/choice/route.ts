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
    const { playthroughId, choice } = body as {
      playthroughId: string;
      choice: {
        id: string;
        text: string;
        tag: "open" | "guarded";
      };
    };

    if (!playthroughId || !choice) {
      return NextResponse.json(
        { error: "Missing required fields: playthroughId, choice" },
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

    // Advance to next chapter
    const nextChapter = playthrough.current_chapter + 1;

    // Update playthrough
    const { data: updated, error: updateError } = await supabase
      .from("playthroughs")
      .update({
        choice_log: newChoiceLog,
        current_chapter: nextChapter,
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
