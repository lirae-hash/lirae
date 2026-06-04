import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { playthroughId, anonymousToken } = body as {
      playthroughId: string;
      anonymousToken: string;
    };

    if (!playthroughId || !anonymousToken) {
      return NextResponse.json(
        { error: "Missing required fields: playthroughId, anonymousToken" },
        { status: 400 }
      );
    }

    // Find the anonymous playthrough
    const { data: playthrough, error: findError } = await supabase
      .from("playthroughs")
      .select("*")
      .eq("id", playthroughId)
      .is("reader_id", null)
      .eq("anonymous_token", anonymousToken)
      .single();

    if (findError || !playthrough) {
      return NextResponse.json(
        { error: "Anonymous playthrough not found" },
        { status: 404 }
      );
    }

    // Claim the playthrough by setting reader_id and clearing anonymous_token
    const { data: claimed, error: claimError } = await supabase
      .from("playthroughs")
      .update({
        reader_id: user.id,
        anonymous_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", playthroughId)
      .eq("anonymous_token", anonymousToken)
      .select()
      .single();

    if (claimError) {
      console.error("Error claiming playthrough:", claimError);
      return NextResponse.json({ error: claimError.message }, { status: 500 });
    }

    return NextResponse.json({
      playthrough: claimed,
      message: "Playthrough claimed successfully",
    });
  } catch (err) {
    console.error("Claim playthrough error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
