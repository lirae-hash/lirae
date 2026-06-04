import { AgeGate } from "@/components/AgeGate";
import { Header } from "@/components/Header";
import Link from "next/link";

// In production, this would come from the database
const ADVENTURES = [
  {
    id: "the-kitchen",
    title: "The Kitchen",
    trope: "Enemies to Lovers",
    blurb: "A pastry chef with a score to settle. The chef who destroyed her reputation. One Michelin-starred kitchen. Paris.",
    coverImageUrl: null,
  },
];

export default function LibraryPage() {
  return (
    <AgeGate>
      <main className="min-h-screen">
        <Header />

        {/* Library Content */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl text-cream mb-2">
              Adventure Library
            </h1>
            <p className="text-cream-muted mb-12">
              Choose your next romantic adventure
            </p>

            {/* Adventures Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {ADVENTURES.map((adventure) => {
                // Use scene image as cover - arrival_dark is a good default
                const coverUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/scene-images/${adventure.id}/arrival_dark.png`;

                return (
                  <Link
                    key={adventure.id}
                    href={`/adventure/${adventure.id}`}
                    className="group bg-charcoal rounded-lg border border-warm-gray hover:border-wine/50 transition-all overflow-hidden"
                  >
                    {/* Cover Image from Scene Images */}
                    <div className="aspect-[3/2] bg-near-black relative overflow-hidden">
                      {/* Scene image background */}
                      <img
                        src={coverUrl}
                        alt={adventure.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Dark gradient overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-near-black via-near-black/40 to-transparent" />

                      {/* Trope Tag */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-wine/90 text-cream text-xs rounded">
                          {adventure.trope}
                        </span>
                      </div>

                      {/* Title overlay at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h2 className="font-serif text-2xl text-cream group-hover:text-wine transition-colors mb-1">
                          {adventure.title}
                        </h2>
                        <p className="text-cream-muted text-sm line-clamp-2">
                          {adventure.blurb}
                        </p>
                      </div>
                    </div>

                    {/* CTA */}
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

            {/* More Coming Soon */}
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
