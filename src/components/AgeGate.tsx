"use client";

import { useState, useEffect } from "react";

const AGE_CONFIRMED_KEY = "lirae_age_confirmed";

interface AgeGateProps {
  children: React.ReactNode;
}

export function AgeGate({ children }: AgeGateProps) {
  const [isConfirmed, setIsConfirmed] = useState<boolean | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    const confirmed = localStorage.getItem(AGE_CONFIRMED_KEY);
    setIsConfirmed(confirmed === "true");
  }, []);

  function handleConfirm() {
    localStorage.setItem(AGE_CONFIRMED_KEY, "true");
    setIsConfirmed(true);
  }

  function handleExit() {
    setIsExiting(true);
    // Redirect to a safe page after a brief delay
    setTimeout(() => {
      window.location.href = "https://www.google.com";
    }, 300);
  }

  // Don't render anything until we've checked localStorage
  if (isConfirmed === null) {
    return (
      <div className="min-h-screen bg-near-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-wine border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show the content if age is confirmed
  if (isConfirmed) {
    return <>{children}</>;
  }

  // Show the age gate modal
  return (
    <div
      className={`fixed inset-0 z-50 bg-near-black flex items-center justify-center px-4 transition-opacity duration-300 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl text-wine mb-2">Lirae</h1>
          <p className="text-cream-muted">Interactive Romance</p>
        </div>

        <div className="bg-charcoal rounded-lg p-8 border border-warm-gray">
          <h2 className="font-serif text-2xl text-cream mb-4 text-center">
            Age Verification
          </h2>

          <p className="text-cream-muted text-center mb-6">
            This site contains mature romantic content intended for adults only.
            By entering, you confirm that you are at least 18 years old.
          </p>

          <div className="space-y-3">
            <button
              onClick={handleConfirm}
              className="w-full py-3 bg-wine hover:bg-wine-light text-cream font-medium rounded-lg transition-colors"
            >
              I am 18 or older — Enter
            </button>

            <button
              onClick={handleExit}
              className="w-full py-3 bg-transparent border border-warm-gray hover:border-cream-muted text-cream-muted font-medium rounded-lg transition-colors"
            >
              I am under 18 — Exit
            </button>
          </div>
        </div>

        <p className="text-center text-cream-muted text-xs mt-6">
          By entering, you agree to our{" "}
          <a href="/terms" className="text-wine hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-wine hover:underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
