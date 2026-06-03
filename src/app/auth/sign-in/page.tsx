"use client";

import { useState } from "react";
import { signInWithMagicLink } from "../actions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("email", email);

    const result = await signInWithMagicLink(formData);

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      router.push("/auth/check-email");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center mb-8">
          <h1 className="font-serif text-3xl text-wine">Lirae</h1>
        </Link>

        <div className="bg-charcoal rounded-lg p-8 border border-warm-gray">
          <h2 className="font-serif text-2xl text-cream mb-2 text-center">
            Welcome back
          </h2>
          <p className="text-cream-muted text-center mb-6">
            Enter your email to sign in with a magic link
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm text-cream-muted mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-near-black border border-warm-gray rounded-lg text-cream placeholder:text-warm-gray focus:border-wine focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="text-wine text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-wine hover:bg-wine-light disabled:bg-warm-gray text-cream font-medium rounded-lg transition-colors"
            >
              {isLoading ? "Sending link..." : "Send magic link"}
            </button>
          </form>

          <p className="text-center text-cream-muted text-sm mt-6">
            No account? One will be created for you automatically.
          </p>
        </div>

        <p className="text-center text-cream-muted text-xs mt-6">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="text-wine hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-wine hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>
  );
}
