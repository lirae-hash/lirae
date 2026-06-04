"use client";

import { useState, useEffect } from "react";
import { AgeGate } from "@/components/AgeGate";
import { Header } from "@/components/Header";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const ADVENTURES = [
  {
    id: "the-kitchen",
    title: "The Kitchen",
    trope: "Enemies to Lovers",
    blurb: "A pastry chef with a score to settle. The chef who destroyed her reputation. One Michelin-starred kitchen. Paris.",
  },
];

interface InProgressPlaythrough {
  id: string;
  adventure_id: string;
  adventure_title: string;
  current_chapter: number;
  vibe: string;
  archetype: string;
  protagonist_name: string | null;
  updated_at: string;
}

export default function LibraryPage() {
  const [inProgress, setInProgress] = useState<InProgressPlaythrough[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInProgress() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("playthroughs")
        .select("id, adventure_id, current_chapter, vibe, archetype, protagonist_name, updated_at, adventures(title)")
        .eq("reader_id", user.id)
        .lt("current_chapter", 10)
        .order("updated_at", { ascending: false });

      if (data) {
        setInProgress(data.map((p: { adventures?: { title: string } | null } & Omit<InProgressPlaythrough, "adventure_title">) => ({
          ...p,
          adventure_title: p.adventures?.title || "Unknown Adventure",
        })));
      }
      setIsLoading(false);
    }

    fetchInProgress();
  }, []);

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <AgeGate>
      <main className="min-h-screen">
        <Header />

        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl text-cream mb-2">
              Adventure Library
            </h1>
            <p className="text-cream-muted mb-8">
              Choose your next romantic adventure
            </p>

            {/* Continue Reading Section */}
            {!isLoading && inProgress.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-xl text-cream mb-4">Continue Reading</h2>
                <div className="space-y-3">
                  {inProgress.map((playthrough) => {
                    const sceneUrl = `${baseUrl}/storage/v1/object/public/scene-images/${playthrough.adventure_id}/arrival_${playthrough.vibe}.png`;

                    return (
                      <Link
                        key={playthrough.id}
                        href={`/read/${playthrough.id}`}
                        className="group flex items-center gap-4 p-4 bg-charcoal rounded-lg border border-warm-gray hover:border-wine/50 transition-all"
                      >
                        {/* Scene thumbnail */}
                        <div className="w-20 h-14 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={sceneUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-lg text-cream group-hover:text-wine transition-colors truncate">
                            {playthrough.adventure_title}
                          </h3>
                          <p className="text-cream-muted text-sm">
                            Chapter {playthrough.current_chapter} of 10
                            {playthrough.protagonist_name && (
                              <span className="ml-2">· as {playthrough.protagonist_name}</span>
                            )}
                          </p>
                        </div>

                        {/* Progress bar */}
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-4 rounded-sm ${
                                  i < playthrough.current_chapter ? "bg-wine" : "bg-warm-gray"
                                }`}
                              />
                            ))}
                          </div>
                          <svg
                            className="w-5 h-5 text-wine group-hover:translate-x-1 transition-transform"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Adventures Grid */}
            <h2 className="font-serif text-xl text-cream mb-4">
              {inProgress.length > 0 ? "Start a New Adventure" : "Available Adventures"}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {ADVENTURES.map((adventure) => {
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
                        <span className="px-2 py-1 bg-wine/90 text-cream text-xs rounded">
                          {adventure.trope}
                        </span>
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="font-serif text-2xl text-cream group-hover:text-wine transition-colors mb-1">
                          {adventure.title}
                        </h3>
                        <p className="text-cream-muted text-sm line-clamp-2">
                          {adventure.blurb}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between">
                      <span className="text-wine text-sm font-medium">Start reading</span>
                      <svg
                        className="w-4 h-4 text-wine group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-12 text-center">
              <p className="text-cream-muted">
                More adventures coming soon.
              </p>
            </div>
          </div>
        </section>
      </main>
    </AgeGate>
  );
}
