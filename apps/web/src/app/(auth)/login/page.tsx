'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Login failed');
        setLoading(false);
        return;
      }

      // Session cookie is set by the server — redirect to profile
      router.push('/profile');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-primary px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-2xl font-bold text-brand-500 block text-center mb-8">
          Boarding
        </Link>

        <h1 className="text-2xl font-bold text-ink-900 text-center">Sign in</h1>
        <p className="mt-2 text-sm text-ink-500 text-center">
          Enter your email to sign in. In demo mode this creates a session instantly.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="gs-label">Email address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-400" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="gs-input pl-12"
                required
                autoFocus
              />
            </div>
            <p className="mt-1.5 text-xs text-ink-400">
              Use a .edu email to unlock campus community features
            </p>
          </div>

          {error && (
            <p className="text-sm text-error-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="gs-btn-primary w-full gap-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Sign in
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-400">
          No account? We&rsquo;ll create one automatically.
        </p>

        <div className="mt-12 text-center">
          <Link href="/trip/new" className="text-sm text-ink-500 hover:text-brand-500 transition-colors">
            Skip sign-in and plan a trip &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
