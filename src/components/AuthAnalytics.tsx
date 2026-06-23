"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { track, identifyUser } from "@/lib/analytics";

// Rendered once in the root layout. Two jobs, both client-side:
//  1. Identify the signed-in user to PostHog so their anonymous funnel events
//     (adventure_started, chapter_viewed, …) link to a person profile.
//  2. Fire `signup_completed` exactly once when the user lands back from the
//     magic-link confirm route, which appends `?auth=confirmed` on success.
// Only IDs are sent — no email, name, or story content.
export function AuthAnalytics() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const userId = data.session?.user?.id;
        if (cancelled) return;
        if (userId) identifyUser(userId);

        const params = new URLSearchParams(window.location.search);
        if (params.get("auth") === "confirmed") {
          track("signup_completed");
          // Strip the marker so a refresh/back doesn't double-count.
          params.delete("auth");
          const qs = params.toString();
          window.history.replaceState(
            null,
            "",
            window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash,
          );
        }
      } catch {
        // analytics must never break the page
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
