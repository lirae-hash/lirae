"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AgeGate } from "@/components/AgeGate";
import type { Vibe, SpiceLevel, HeroArchetype } from "@/types/database";

const VIBES: { id: Vibe; name: string; description: string }[] = [
  { id: "dark", name: "Dark Desire", description: "Moody, atmospheric, intimate shadows" },
  { id: "gold", name: "Golden Hour", description: "Warm light, soft edges, beauty in ordinary moments" },
  { id: "rose", name: "Midnight Rose", description: "Sensual, delicate, sweetness with depth" },
  { id: "sage", name: "Emerald Envy", description: "Earthy richness, tradition, lushness of place" },
];

const SPICE_LEVELS: { level: SpiceLevel; name: string; description: string }[] = [
  { level: 1, name: "Sweet Warmth", description: "Emotional tension, presence and voice" },
  { level: 2, name: "Warm Tension", description: "Charged glances, awareness of proximity" },
  { level: 3, name: "Slow Burn", description: "Electric, almost-touches, charged subtext" },
];

const ARCHETYPES: { id: HeroArchetype; name: string; fantasy: string }[] = [
  { id: "brooding", name: "The Brooding Rival", fantasy: "Thawing someone formidable who couldn't help falling for you" },
  { id: "cinnamon", name: "The Cinnamon Roll", fantasy: "Being adored without games, feeling completely safe" },
  { id: "rogue", name: "The Charming Rogue", fantasy: "Being delighted, laughing your way into love" },
  { id: "protector", name: "The Protector", fantasy: "Being safe, being someone's whole priority" },
  { id: "tortured", name: "The Tortured Soul", fantasy: "Being the one who earns the love no one else could" },
  { id: "golden", name: "The Golden Boy", fantasy: "Being chosen by the one everyone wants" },
];

// Adventure data (in production, this would come from DB)
const ADVENTURES: Record<string, { title: string; blurb: string }> = {
  "the-kitchen": {
    title: "The Kitchen",
    blurb: "A pastry chef with a score to settle. The chef who destroyed her reputation. One Michelin-starred kitchen. Paris.",
  },
};

export default function AdventureSetupPage() {
  const router = useRouter();
  const params = useParams();
  const adventureId = params.id as string;

  const [vibe, setVibe] = useState<Vibe | null>(null);
  const [archetype, setArchetype] = useState<HeroArchetype | null>(null);
  const [spice, setSpice] = useState<SpiceLevel | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const adventure = ADVENTURES[adventureId];

  async function handleStart() {
    if (!vibe || !archetype || !spice) {
      setError("Please select a vibe, archetype, and spice level");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/playthrough", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adventureId,
          vibe,
          archetype,
          spice,
          protagonistName: name.trim() || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start adventure");
      }

      // Store anonymous token if provided (for unauthenticated users)
      if (data.anonymousToken) {
        localStorage.setItem(`lirae_anon_${data.playthrough.id}`, data.anonymousToken);
      }

      // Redirect to reader
      router.push(`/read/${data.playthrough.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }

  if (!adventure) {
    return (
      <AgeGate>
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-2xl text-cream mb-4">Adventure not found</h1>
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
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <Link href="/library" className="text-cream-muted hover:text-wine transition-colors mb-8 inline-block">
            &larr; Back to library
          </Link>

          <h1 className="font-serif text-4xl text-cream mb-2">{adventure.title}</h1>
          <p className="text-cream-muted mb-8">{adventure.blurb}</p>

          {/* Vibe Selection */}
          <section className="mb-10">
            <h2 className="font-serif text-xl text-cream mb-4">Choose your vibe</h2>
            <div className="grid grid-cols-2 gap-4">
              {VIBES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVibe(v.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    vibe === v.id
                      ? "border-wine bg-wine/20"
                      : "border-warm-gray hover:border-wine/50"
                  }`}
                >
                  <span className="block font-medium text-cream mb-1">{v.name}</span>
                  <span className="text-sm text-cream-muted">{v.description}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Archetype Selection */}
          <section className="mb-10">
            <h2 className="font-serif text-xl text-cream mb-4">Who do you fall for?</h2>
            <div className="grid grid-cols-2 gap-3">
              {ARCHETYPES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setArchetype(a.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    archetype === a.id
                      ? "border-wine bg-wine/20"
                      : "border-warm-gray hover:border-wine/50"
                  }`}
                >
                  <span className="block font-medium text-cream mb-1">{a.name}</span>
                  <span className="text-xs text-cream-muted">{a.fantasy}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Spice Selection */}
          <section className="mb-10">
            <h2 className="font-serif text-xl text-cream mb-4">Set your spice level</h2>
            <div className="space-y-3">
              {SPICE_LEVELS.map((s) => (
                <button
                  key={s.level}
                  onClick={() => setSpice(s.level)}
                  className={`w-full p-4 rounded-lg border text-left transition-all flex items-center gap-4 ${
                    spice === s.level
                      ? "border-wine bg-wine/20"
                      : "border-warm-gray hover:border-wine/50"
                  }`}
                >
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i <= s.level ? "bg-wine" : "bg-warm-gray"
                        }`}
                      />
                    ))}
                  </div>
                  <div>
                    <span className="block font-medium text-cream">{s.name}</span>
                    <span className="text-sm text-cream-muted">{s.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Name Input */}
          <section className="mb-10">
            <h2 className="font-serif text-xl text-cream mb-4">Name your protagonist (optional)</h2>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Leave blank to remain unnamed"
              className="w-full px-4 py-3 bg-near-black border border-warm-gray rounded-lg text-cream placeholder:text-warm-gray focus:border-wine focus:outline-none transition-colors"
            />
            <p className="text-cream-muted text-sm mt-2">
              If unnamed, the story will refer to her as &quot;she&quot; throughout.
            </p>
          </section>

          {/* Error */}
          {error && (
            <p className="text-wine mb-4">{error}</p>
          )}

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={isLoading || !vibe || !archetype || !spice}
            className="w-full py-4 bg-wine hover:bg-wine-light disabled:bg-warm-gray disabled:cursor-not-allowed text-cream font-medium rounded-lg transition-colors text-lg"
          >
            {isLoading ? "Starting..." : "Begin your adventure"}
          </button>
        </div>
      </main>
    </AgeGate>
  );
}
