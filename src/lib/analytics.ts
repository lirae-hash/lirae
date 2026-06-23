// Thin wrapper over posthog-js for explicit funnel events. PostHog is
// initialized in src/instrumentation-client.ts; this just gives us a typed,
// centralized place to fire events so we never accidentally log story content.
//
// RULE: event properties may contain IDs, archetypes, vibes, numbers, and
// booleans — NEVER prose, choice text, or any reader free-text.
import posthog from "posthog-js";

/** Closed set of funnel events so naming stays consistent across the app. */
export type AnalyticsEvent =
  | "adventure_started"
  | "chapter_viewed"
  | "choice_made"
  | "signup_started"
  | "signup_completed"
  | "checkout_started";

type SafeProps = Record<string, string | number | boolean | undefined>;

export function track(event: AnalyticsEvent, props?: SafeProps) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, props);
  } catch {
    // analytics must never break a user flow
  }
}

/** Associate the anonymous session with a signed-in user (call after auth). */
export function identifyUser(userId: string) {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.identify(userId);
  } catch {}
}

/** Clear identity on sign-out so the next user starts a fresh session. */
export function resetAnalytics() {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.reset();
  } catch {}
}
