import { AgeGate } from "@/components/AgeGate";
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
        {/* Header */}
        <header className="py-6 px-4 border-b border-warm-gray">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/" className="font-serif text-2xl text-wine">
              Lirae
            </Link>
            <Link
              href="/auth/sign-in"
              className="text-cream-muted hover:text-wine transition-colors"
            >
              Sign In
            </Link>
          </div>
        </header>

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
              {ADVENTURES.map((adventure) => (
                <Link
                  key={adventure.id}
                  href={`/adventure/${adventure.id}`}
                  className="group bg-charcoal rounded-lg border border-warm-gray hover:border-wine/50 transition-all overflow-hidden"
                >
                  {/* Cover Image Placeholder */}
                  <div className="aspect-[3/2] bg-near-black relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-warm-gray"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    {/* Trope Tag */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-wine/90 text-cream text-xs rounded">
                        {adventure.trope}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h2 className="font-serif text-xl text-cream group-hover:text-wine transition-colors mb-2">
                      {adventure.title}
                    </h2>
                    <p className="text-cream-muted text-sm line-clamp-2">
                      {adventure.blurb}
                    </p>
                    <div className="mt-4 flex items-center text-wine text-sm font-medium">
                      <span>Start reading</span>
                      <svg
                        className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
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
                  </div>
                </Link>
              ))}
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
