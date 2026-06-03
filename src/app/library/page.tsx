import { AgeGate } from "@/components/AgeGate";
import Link from "next/link";

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

            {/* Placeholder for adventures - will be populated in M2 */}
            <div className="bg-charcoal rounded-lg p-12 border border-warm-gray text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-wine/20 flex items-center justify-center">
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
              <h2 className="font-serif text-xl text-cream mb-2">
                Adventures coming soon
              </h2>
              <p className="text-cream-muted">
                Our first stories are being prepared. Check back soon for your first romantic adventure.
              </p>
            </div>
          </div>
        </section>
      </main>
    </AgeGate>
  );
}
