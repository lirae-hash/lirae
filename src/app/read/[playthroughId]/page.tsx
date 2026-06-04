"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toPng } from "html-to-image";
import { AgeGate } from "@/components/AgeGate";
import { Paywall } from "@/components/Paywall";
import { createClient } from "@/lib/supabase/client";

// Archetype display names
const ARCHETYPE_NAMES: Record<string, string> = {
  brooding: "The Brooding Rival",
  cinnamon: "The Cinnamon Roll",
  rogue: "The Charming Rogue",
  protector: "The Fierce Protector",
  tortured: "The Tortured Soul",
  golden: "The Golden Boy",
};

// Ending configuration with colors and fallback quotes
const ENDING_CONFIG = {
  hea: {
    title: "Happily Ever After",
    fallbackQuote: "I chose vulnerability. I chose him. And he chose me back.",
    // Warm golden glow
    primaryColor: "#fbbf24",
    secondaryColor: "#f59e0b",
    gradientFrom: "rgba(251, 191, 36, 0.15)",
    gradientTo: "rgba(245, 158, 11, 0.05)",
    glowColor: "rgba(251, 191, 36, 0.3)",
  },
  hfn: {
    title: "Happy For Now",
    fallbackQuote: "The story isn't over. But right now, in this moment, we're together.",
    // Soft rose/pink warmth
    primaryColor: "#f472b6",
    secondaryColor: "#ec4899",
    gradientFrom: "rgba(244, 114, 182, 0.12)",
    gradientTo: "rgba(236, 72, 153, 0.04)",
    glowColor: "rgba(244, 114, 182, 0.25)",
  },
  heartbreak: {
    title: "Heartbreak",
    fallbackQuote: "Some walls are built to protect. Some distances can't be closed.",
    // Cold slate blue
    primaryColor: "#94a3b8",
    secondaryColor: "#64748b",
    gradientFrom: "rgba(148, 163, 184, 0.1)",
    gradientTo: "rgba(100, 116, 139, 0.03)",
    glowColor: "rgba(148, 163, 184, 0.2)",
  },
};

