"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  showLogo?: boolean;
}

export function Header({ showLogo = true }: HeaderProps) {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    }
    checkAuth();

    // Listen for auth changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="py-6 px-4 border-b border-warm-gray">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {showLogo && (
          <Link href="/" className="font-serif text-2xl text-wine">
            Lirae
          </Link>
        )}

        <div className="flex items-center gap-4">
          {isLoading ? (
            <span className="text-cream-muted text-sm">...</span>
          ) : user ? (
            <Link
              href="/library"
              className="text-cream-muted hover:text-wine transition-colors text-sm"
            >
              My Library
            </Link>
          ) : (
            <Link
              href="/auth/sign-in"
              className="text-cream-muted hover:text-wine transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
