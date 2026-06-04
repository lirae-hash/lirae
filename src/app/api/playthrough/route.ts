import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Vibe, SpiceLevel, HeroArchetype } from "@/types/database";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    // Generate anonymous token for unauthenticated users
    const anonymousToken = user ? null : crypto.randomBytes(32).toString("hex");

    // Create playthrough (with or without user)
    const { data, error } = await supabase
      .from("playthroughs")
      .insert({
        reader_id: user?.id || null,
        adventure_id: adventureId,
        vibe,
        archetype,
        spice,
        protagonist_name: protagonistName || null,
        choice_log: [],
        current_chapter: 1,
        anonymous_token: anonymousToken,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating playthrough:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return the anonymous token so client can store it
    return NextResponse.json({
      playthrough: data,
      anonymousToken: anonymousToken,
    });
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

    const { searchParams } = new URL(request.url);
    const playthroughId = searchParams.get("id");
    const anonymousToken = searchParams.get("token");

    if (playthroughId) {
      // Get specific playthrough - allow if user owns it OR if anonymous token matches
      let query = supabase
        .from("playthroughs")
        .select("*, adventures(title)")
        .eq("id", playthroughId);

      // Build the ownership check
      if (user) {
        // Logged in user can access their own playthroughs
        query = query.or(`reader_id.eq.${user.id},and(reader_id.is.null,anonymous_token.eq.${anonymousToken || ''})`);
      } else if (anonymousToken) {
        // Anonymous user can access with token
        query = query.is("reader_id", null).eq("anonymous_token", anonymousToken);
      } else {
        return NextResponse.json({ error: "Not authorized" }, { status: 401 });
      }

      const { data, error } = await query.single();

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

    // Get all user's playthroughs (requires auth)
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

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
