import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Vibe, SpiceLevel } from "@/types/database";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { adventureId, vibe, spice, protagonistName } = body as {
      adventureId: string;
      vibe: Vibe;
      spice: SpiceLevel;
      protagonistName?: string;
    };

    if (!adventureId || !vibe || !spice) {
      return NextResponse.json(
        { error: "Missing required fields: adventureId, vibe, spice" },
        { status: 400 }
      );
    }

    // Validate vibe and spice
    const validVibes: Vibe[] = ["dark", "gold", "rose", "sage"];
    const validSpice: SpiceLevel[] = [1, 2, 3];

    if (!validVibes.includes(vibe)) {
      return NextResponse.json({ error: "Invalid vibe" }, { status: 400 });
    }

    if (!validSpice.includes(spice)) {
      return NextResponse.json({ error: "Invalid spice level" }, { status: 400 });
    }

    // Create playthrough
    const { data, error } = await supabase
      .from("playthroughs")
      .insert({
        reader_id: user.id,
        adventure_id: adventureId,
        vibe,
        spice,
        protagonist_name: protagonistName || null,
        choice_log: [],
        current_chapter: 1,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating playthrough:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ playthrough: data });
  } catch (err) {
    console.error("Playthrough creation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const playthroughId = searchParams.get("id");

    if (playthroughId) {
      // Get specific playthrough
      const { data, error } = await supabase
        .from("playthroughs")
        .select("*")
        .eq("id", playthroughId)
        .eq("reader_id", user.id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json({ playthrough: data });
    }

    // Get all user's playthroughs
    const { data, error } = await supabase
      .from("playthroughs")
      .select("*")
      .eq("reader_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ playthroughs: data });
  } catch (err) {
    console.error("Playthrough fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
