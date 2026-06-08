"use client";

import { useState, useEffect } from "react";
import { AgeGate } from "@/components/AgeGate";
import { Header } from "@/components/Header";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ADVENTURE_CATALOG } from "@/lib/adventures";

const ENDING_LABELS: Record<string, string> = {
  hea: "Happily Ever After",
  hfn: "Happy For Now",
  heartbreak: "Heartbreak",
};

const VISIBLE_IN_PROGRESS = 3;

interface Playthrough {
  id: string;
  adventure_id: string;
  adventure_title: string;
  current_chapter: number;
  vibe: string;
  archetype: string;
  protagonist_name: string | null;
  ending: string | null;
  updated_at: string;
}

export default function LibraryPage() {
  const [playthroughs, setPlaythroughs] = useState<Playthrough[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllInProgress, setShowAllInProgress] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlaythroughs() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("playthroughs")
        .select("id, adventure_id, current_chapter, vibe, archetype, protagonist_name, ending, updated_at, adventures(title)")
        .eq("reader_id", user.id)
        .order("updated_at", { ascending: false });

      if (data) {
        setPlaythroughs(
          data.map((p: { adventures?: { title: string } | null } & Omit<Playthrough, "adventure_title">) => ({
            ...p,
            adventure_title: p.adventures?.title || "Unknown Adventure",
          }))
        );
      }
      setIsLoading(false);
    }

    fetchPlaythroughs();
  }, []);

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const inProgress = playthroughs.filter((p) => p.current_chapter < 10);
  const finished = playthroughs.filter((p) => p.current_chapter >= 10);
  const visibleInProgress = showAllInProgress ? inProgress : inProgress.slice(0, VISIBLE_IN_PROGRESS);

  async function handleDelete(id: string) {
    if (!confirm("Remove this story from your library? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/playthrough?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPlaythroughs((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Couldn't remove that story. Please try again.");
      }
    } catch {
      alert("Couldn't remove that story. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  function PlaythroughRow({ playthrough, variant }: { playthrough: Playthrough; variant: "progress" | "finished" }) {
    const sceneUrl = `${baseUrl}/storage/v1/object/public/scene-images/${playthrough.adventure_id}/arrival_${playthrough.vibe}.png`;
    const isDeleting = deletingId === playthrough.id;

    return (
      <div className="group relative flex items-center gap-3 bg-charcoal rounded-lg border border-warm-gray hover:border-wine/50 transition-all">
        <Link href={`/read/${playthrough.id}`} className="flex items-center gap-4 p-4 flex-1 min-w-0">
          {/* Scene thumbnail */}
          <div className="w-20 h-14 rounded overflow-hidden flex-shrink-0">
            <img src={sceneUrl} alt="" className="w-full h-full object-cover" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-serif text-lg text-cream group-hover:text-wine transition-colors truncate">
              {playthrough.adventure_title}
            </h3>
            {variant === "progress" ? (
              <p className="text-cream-muted text-sm">
                Chapter {playthrough.current_chapter} of 10
                {playthrough.protagonist_name && <span className="ml-2">· as {playthrough.protagonist_name}</span>}
              </p>
            ) : (
              <p className="text-cream-muted text-sm">
                Complete
                {playthrough.ending && <span className="ml-2">· {ENDING_LABELS[playthrough.ending] || playthrough.ending}</span>}
              </p>
            )}

            {/* Progress bar (in-progress only) */}
            {variant === "progress" && (
              <div className="flex gap-0.5 mt-2">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-sm ${i < playthrough.current_chapter ? "bg-wine" : "bg-warm-gray"}`}
                  />
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* Remove button */}
        <button
          onClick={() => handleDelete(playthrough.id)}
          disabled={isDeleting}
          aria-label="Remove from library"
          title="Remove from library"
          className="flex-shrink-0 mr-3 p-2 rounded-md text-warm-gray hover:text-wine hover:bg-near-black/50 transition-colors disabled:opacity-40"
        >
          {isDeleting ? (
            <span className="block w-5 h-5 border-2 border-warm-gray border-t-wine rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    );
  }

  return (
    <AgeGate>
      <main className="min-h-screen">
        <Header />

        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl text-cream mb-2">Adventure Library</h1>
            <p className="text-cream-muted mb-8">Choose your next romantic adventure</p>

            {/* Continue Reading Section */}
            {!isLoading && inProgress.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-xl text-cream">Continue Reading</h2>
                  {inProgress.length > VISIBLE_IN_PROGRESS && (
                    <button
                      onClick={() => setShowAllInProgress((v) => !v)}
                      className="text-sm text-wine hover:text-wine-light transition-colors"
                    >
                      {showAllInProgress ? "Show less" : `See all (${inProgress.length})`}
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {visibleInProgress.map((p) => (
                    <PlaythroughRow key={p.id} playthrough={p} variant="progress" />
                  ))}
                </div>
              </div>
            )}

            {/* Finished Section */}
            {!isLoading && finished.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-xl text-cream mb-4">Finished</h2>
                <div className="space-y-3">
                  {finished.map((p) => (
                    <PlaythroughRow key={p.id} playthrough={p} variant="finished" />
                  ))}
                </div>
              </div>
            )}

            {/* Adventures Grid */}
            <h2 className="font-serif text-xl text-cream mb-4">
              {inProgress.length > 0 || finished.length > 0 ? "Start a New Adventure" : "Available Adventures"}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {ADVENTURE_CATALOG.map((adventure) => {
                const coverUrl = `${baseUrl}/storage/v1/object/public/scene-images/${adventure.id}/arrival_dark.png`;

                return (
                  <Link
                    key={adventure.id}
                    href={`/adventure/${adventure.id}`}
                    className="group bg-charcoal rounded-lg border border-warm-gray hover:border-wine/50 transition-all overflow-hidden"
                  >
                    <div className="aspect-[3/2] bg-near-black relative overflow-hidden">
                      <img
                        src={coverUrl}
                        alt={adventure.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-near-black via-near-black/40 to-transparent" />

                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-wine/90 text-cream text-xs rounded">{adventure.trope}</span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-serif text-2xl text-cream group-hover:text-wine transition-colors mb-1">
                          {adventure.title}
                        </h3>
                        <p className="text-cream-muted text-sm line-clamp-2">{adventure.blurb}</p>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <span className="text-wine text-sm font-medium">Start reading</span>
                      <svg className="w-4 h-4 text-wine group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <p className="text-cream-muted">More adventures coming soon.</p>
            </div>
          </div>
        </section>
      </main>
    </AgeGate>
  );
}
