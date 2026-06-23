"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AgeGate } from "@/components/AgeGate";
import { getAdventureCard } from "@/lib/adventures";
import { track } from "@/lib/analytics";
import type { Vibe, SpiceLevel, HeroArchetype } from "@/types/database";

// Smart defaults — a new reader can start with zero choices.
const DEFAULT_SPICE: SpiceLevel = 2; // balanced
const DEFAULT_ARCHETYPE: HeroArchetype = "brooding";

const VIBES: { id: Vibe; name: string; mood: string }[] = [
  { id: "dark", name: "Dark and intense", mood: "Moody, atmospheric, shadows and slow burn" },
  { id: "gold", name: "Warm and hopeful", mood: "Golden light, soft edges, beauty in small moments" },
  { id: "rose", name: "Soft and sensual", mood: "Delicate, tender, sweetness with depth" },
  { id: "sage", name: "Lush and atmospheric", mood: "Earthy, rich, the weight of place and memory" },
];

const SPICE: { level: SpiceLevel; name: string; desc: string }[] = [
  { level: 1, name: "Slow and sweet", desc: "Emotional tension, presence and voice" },
  { level: 2, name: "Balanced", desc: "Charged glances, the awareness of how close he is" },
  { level: 3, name: "Turn it up", desc: "Electric, almost-touches, charged subtext" },
];

const ARCHETYPES: { id: HeroArchetype; name: string; fantasy: string }[] = [
  { id: "brooding", name: "Someone guarded who only softens for me", fantasy: "The Brooding Rival" },
  { id: "cinnamon", name: "Someone warm who makes me feel safe", fantasy: "The Cinnamon Roll" },
  { id: "rogue", name: "Someone who makes me laugh", fantasy: "The Charming Rogue" },
  { id: "protector", name: "Someone steady who'd protect me", fantasy: "The Protector" },
  { id: "tortured", name: "Someone tortured I could reach", fantasy: "The Tortured Soul" },
  { id: "golden", name: "Someone everyone wants — who wants me", fantasy: "The Golden Boy" },
];

type Mode = "home" | "quiz" | "customize";

