"use client";

import { useState } from "react";

interface PaywallProps {
  adventureId: string;
  adventureTitle: string;
  playthroughId: string;
  currentChapter: number;
}

export function Paywall({
  adventureId,
  adventureTitle,
  playthroughId,
  currentChapter,
}: PaywallProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adventureId, playthroughId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start checkout");
      }

      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-gradient-to-b from-wine/20 to-near-black rounded-lg p-8 border border-wine/30">
          {/* Lock icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-wine/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-wine"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h2 className="font-serif text-2xl text-cream mb-2">
            The story continues...
          </h2>

          <p className="text-cream-muted mb-2">
            You&apos;ve reached chapter {currentChapter} of <em>{adventureTitle}</em>.
          </p>

          <p className="text-cream-muted mb-8">
            Unlock chapters 4-10 to discover your ending.
          </p>

          <div className="mb-6">
            <span className="text-3xl font-serif text-cream">$4.99</span>
            <span className="text-cream-muted ml-2">one-time</span>
          </div>

          <button
            onClick={handleUnlock}
            disabled={isLoading}
            className="w-full py-4 bg-wine hover:bg-wine-light disabled:bg-warm-gray text-cream font-medium rounded-lg transition-colors text-lg"
          >
            {isLoading ? "Redirecting to checkout..." : "Unlock Full Story"}
          </button>

          {error && (
            <p className="mt-4 text-wine text-sm">{error}</p>
          )}

          <p className="mt-6 text-cream-muted text-xs">
            Secure checkout powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