// Sign In Modal for chapter 4 auth gate
function SignInModal({
  onClose,
  playthroughId,
  onSignInSuccess
}: {
  onClose: () => void;
  playthroughId: string;
  onSignInSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/read/${playthroughId}`,
        },
      });

      if (error) throw error;
      setEmailSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setIsLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="fixed inset-0 bg-near-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-charcoal border border-warm-gray rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-wine/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl text-cream mb-4">Check your email</h2>
          <p className="text-cream-muted mb-6">
            We sent a magic link to <span className="text-cream">{email}</span>.
            Click it to continue your story.
          </p>
          <p className="text-cream-muted text-sm">
            Your progress is saved. The link will bring you right back here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-near-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-charcoal border border-warm-gray rounded-2xl p-8 max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-cream-muted hover:text-cream"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="font-serif text-2xl text-cream mb-2 text-center">
          Chapter 4 awaits...
        </h2>
        <p className="text-cream-muted text-center mb-6">
          Enter your email and we&apos;ll send you a magic link to keep reading.
          Your progress is saved — you&apos;ll pick up right where you left off.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-near-black border border-warm-gray rounded-lg text-cream placeholder:text-warm-gray focus:border-wine focus:outline-none transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-wine text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full py-3 bg-wine hover:bg-wine-light disabled:bg-warm-gray text-cream font-medium rounded-lg transition-colors"
          >
            {isLoading ? "Sending..." : "Send me a link"}
          </button>
        </form>

        <p className="text-cream-muted text-xs text-center mt-4">
          No password needed — just click the link in your email.
        </p>
      </div>
    </div>
  );
}

// Premium shareable ending card
function EndingCard({
  ending,
  vibe,
  archetype,
  adventureTitle,
  adventureId,
  heroName,
  protagonistName,
  cardQuote,
  cardQuoteSpeaker,
  playthroughId,
}: {
  ending: string | null;
  vibe: string;
  archetype: string;
  adventureTitle: string;
  adventureId: string;
  heroName: string;
  protagonistName: string | null;
  cardQuote: string | null;
  cardQuoteSpeaker: string | null;
  playthroughId: string;
}) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isRewinding, setIsRewinding] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const config = ENDING_CONFIG[ending as keyof typeof ENDING_CONFIG] || ENDING_CONFIG.hfn;
  const archetypeName = ARCHETYPE_NAMES[archetype] || "The Love Interest";

  const displayQuote = cardQuote || config.fallbackQuote;

  let quoteAttribution: string | null = null;
  if (cardQuoteSpeaker && cardQuoteSpeaker.toLowerCase() !== "narration") {
    if (cardQuoteSpeaker.toLowerCase() === "her" || cardQuoteSpeaker === protagonistName) {
      quoteAttribution = protagonistName || "Me";
    } else {
      quoteAttribution = cardQuoteSpeaker;
    }
  }

  const sceneImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/scene-images/${adventureId}/resolution_${vibe}.png`;

  useEffect(() => {
    async function loadImage() {
      try {
        const response = await fetch(sceneImageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageDataUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Failed to load scene image:", err);
      }
    }
    loadImage();
  }, [sceneImageUrl]);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Use ending-specific colors (ignoring vibe for clearer emotional tone)
  const endingColors = {
    primary: config.primaryColor,
    secondary: config.secondaryColor,
    gradientFrom: config.gradientFrom,
    gradientTo: config.gradientTo,
    glow: config.glowColor,
  };

  async function handleDownload() {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#0a0a0a",
      });

      const link = document.createElement("a");
      link.download = `lirae-${ending || "ending"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleShare() {
    if (!cardRef.current) return;
    setIsSharing(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#0a0a0a",
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `lirae-${ending || "ending"}.png`, { type: "image/png" });

      await navigator.share({
        title: `My ${config.title} ending`,
        text: `I just finished "${adventureTitle}" on Lirae. ${displayQuote.slice(0, 100)}...`,
        files: [file],
      });
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        console.error("Share failed:", err);
      }
    } finally {
      setIsSharing(false);
    }
  }

  async function handleRewind() {
    setIsRewinding(true);
    try {
      const res = await fetch("/api/rewind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playthroughId, rewindToChapter: 6 }),
      });

      if (res.ok) {
        router.refresh();
        window.location.reload();
      }
    } catch (err) {
      console.error("Rewind failed:", err);
    } finally {
      setIsRewinding(false);
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-warm-gray">
      {/* Card with 9:16 aspect ratio for Instagram Stories */}
      <div
        ref={cardRef}
        style={{
          width: "100%",
          maxWidth: "360px",
          aspectRatio: "9 / 16",
          margin: "0 auto",
          borderRadius: "24px",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Scene image - brighter at 70% opacity */}
        {imageDataUrl && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${imageDataUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center top",
              opacity: 0.7,
            }}
          />
        )}

        {/* Lighter gradient overlay with ending-specific color tint */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(180deg,
              ${endingColors.gradientFrom} 0%,
              rgba(10, 10, 10, 0.4) 30%,
              rgba(10, 10, 10, 0.7) 60%,
              rgba(10, 10, 10, 0.95) 100%)`,
          }}
        />

        {/* Subtle glow at top for ending color */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "200%",
            height: "40%",
            background: `radial-gradient(ellipse at center top, ${endingColors.glow} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "40px 28px 32px",
        }}>
          {/* Top section - The End label */}
          <p
            style={{
              color: endingColors.secondary,
              fontSize: "10px",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              textAlign: "center",
              marginBottom: "auto",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            The End
          </p>

          {/* Hero section - Ending title (BIG) */}
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h2
              style={{
                color: endingColors.primary,
                fontSize: "42px",
                fontFamily: "Georgia, serif",
                fontWeight: "normal",
                lineHeight: 1.1,
                marginBottom: "12px",
                textShadow: `0 0 40px ${endingColors.glow}`,
              }}
            >
              {config.title}
            </h2>

            {protagonistName && (
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "13px",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {protagonistName}&apos;s story with{" "}
                <span style={{ color: endingColors.primary }}>{archetypeName}</span>
              </p>
            )}
            {!protagonistName && (
              <p
                style={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontSize: "13px",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                with <span style={{ color: endingColors.primary }}>{archetypeName}</span>
              </p>
            )}
          </div>

          {/* Quote section */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              borderLeft: `3px solid ${endingColors.primary}`,
            }}
          >
            <p
              style={{
                color: "#f5f5f5",
                fontSize: "16px",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              &ldquo;{displayQuote}&rdquo;
            </p>
            {quoteAttribution && (
              <p
                style={{
                  color: endingColors.primary,
                  fontSize: "13px",
                  fontFamily: "Georgia, serif",
                  marginTop: "10px",
                  textAlign: "right",
                }}
              >
                — {quoteAttribution}
              </p>
            )}
          </div>

          {/* Bottom branding */}
          <div style={{ marginTop: "auto", textAlign: "center" }}>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.4)",
                fontSize: "11px",
                marginBottom: "12px",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {adventureTitle}
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
              <span
                style={{
                  color: endingColors.primary,
                  fontSize: "18px",
                  fontFamily: "Georgia, serif",
                }}
              >
                Lirae
              </span>
              <span
                style={{
                  color: "rgba(255, 255, 255, 0.35)",
                  fontSize: "10px",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                lirae.app
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-6 py-3 bg-wine hover:bg-wine-light disabled:bg-warm-gray text-cream font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isDownloading ? (
              "Saving..."
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Save Image
              </>
            )}
          </button>

          {canShare && (
            <button
              onClick={handleShare}
              disabled={isSharing}
              className="px-6 py-3 border border-wine text-wine hover:bg-wine hover:text-cream disabled:opacity-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSharing ? (
                "Sharing..."
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 p-6 border border-warm-gray rounded-xl bg-charcoal/30 text-center">
        <p className="text-cream font-serif text-lg mb-2">Give a friend their own adventure</p>
        <p className="text-cream-muted text-sm mb-4">
          Every reader gets a different story. Send them to find theirs.
        </p>
        <Link
          href={`/adventure/${adventureTitle === "The Kitchen" ? "the-kitchen" : "the-kitchen"}`}
          className="inline-block px-6 py-2 bg-transparent border border-cream-muted text-cream-muted hover:border-cream hover:text-cream rounded-lg transition-colors text-sm"
        >
          Send the link: lirae.app
        </Link>
      </div>

      {ending === "heartbreak" && (
        <div className="mt-6 p-4 border border-warm-gray rounded-lg bg-near-black/50 text-center">
          <p className="text-cream-muted text-sm mb-3">
            Want to try a different path?
          </p>
          <button
            onClick={handleRewind}
            disabled={isRewinding}
            className="px-6 py-2 border border-wine text-wine hover:bg-wine hover:text-cream disabled:opacity-50 rounded-lg transition-colors"
          >
            {isRewinding ? "Rewinding..." : "Rewind to Chapter 6"}
          </button>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/library"
          className="text-cream-muted hover:text-wine transition-colors text-sm"
        >
          &larr; Back to library
        </Link>
      </div>
    </div>
  );
}

interface Choice {
  id: string;
  text: string;
  tag: "open" | "guarded";
}

interface Chapter {
  number: number;
  prose: string;
  choices: Choice[] | null;
  sceneImageUrl: string | null;
  cardQuote: string | null;
  cardQuoteSpeaker: string | null;
}

interface Playthrough {
  id: string;
  adventure_id: string;
  adventure_title: string;
  vibe: string;
  archetype: string;
  spice: number;
  protagonist_name: string | null;
  current_chapter: number;
  choice_log: { id: string; text: string; tag: string }[];
  ending: string | null;
  final_words: string | null;
}

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const playthroughId = params.playthroughId as string;

  const [playthrough, setPlaythrough] = useState<Playthrough | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedProse, setStreamedProse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [finalWords, setFinalWords] = useState("");
  const [anonymousToken, setAnonymousToken] = useState<string | null>(null);
  const prefetchedRef = useRef<Map<number, boolean>>(new Map());

  // Get anonymous token from localStorage on mount
  // And auto-claim if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem(`lirae_anon_${playthroughId}`);
    setAnonymousToken(token);

    // Auto-claim playthrough if user came back from magic link
    async function autoClaimIfNeeded() {
      if (!token) return;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // User is authenticated and there's an anonymous token - claim it
        try {
          await fetch("/api/claim-playthrough", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playthroughId, anonymousToken: token }),
          });
          // Clear the anonymous token after claiming
          localStorage.removeItem(`lirae_anon_${playthroughId}`);
          setAnonymousToken(null);
        } catch (err) {
          console.error("Failed to auto-claim playthrough:", err);
        }
      }
    }

    autoClaimIfNeeded();
  }, [playthroughId]);

  const fetchPlaythrough = useCallback(async () => {
    try {
      const token = localStorage.getItem(`lirae_anon_${playthroughId}`);
      const url = token
        ? `/api/playthrough?id=${playthroughId}&token=${encodeURIComponent(token)}`
        : `/api/playthrough?id=${playthroughId}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          // Try without token for authenticated users
          const authRes = await fetch(`/api/playthrough?id=${playthroughId}`);
          if (authRes.ok) {
            const authData = await authRes.json();
            setPlaythrough(authData.playthrough);
            return authData.playthrough;
          }
          router.push("/auth/sign-in");
          return;
        }
        throw new Error(data.error || "Failed to load playthrough");
      }

      setPlaythrough(data.playthrough);
      return data.playthrough;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return null;
    }
  }, [playthroughId, router]);

  // Prefetch next chapter in background
  const prefetchNextChapter = useCallback(async (pt: Playthrough, nextChapterNo: number) => {
    if (prefetchedRef.current.has(nextChapterNo)) return;
    if (nextChapterNo > 10) return;

    prefetchedRef.current.set(nextChapterNo, true);

    const token = localStorage.getItem(`lirae_anon_${playthroughId}`);
    try {
      // Use non-streaming endpoint for prefetch (just to warm the cache)
      await fetch("/api/chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playthroughId: pt.id,
          chapterNo: nextChapterNo,
          anonymousToken: token,
        }),
      });
    } catch {
      // Silently fail prefetch
    }
  }, [playthroughId]);

  const fetchChapter = useCallback(async (pt: Playthrough) => {
    setIsLoadingChapter(true);
    setIsStreaming(false);
    setStreamedProse("");
    setError(null);
    setChapter(null);

    const token = localStorage.getItem(`lirae_anon_${playthroughId}`);

    try {
      const res = await fetch("/api/chapter/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playthroughId: pt.id,
          chapterNo: pt.current_chapter,
          anonymousToken: token,
        }),
      });

      // Check for JSON error responses (non-streaming)
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await res.json();
        if (data.code === "AUTH_REQUIRED") {
          setShowSignIn(true);
          setIsLoadingChapter(false);
          return;
        }
        if (data.code === "PAYWALL") {
          setShowPaywall(true);
          setIsLoadingChapter(false);
          return;
        }
        throw new Error(data.error || "Failed to load chapter");
      }

      if (!res.ok) {
        throw new Error("Failed to load chapter");
      }

      setShowPaywall(false);
      setShowSignIn(false);

      // Process the stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedProse = "";
      let sceneImageUrl = "";
      let fromCache = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "meta") {
                sceneImageUrl = data.sceneImageUrl;
                fromCache = data.fromCache;
                setIsLoadingChapter(false);
                setIsStreaming(!fromCache);
                // Set initial chapter with scene image
                setChapter({
                  number: pt.current_chapter,
                  prose: "",
                  choices: null,
                  sceneImageUrl,
                  cardQuote: null,
                  cardQuoteSpeaker: null,
                });
              } else if (data.type === "prose") {
                // Cached content - full prose at once
                accumulatedProse = data.text;
                setStreamedProse(data.text);
              } else if (data.type === "chunk") {
                // Streaming content - append chunk
                accumulatedProse += data.text;
                setStreamedProse(accumulatedProse);
              } else if (data.type === "choices") {
                // Generation complete
                setIsStreaming(false);
                setChapter({
                  number: pt.current_chapter,
                  prose: accumulatedProse,
                  choices: data.choices,
                  sceneImageUrl,
                  cardQuote: data.cardQuote || null,
                  cardQuoteSpeaker: data.cardQuoteSpeaker || null,
                });
                // Start prefetching next chapter
                prefetchNextChapter(pt, pt.current_chapter + 1);
              } else if (data.type === "error") {
                throw new Error(data.error);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue; // Skip malformed JSON
              throw e;
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoadingChapter(false);
      setIsStreaming(false);
    }
  }, [playthroughId, prefetchNextChapter]);

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const pt = await fetchPlaythrough();
      if (pt) {
        await fetchChapter(pt);
      }
      setIsLoading(false);
    }
    init();
  }, [fetchPlaythrough, fetchChapter]);

  // After sign-in, claim the playthrough and continue
  async function handleSignInSuccess() {
    const token = localStorage.getItem(`lirae_anon_${playthroughId}`);
    if (token) {
      try {
        // Claim the anonymous playthrough
        await fetch("/api/claim-playthrough", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ playthroughId, anonymousToken: token }),
        });
        // Clear the anonymous token
        localStorage.removeItem(`lirae_anon_${playthroughId}`);
        setAnonymousToken(null);
      } catch (err) {
        console.error("Failed to claim playthrough:", err);
      }
    }
    // Refresh to continue
    setShowSignIn(false);
    const pt = await fetchPlaythrough();
    if (pt) {
      await fetchChapter(pt);
    }
  }

  async function handleChoice(choice: Choice) {
    setSelectedChoice(choice);
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem(`lirae_anon_${playthroughId}`);
      const res = await fetch("/api/choice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playthroughId,
          choice,
          anonymousToken: token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "AUTH_REQUIRED") {
          setShowSignIn(true);
          setSelectedChoice(null);
          setIsSubmitting(false);
          return;
        }
        throw new Error(data.error || "Failed to submit choice");
      }

      setPlaythrough(data.playthrough);
      setChapter(null);
      setSelectedChoice(null);
      await fetchChapter(data.playthrough);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSelectedChoice(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <AgeGate>
        <main className="min-h-screen flex items-center justify-center">
          <p className="font-serif text-xl text-cream italic animate-pulse">
            Turning the page...
          </p>
        </main>
      </AgeGate>
    );
  }

  if (error && !chapter) {
    return (
      <AgeGate>
        <main className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="font-serif text-2xl text-cream mb-4">Something went wrong</h1>
            <p className="text-cream-muted mb-6">{error}</p>
            <Link href="/library" className="text-wine hover:underline">
              Back to library
            </Link>
          </div>
        </main>
      </AgeGate>
    );
  }

  return (
    <AgeGate>
      <main className="min-h-screen">
        {/* Sign In Modal */}
        {showSignIn && (
          <SignInModal
            playthroughId={playthroughId}
            onClose={() => setShowSignIn(false)}
            onSignInSuccess={handleSignInSuccess}
          />
        )}

        {/* Header */}
        <header className="sticky top-0 z-10 bg-near-black/95 backdrop-blur border-b border-warm-gray">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/library" className="text-cream-muted hover:text-wine transition-colors">
              &larr; Exit
            </Link>

            <div className="text-center">
              <span className="text-cream-muted text-sm">
                Chapter {playthrough?.current_chapter || 1} of 10
              </span>
              <div className="flex gap-1 justify-center mt-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-1 rounded-full ${
                      i < (playthrough?.current_chapter || 1)
                        ? "bg-wine"
                        : "bg-warm-gray"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-1" title={`Spice level ${playthrough?.spice}`}>
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i <= (playthrough?.spice || 1) ? "bg-wine" : "bg-warm-gray"
                  }`}
                />
              ))}
            </div>
          </div>
        </header>

        {/* Paywall */}
        {showPaywall && playthrough && (
          <Paywall
            adventureId={playthrough.adventure_id}
            adventureTitle={playthrough.adventure_title}
            playthroughId={playthroughId}
            currentChapter={playthrough.current_chapter}
          />
        )}

        {/* Scene Image */}
        {!showPaywall && !showSignIn && chapter?.sceneImageUrl && (
          <div className="w-full h-64 md:h-80 bg-charcoal relative overflow-hidden">
            <img
              src={chapter.sceneImageUrl}
              alt="Scene"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-near-black" />
          </div>
        )}

        {/* Chapter Content */}
        {!showPaywall && !showSignIn && (
        <article className="max-w-2xl mx-auto px-6 py-12">
          {isLoadingChapter && !chapter ? (
            <div className="text-center py-20">
              <p className="font-serif text-xl text-cream italic animate-pulse">
                Setting the scene...
              </p>
            </div>
          ) : chapter ? (
            <>
              {/* Prose - use streamedProse during streaming, chapter.prose after */}
              <div className="prose-lirae">
                {(isStreaming ? streamedProse : chapter.prose).split("\n\n").filter(p => p.trim()).map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
                {isStreaming && (
                  <span className="inline-block w-2 h-5 bg-wine animate-pulse ml-1" />
                )}
              </div>

              {/* Choices - only show when not streaming */}
              {!isStreaming && chapter.choices && chapter.choices.length > 0 && (
                <div className="mt-12 pt-8 border-t border-warm-gray">
                  <p className="text-cream-muted text-center mb-6 font-serif italic">
                    What do you do?
                  </p>
                  <div className="space-y-3">
                    {chapter.choices.map((choice) => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoice(choice)}
                        disabled={isSubmitting}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          selectedChoice?.id === choice.id
                            ? "border-wine bg-wine/20"
                            : "border-warm-gray hover:border-wine/50"
                        } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span className="text-cream">{choice.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No choices - Chapter 5 just continues */}
              {!isStreaming && (!chapter.choices || chapter.choices.length === 0) && playthrough && playthrough.current_chapter === 5 && (
                <div className="mt-12 pt-8 border-t border-warm-gray text-center">
                  <button
                    onClick={() => {
                      handleChoice({
                        id: "continue",
                        text: "Continue",
                        tag: "open",
                      });
                    }}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-wine hover:bg-wine-light disabled:bg-warm-gray text-cream font-medium rounded-lg transition-colors"
                  >
                    {isSubmitting ? "Turning the page..." : "Continue"}
                  </button>
                </div>
              )}

              {/* Chapter 9 - Free text input */}
              {!isStreaming && (!chapter.choices || chapter.choices.length === 0) && playthrough && playthrough.current_chapter === 9 && (
                <div className="mt-12 pt-8 border-t border-warm-gray">
                  <p className="text-cream text-center mb-4 font-serif italic text-lg">
                    Before everything changes — what do you say to him?
                  </p>
                  <textarea
                    value={finalWords}
                    onChange={(e) => setFinalWords(e.target.value)}
                    placeholder="Type what you want to say... or leave blank to let the moment speak for itself."
                    className="w-full px-4 py-3 bg-near-black border border-warm-gray rounded-lg text-cream placeholder:text-warm-gray focus:border-wine focus:outline-none transition-colors resize-none h-32 font-serif"
                  />
                  <div className="text-center mt-6">
                    <button
                      onClick={async () => {
                        setIsSubmitting(true);
                        try {
                          const token = localStorage.getItem(`lirae_anon_${playthroughId}`);
                          const res = await fetch("/api/choice", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              playthroughId,
                              choice: { id: "continue", text: "Continue", tag: "open" },
                              finalWords: finalWords.trim() || null,
                              anonymousToken: token,
                            }),
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.error);
                          setPlaythrough(data.playthrough);
                          setChapter(null);
                          await fetchChapter(data.playthrough);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Something went wrong");
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-wine hover:bg-wine-light disabled:bg-warm-gray text-cream font-medium rounded-lg transition-colors"
                    >
                      {isSubmitting ? "Writing your ending..." : "Say it"}
                    </button>
                  </div>
                </div>
              )}

              {/* End of story */}
              {!isStreaming && playthrough && playthrough.current_chapter === 10 && (!chapter?.choices || chapter.choices.length === 0) && (
                <EndingCard
                  ending={playthrough.ending}
                  vibe={playthrough.vibe}
                  archetype={playthrough.archetype}
                  adventureTitle={playthrough.adventure_title}
                  adventureId={playthrough.adventure_id}
                  heroName={playthrough.adventure_id === "the-kitchen" ? "Julian" : "Him"}
                  protagonistName={playthrough.protagonist_name}
                  cardQuote={chapter?.cardQuote || null}
                  cardQuoteSpeaker={chapter?.cardQuoteSpeaker || null}
                  playthroughId={playthroughId}
                />
              )}
            </>
          ) : null}

          {error && chapter && (
            <p className="text-wine text-center mt-6">{error}</p>
          )}
        </article>
        )}
      </main>
    </AgeGate>
  );
}
