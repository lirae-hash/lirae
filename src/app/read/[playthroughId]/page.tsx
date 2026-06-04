"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AgeGate } from "@/components/AgeGate";
import { Paywall } from "@/components/Paywall";

// Ending card component with HEA/HFN/Heartbreak specific styling
function EndingCard({ ending, playthroughId }: { ending: string | null; playthroughId: string }) {
  const router = useRouter();
  const [isRewinding, setIsRewinding] = useState(false);

  const endingConfig = {
    hea: {
      title: "Happily Ever After",
      subtitle: "You chose vulnerability. You chose him. And he chose you back.",
      gradient: "from-wine/20 to-rose-900/20",
      borderColor: "border-wine/50",
    },
    hfn: {
      title: "Happy For Now",
      subtitle: "The story isn't over. But right now, in this moment, you're together.",
      gradient: "from-amber-900/20 to-wine/20",
      borderColor: "border-amber-700/50",
    },
    heartbreak: {
      title: "Heartbreak",
      subtitle: "Some walls are built to protect. Some distances can't be closed. This is the ending you chose.",
      gradient: "from-slate-900/30 to-near-black",
      borderColor: "border-warm-gray",
    },
  };

  const config = endingConfig[ending as keyof typeof endingConfig] || endingConfig.hfn;

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
    <div className={`mt-12 pt-8 border-t ${config.borderColor}`}>
      <div className={`bg-gradient-to-b ${config.gradient} rounded-lg p-8 text-center`}>
        <p className="text-cream-muted uppercase tracking-widest text-xs mb-2">The End</p>
        <h2 className="font-serif text-3xl text-cream mb-3">{config.title}</h2>
        <p className="text-cream-muted font-serif italic max-w-md mx-auto mb-8">
          {config.subtitle}
        </p>

        {ending === "heartbreak" && (
          <div className="mb-8 p-4 border border-warm-gray rounded-lg bg-near-black/50">
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

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/library"
            className="px-8 py-3 bg-wine hover:bg-wine-light text-cream font-medium rounded-lg transition-colors"
          >
            Choose another adventure
          </Link>
        </div>
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
  spice: number;
  protagonist_name: string | null;
  current_chapter: number;
  choice_log: { id: string; text: string; tag: string }[];
  ending: string | null;
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
                <EndingCard ending={playthrough.ending} playthroughId={playthroughId} />
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
