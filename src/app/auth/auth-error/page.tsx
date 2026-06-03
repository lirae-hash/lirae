import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="block mb-8">
          <h1 className="font-serif text-3xl text-wine">Lirae</h1>
        </Link>

        <div className="bg-charcoal rounded-lg p-8 border border-warm-gray">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="font-serif text-2xl text-cream mb-2">
            Something went wrong
          </h2>
          <p className="text-cream-muted mb-6">
            We couldn&apos;t sign you in. The link may have expired or already been used.
          </p>

          <Link
            href="/auth/sign-in"
            className="inline-block px-6 py-3 bg-wine hover:bg-wine-light text-cream font-medium rounded-lg transition-colors"
          >
            Try again
          </Link>
        </div>
      </div>
    </main>
  );
}
