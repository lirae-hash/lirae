// Client-side instrumentation — runs after the HTML loads, before React
// hydration (see node_modules/next/dist/docs/.../instrumentation-client.md).
// We initialize PostHog here so it captures the very first pageview, and use
// the Next 16 `onRouterTransitionStart` hook to capture client-side navigations
// (App Router does NOT re-fire pageviews on soft navigation otherwise).
//
// PRIVACY (18+ content): autocapture and session recording are OFF, and all
// text/attributes are masked. PostHog never sees story prose, choices, or any
// reader free-text — only page paths, timings, and explicit funnel events.
import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

// No-op until a project key is set, so this is safe to ship before PostHog is
// configured (and stays off in local dev unless you add the key to .env.local).
if (key) {
  try {
    posthog.init(key, {
      // First-party path — rewritten to PostHog's US hosts in next.config.ts so
      // ad blockers don't drop events. Assets load from /ingest/static.
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      // Only create person profiles for users we explicitly identify (signed in).
      // Keeps anonymous readers cheap and privacy-friendly.
      person_profiles: "identified_only",
      // We capture pageviews manually (App Router) — see below.
      capture_pageview: false,
      // Needed for time-on-page and session-duration metrics.
      capture_pageleave: true,
      // 18+ safety: no DOM autocapture, no session replay, mask everything.
      autocapture: false,
      disable_session_recording: true,
      mask_all_text: true,
      mask_all_element_attributes: true,
    });
    // First load — onRouterTransitionStart only fires on subsequent navigations.
    posthog.capture("$pageview");
  } catch {
    // Never let analytics init break the app.
  }
}

export function onRouterTransitionStart(url: string) {
  if (!key) return;
  try {
    posthog.capture("$pageview", {
      $current_url: new URL(url, window.location.origin).href,
    });
  } catch {
    // swallow — analytics must never interfere with navigation
  }
}
