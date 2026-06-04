"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toPng } from "html-to-image";
import { AgeGate } from "@/components/AgeGate";
import { Paywall } from "@/components/Paywall";

// Archetype display names
const ARCHETYPE_NAMES: Record<string, string> = {
  brooding: "The Brooding Rival",
  cinnamon: "The Cinnamon Roll",
  rogue: "The Charming Rogue",
  protector: "The Fierce Protector",
  tortured: "The Tortured Soul",
  golden: "The Golden Boy",
};

// Ending configuration with fallback quotes
const ENDING_CONFIG = {
  hea: {
    title: "Happily Ever After",
    fallbackQuote: "I chose vulnerability. I chose him. And he chose me back.",
    emoji: "\u2728",
  },
  hfn: {
    title: "Happy For Now",
    fallbackQuote: "The story isn't over. But right now, in this moment, we're together.",
    emoji: "\u2764\uFE0F",
  },
  heartbreak: {
    title: "Heartbreak",
    fallbackQuote: "Some walls are built to protect. Some distances can't be closed.",
    emoji: "\uD83D\uDDA4",
  },
};

// Premium shareable ending card
function EndingCard({
  ending,
  vibe,
  archetype,
  adventureTitle,
  protagonistName,
  finalWords,
  lastLine,
  playthroughId,
}: {
  ending: string | null;
  vibe: string;
  archetype: string;
  adventureTitle: string;
  protagonistName: string | null;
  finalWords: string | null;
  lastLine: string | null;
  playthroughId: string;
}) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isRewinding, setIsRewinding] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const config = ENDING_CONFIG[ending as keyof typeof ENDING_CONFIG] || ENDING_CONFIG.hfn;
  const archetypeName = ARCHETYPE_NAMES[archetype] || "The Love Interest";

  // Determine the hero quote - prioritize user's final words, then last line, then fallback
  const heroQuote = finalWords || lastLine || config.fallbackQuote;

  // Check if Web Share API is available
  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  // Vibe-specific gradients for the card background (inline styles for image export)
  const vibeGradients: Record<string, string> = {
    dark: "linear-gradient(135deg, #1a1a2e 0%, #0f0f0f 50%, #16213e 100%)",
    gold: "linear-gradient(135deg, #3d2914 0%, #0f0f0f 50%, #4a3728 100%)",
    rose: "linear-gradient(135deg, #3d1a2e 0%, #0f0f0f 50%, #4a2840 100%)",
    sage: "linear-gradient(135deg, #1a3d2e 0%, #0f0f0f 50%, #284a40 100%)",
  };

  const vibeAccents: Record<string, string> = {
    dark: "#64748b",
    gold: "#d97706",
    rose: "#e11d48",
    sage: "#10b981",
  };

  async function handleDownload() {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#0f0f0f",
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
        backgroundColor: "#0f0f0f",
      });

      // Convert data URL to blob
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `lirae-${ending || "ending"}.png`, { type: "image/png" });

      await navigator.share({
        title: `My ${config.title} ending`,
        text: `I just finished "${adventureTitle}" on Lirae. ${heroQuote.slice(0, 100)}...`,
        files: [file],
      });
    } catch (err) {
      // User cancelled or share failed - not an error
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
      {/* ===== SHAREABLE CARD (exported as image) ===== */}
      <div
        ref={cardRef}
        style={{
          background: vibeGradients[vibe] || vibeGradients.dark,
          width: "100%",
          maxWidth: "400px",
          margin: "0 auto",
          padding: "48px 32px",
          borderRadius: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            background: `radial-gradient(circle at 30% 30%, ${vibeAccents[vibe] || vibeAccents.dark}15 0%, transparent 50%)`,
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          {/* The End label */}
          <p
            style={{
              color: vibeAccents[vibe] || vibeAccents.dark,
              fontSize: "11px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              marginBottom: "16px",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            The End
          </p>

          {/* Ending title */}
          <h2
            style={{
              color: "#f5f5dc",
              fontSize: "32px",
              fontFamily: "Georgia, serif",
              fontWeight: "normal",
              marginBottom: "8px",
              lineHeight: 1.2,
            }}
          >
            {config.title}
          </h2>

          {/* Protagonist name if provided */}
          {protagonistName && (
            <p
              style={{
                color: "#a8a29e",
                fontSize: "14px",
                marginBottom: "8px",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              {protagonistName}&apos;s story
            </p>
          )}

          {/* Archetype */}
          <p
            style={{
              color: "#a8a29e",
              fontSize: "14px",
              marginBottom: "32px",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            with{" "}
            <span style={{ color: "#8b2252", fontWeight: 500 }}>{archetypeName}</span>
          </p>

          {/* Hero quote - the star of the card */}
          <div
            style={{
              background: "rgba(139, 34, 82, 0.15)",
              borderRadius: "16px",
              padding: "24px 20px",
              marginBottom: "32px",
              borderLeft: `3px solid ${vibeAccents[vibe] || vibeAccents.dark}`,
            }}
          >
            <p
              style={{
                color: "#f5f5dc",
                fontSize: "18px",
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              &ldquo;{heroQuote}&rdquo;
            </p>
          </div>

          {/* Adventure title */}
          <p
            style={{
              color: "#78716c",
              fontSize: "12px",
              marginBottom: "24px",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {adventureTitle}
          </p>

          {/* Lirae branding */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span
              style={{
                color: "#8b2252",
                fontSize: "20px",
                fontFamily: "Georgia, serif",
              }}
            >
              Lirae
            </span>
            <span
              style={{
                color: "#57534e",
                fontSize: "11px",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              lirae.app
            </span>
          </div>
        </div>
      </div>

      {/* ===== SHARE ACTIONS ===== */}
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

      {/* ===== INVITE A FRIEND ===== */}
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

      {/* ===== REWIND (heartbreak only) ===== */}
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

      {/* ===== BACK TO LIBRARY ===== */}
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
  const [error, setError] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [finalWords, setFinalWords] = useState("");

  const fetchPlaythrough = useCallback(async () => {
    try {
      const res = await fetch(`/api/playthrough?id=${playthroughId}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
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

  const fetchChapter = useCallback(async (pt: Playthrough) => {
    setIsLoadingChapter(true);
    setError(null);

    try {
      const res = await fetch("/api/chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playthroughId: pt.id,
          chapterNo: pt.current_chapter,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "PAYWALL") {
          setShowPaywall(true);
          return;
        }
        throw new Error(data.error || "Failed to load chapter");
      }

      setShowPaywall(false);

      setChapter(data.chapter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoadingChapter(false);
    }
  }, []);

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

  async function handleChoice(choice: Choice) {
    setSelectedChoice(choice);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/choice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playthroughId,
          choice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit choice");
      }

      // Update playthrough and fetch next chapter
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
        {!showPaywall && chapter?.sceneImageUrl && (
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
        {!showPaywall && (
        <article className="max-w-2xl mx-auto px-6 py-12">
          {isLoadingChapter ? (
            <div className="text-center py-20">
              <p className="font-serif text-xl text-cream italic animate-pulse">
                Setting the scene...
              </p>
            </div>
          ) : chapter ? (
            <>
              {/* Prose */}
              <div className="prose-lirae">
                {chapter.prose.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {/* Choices */}
              {chapter.choices && chapter.choices.length > 0 && (
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
              {(!chapter.choices || chapter.choices.length === 0) && playthrough && playthrough.current_chapter === 5 && (
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

              {/* Chapter 9 - Free text input: "What do you say to him?" */}
              {(!chapter.choices || chapter.choices.length === 0) && playthrough && playthrough.current_chapter === 9 && (
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
                        // Save final words and advance
                        setIsSubmitting(true);
                        try {
                          const res = await fetch("/api/choice", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              playthroughId,
                              choice: { id: "continue", text: "Continue", tag: "open" },
                              finalWords: finalWords.trim() || null,
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

              {/* End of story - after chapter 10 with no choices */}
              {playthrough && playthrough.current_chapter === 10 && (!chapter?.choices || chapter.choices.length === 0) && (
                <EndingCard
                  ending={playthrough.ending}
                  vibe={playthrough.vibe}
                  archetype={playthrough.archetype}
                  adventureTitle={playthrough.adventure_title}
                  protagonistName={playthrough.protagonist_name}
                  finalWords={playthrough.final_words}
                  lastLine={chapter?.prose ? chapter.prose.split("\n\n").pop() || null : null}
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
