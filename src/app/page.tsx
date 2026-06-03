import { AgeGate } from "@/components/AgeGate";
import Link from "next/link";

export default function Home() {
  return (
    <AgeGate>
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
          <div className="max-w-2xl">
            <h1 className="font-serif text-5xl md:text-7xl text-wine mb-4">
              Lirae
            </h1>
            <p className="font-serif text-xl md:text-2xl text-cream mb-2 italic">
              Interactive Romance
            </p>
            <p className="text-cream-muted text-lg md:text-xl mb-8">
              Choose your story. Fall in love.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/library"
                className="px-8 py-4 bg-wine hover:bg-wine-light text-cream font-medium rounded-lg transition-colors text-lg"
              >
                Start Reading
              </Link>
              <Link
                href="/auth/sign-in"
                className="px-8 py-4 bg-transparent border border-wine hover:bg-wine/10 text-wine font-medium rounded-lg transition-colors text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <svg
              className="w-6 h-6 text-cream-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-charcoal">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-cream text-center mb-12">
              Your choices shape the story
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-wine/20 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-wine"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-cream mb-2">10 Chapters</h3>
                <p className="text-cream-muted">
                  Each adventure unfolds across ten carefully crafted chapters of emotionally rich prose.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-wine/20 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-wine"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-cream mb-2">Your Choices</h3>
                <p className="text-cream-muted">
                  Every decision matters. Will you guard your heart or let yourself be vulnerable?
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-wine/20 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-wine"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-serif text-xl text-cream mb-2">Three Endings</h3>
                <p className="text-cream-muted">
                  Happily Ever After, Happy For Now, or Heartbreak — your journey determines the destination.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-cream text-center mb-12">
              How it works
            </h2>

            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-wine flex items-center justify-center text-cream font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-serif text-xl text-cream mb-1">Choose your adventure</h3>
                  <p className="text-cream-muted">
                    Browse our library of romantic adventures, each with a unique setting and story.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-wine flex items-center justify-center text-cream font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-serif text-xl text-cream mb-1">Set your vibe</h3>
                  <p className="text-cream-muted">
                    Pick your aesthetic — dark and moody, golden warmth, soft rose, or earthy sage — and set your spice level.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-wine flex items-center justify-center text-cream font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-serif text-xl text-cream mb-1">Read and choose</h3>
                  <p className="text-cream-muted">
                    Immerse yourself in the story. At key moments, make choices that reveal who you are — and shape where the romance leads.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-wine flex items-center justify-center text-cream font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-serif text-xl text-cream mb-1">Discover your ending</h3>
                  <p className="text-cream-muted">
                    Your choices throughout the story determine your ending. Replay to explore different paths and outcomes.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/library"
                className="inline-block px-8 py-4 bg-wine hover:bg-wine-light text-cream font-medium rounded-lg transition-colors text-lg"
              >
                Explore Adventures
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-warm-gray">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-2xl text-wine mb-4">Lirae</h2>
            <p className="text-cream-muted mb-6">
              Interactive romance for adults who love to read.
            </p>
            <div className="flex justify-center gap-6 text-sm text-cream-muted">
              <Link href="/terms" className="hover:text-wine transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-wine transition-colors">
                Privacy Policy
              </Link>
              <Link href="/auth/sign-in" className="hover:text-wine transition-colors">
                Sign In
              </Link>
            </div>
            <p className="text-cream-muted/50 text-xs mt-8">
              Adults only (18+). Content is mature but not explicit.
            </p>
          </div>
        </footer>
      </main>
    </AgeGate>
  );
}
