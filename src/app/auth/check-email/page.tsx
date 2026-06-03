import Link from "next/link";

export default function CheckEmailPage() {
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h2 className="font-serif text-2xl text-cream mb-2">Check your email</h2>
          <p className="text-cream-muted mb-6">
            We&apos;ve sent you a magic link. Click the link in your email to sign in.
          </p>

          <p className="text-cream-muted text-sm">
            Didn&apos;t receive the email?{" "}
            <Link href="/auth/sign-in" className="text-wine hover:underline">
              Try again
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
