"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AgeGate } from "@/components/AgeGate";

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
          // Handle paywall - redirect or show modal
          setError("Chapters 4-10 require purchase. Paywall coming in M5.");
          return;
        }
        throw new Error(data.error || "Failed to load chapter");
      }

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
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-wine border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-cream-muted">Loading your adventure...</p>
          </div>
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

        {/* Scene Image Placeholder */}
        {chapter?.sceneImageUrl && (
          <div className="w-full h-64 bg-charcoal">
            {/* Image will be added in M4 */}
          </div>
        )}

        {/* Chapter Content */}
        <article className="max-w-2xl mx-auto px-6 py-12">
          {isLoadingChapter ? (
            <div className="text-center py-20">
              <div className="w-8 h-8 border-2 border-wine border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-cream-muted">Generating chapter...</p>
              <p className="text-cream-muted/50 text-sm mt-2">This may take a moment</p>
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
                    What does she do?
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

              {/* No choices (beat 5, 9, 10) */}
              {(!chapter.choices || chapter.choices.length === 0) && playthrough && playthrough.current_chapter < 10 && (
                <div className="mt-12 pt-8 border-t border-warm-gray text-center">
                  <button
                    onClick={() => {
                      // For no-choice beats, advance with a placeholder choice
                      handleChoice({
                        id: "continue",
                        text: "Continue",
                        tag: "open",
                      });
                    }}
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-wine hover:bg-wine-light disabled:bg-warm-gray text-cream font-medium rounded-lg transition-colors"
                  >
                    {isSubmitting ? "Loading..." : "Continue"}
                  </button>
                </div>
              )}

              {/* End of story */}
              {playthrough && playthrough.current_chapter >= 10 && (
                <div className="mt-12 pt-8 border-t border-warm-gray text-center">
                  <p className="text-cream-muted font-serif italic mb-6">The end.</p>
                  <Link
                    href="/library"
                    className="inline-block px-8 py-3 bg-wine hover:bg-wine-light text-cream font-medium rounded-lg transition-colors"
                  >
                    Return to library
                  </Link>
                </div>
              )}
            </>
          ) : null}

          {error && chapter && (
            <p className="text-wine text-center mt-6">{error}</p>
          )}
        </article>
      </main>
    </AgeGate>
  );
}