export default function AdventureSetupPage() {
  const router = useRouter();
  const params = useParams();
  const adventureId = params.id as string;
  const adventure = getAdventureCard(adventureId);

  const [mode, setMode] = useState<Mode>("home");
  const [step, setStep] = useState(0);

  // Selections start at smart defaults — never null, so a reader can start anytime.
  const [vibe, setVibe] = useState<Vibe>(adventure?.defaultVibe ?? "dark");
  const [spice, setSpice] = useState<SpiceLevel>(DEFAULT_SPICE);
  const [archetype, setArchetype] = useState<HeroArchetype>(DEFAULT_ARCHETYPE);
  const [name, setName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const coverUrl = `${baseUrl}/storage/v1/object/public/scene-images/${adventureId}/arrival_dark.png`;

  async function start(overrides?: { vibe?: Vibe; spice?: SpiceLevel; archetype?: HeroArchetype; name?: string }) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/playthrough", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adventureId,
          vibe: overrides?.vibe ?? vibe,
          spice: overrides?.spice ?? spice,
          archetype: overrides?.archetype ?? archetype,
          protagonistName: (overrides?.name ?? name).trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start adventure");
      if (data.anonymousToken) {
        localStorage.setItem(`lirae_anon_${data.playthrough.id}`, data.anonymousToken);
      }
      // Funnel: a reader committed to a story. Settings only — no name/prose.
      track("adventure_started", {
        adventure_id: adventureId,
        vibe: overrides?.vibe ?? vibe,
        spice: overrides?.spice ?? spice,
        archetype: overrides?.archetype ?? archetype,
      });
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
            <Link href="/library" className="text-wine hover:underline">Back to library</Link>
          </div>
        </main>
      </AgeGate>
    );
  }

  // One reusable single-choice screen (one decision at a time, never stacked).
  function ChoiceScreen<T>({
    title, subtitle, options, selected, onPick, columns = 1,
  }: {
    title: string;
    subtitle?: string;
    options: { key: T; label: string; hint?: string }[];
    selected: T;
    onPick: (v: T) => void;
    columns?: 1 | 2;
  }) {
    return (
      <div>
        <h2 className="font-serif text-2xl text-cream mb-1">{title}</h2>
        {subtitle && <p className="text-cream-muted text-sm mb-6">{subtitle}</p>}
        <div className={`grid gap-3 ${columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          {options.map((o) => (
            <button
              key={String(o.key)}
              onClick={() => onPick(o.key)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selected === o.key ? "border-wine bg-wine/20" : "border-warm-gray hover:border-wine/50"
              }`}
            >
              <span className="block font-medium text-cream">{o.label}</span>
              {o.hint && <span className="text-sm text-cream-muted">{o.hint}</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <AgeGate>
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => (mode === "home" ? router.push("/library") : (setMode("home"), setStep(0)))}
            className="text-cream-muted hover:text-wine transition-colors mb-8 inline-block text-sm"
          >
            &larr; {mode === "home" ? "Back to library" : "Back"}
          </button>

          {/* HOME — pick a path. Start is one tap. */}
          {mode === "home" && (
            <div>
              <div className="aspect-[3/2] rounded-xl overflow-hidden mb-6 relative">
                <img src={coverUrl} alt={adventure.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-near-black via-near-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <span className="px-2 py-1 bg-wine/90 text-cream text-xs rounded">{adventure.trope}</span>
                  <h1 className="font-serif text-3xl text-cream mt-2">{adventure.title}</h1>
                </div>
              </div>
              <p className="text-cream-muted mb-8">{adventure.blurb}</p>

              <button
                onClick={() => start()}
                disabled={isLoading}
                className="w-full py-4 bg-wine hover:bg-wine-light disabled:bg-warm-gray text-cream font-medium rounded-lg transition-colors text-lg mb-3"
              >
                {isLoading ? "Starting…" : "Start reading"}
              </button>
              <p className="text-center text-cream-muted text-xs mb-6">
                Jumps straight in with a balanced mood. You can shape it instead:
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { setMode("quiz"); setStep(0); }}
                  className="flex-1 py-3 bg-transparent border border-wine text-wine hover:bg-wine/10 rounded-lg transition-colors"
                >
                  Help me choose
                </button>
                <button
                  onClick={() => { setMode("customize"); setStep(0); }}
                  className="flex-1 py-3 bg-transparent border border-warm-gray text-cream-muted hover:border-cream hover:text-cream rounded-lg transition-colors"
                >
                  Customize every detail
                </button>
              </div>
              {error && <p className="text-wine mt-4 text-center">{error}</p>}
            </div>
          )}

          {/* QUIZ — 3 mood questions, one at a time. */}
          {mode === "quiz" && (
            <div>
              <div className="flex gap-1.5 mb-8">
                {[0, 1, 2].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-wine" : "bg-warm-gray"}`} />
                ))}
              </div>

              {step === 0 && (
                <ChoiceScreen<Vibe>
                  title="What are you in the mood for tonight?"
                  options={VIBES.map((v) => ({ key: v.id, label: v.name, hint: v.mood }))}
                  selected={vibe}
                  onPick={(v) => { setVibe(v); setStep(1); }}
                />
              )}
              {step === 1 && (
                <ChoiceScreen<SpiceLevel>
                  title="How much heat?"
                  options={SPICE.map((s) => ({ key: s.level, label: s.name, hint: s.desc }))}
                  selected={spice}
                  onPick={(s) => { setSpice(s); setStep(2); }}
                />
              )}
              {step === 2 && (
                <ChoiceScreen<HeroArchetype>
                  title="Who do you want to fall for?"
                  options={ARCHETYPES.map((a) => ({ key: a.id, label: a.name, hint: a.fantasy }))}
                  selected={archetype}
                  onPick={(a) => { setArchetype(a); start({ archetype: a }); }}
                />
              )}
              {isLoading && <p className="text-cream-muted text-center mt-6">Starting your story…</p>}
              {error && <p className="text-wine mt-4 text-center">{error}</p>}
            </div>
          )}

          {/* CUSTOMIZE — every detail, still one at a time, all pre-defaulted. */}
          {mode === "customize" && (
            <div>
              <div className="flex gap-1.5 mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-wine" : "bg-warm-gray"}`} />
                ))}
              </div>

              {step === 0 && (
                <ChoiceScreen<Vibe>
                  title="Choose your vibe"
                  subtitle="Pre-set to this story's mood — change it or keep it."
                  columns={2}
                  options={VIBES.map((v) => ({ key: v.id, label: v.name, hint: v.mood }))}
                  selected={vibe}
                  onPick={setVibe}
                />
              )}
              {step === 1 && (
                <ChoiceScreen<HeroArchetype>
                  title="Who do you fall for?"
                  columns={2}
                  options={ARCHETYPES.map((a) => ({ key: a.id, label: a.fantasy, hint: a.name }))}
                  selected={archetype}
                  onPick={setArchetype}
                />
              )}
              {step === 2 && (
                <ChoiceScreen<SpiceLevel>
                  title="Set your spice level"
                  options={SPICE.map((s) => ({ key: s.level, label: s.name, hint: s.desc }))}
                  selected={spice}
                  onPick={setSpice}
                />
              )}
              {step === 3 && (
                <div>
                  <h2 className="font-serif text-2xl text-cream mb-1">Name your protagonist</h2>
                  <p className="text-cream-muted text-sm mb-6">Optional — leave blank to stay unnamed.</p>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Leave blank to remain unnamed"
                    className="w-full px-4 py-3 bg-near-black border border-warm-gray rounded-lg text-cream placeholder:text-warm-gray focus:border-wine focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="px-6 py-3 border border-warm-gray text-cream-muted hover:text-cream rounded-lg transition-colors"
                  >
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    className="flex-1 py-3 bg-wine hover:bg-wine-light text-cream font-medium rounded-lg transition-colors"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={() => start()}
                    disabled={isLoading}
                    className="flex-1 py-3 bg-wine hover:bg-wine-light disabled:bg-warm-gray text-cream font-medium rounded-lg transition-colors"
                  >
                    {isLoading ? "Starting…" : "Begin your adventure"}
                  </button>
                )}
              </div>
              {error && <p className="text-wine mt-4 text-center">{error}</p>}
            </div>
          )}
        </div>
      </main>
    </AgeGate>
  );
}
