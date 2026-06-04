import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Vibe, SpiceLevel, HeroArchetype } from "@/types/database";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { adventureId, vibe, archetype, spice, protagonistName } = body as {
      adventureId: string;
      vibe: Vibe;
      archetype: HeroArchetype;
      spice: SpiceLevel;
      protagonistName?: string;
    };

    if (!adventureId || !vibe || !archetype || !spice) {
      return NextResponse.json(
        { error: "Missing required fields: adventureId, vibe, archetype, spice" },
        { status: 400 }
      );
    }

    // Validate vibe, archetype, and spice
    const validVibes: Vibe[] = ["dark", "gold", "rose", "sage"];
    const validArchetypes: HeroArchetype[] = ["brooding", "cinnamon", "rogue", "protector", "tortured", "golden"];
    const validSpice: SpiceLevel[] = [1, 2, 3];

    if (!validVibes.includes(vibe)) {
      return NextResponse.json({ error: "Invalid vibe" }, { status: 400 });
    }

    if (!validArchetypes.includes(archetype)) {
      return NextResponse.json({ error: "Invalid archetype" }, { status: 400 });
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
        archetype,
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
      // Get specific playthrough with adventure title
      const { data, error } = await supabase
        .from("playthroughs")
        .select("*, adventures(title)")
        .eq("id", playthroughId)
        .eq("reader_id", user.id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      // Flatten adventure title
      const playthrough = {
        ...data,
        adventure_title: (data.adventures as { title: string } | null)?.title || "Unknown Adventure",
      };
      delete (playthrough as Record<string, unknown>).adventures;

      return NextResponse.json({ playthrough });
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
