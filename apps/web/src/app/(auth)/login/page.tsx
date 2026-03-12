'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate magic link send
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-surface-primary px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="text-2xl font-bold text-brand-500 block text-center mb-8">
          GateShare
        </Link>

        {!sent ? (
          <>
            <h1 className="text-2xl font-bold text-ink-900 text-center">Sign in</h1>
            <p className="mt-2 text-sm text-ink-500 text-center">
              We&rsquo;ll send you a magic link. No password needed.
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
              <button
                type="submit"
                disabled={loading || !email}
                className="gs-btn-primary w-full gap-2"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Send magic link
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-ink-400">
              No account? We&rsquo;ll create one automatically.
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-50 mb-6">
              <CheckCircle2 className="h-8 w-8 text-success-500" />
            </div>
            <h1 className="text-2xl font-bold text-ink-900">Check your email</h1>
            <p className="mt-2 text-sm text-ink-500">
              We sent a sign-in link to <strong className="text-ink-900">{email}</strong>
            </p>
            <p className="mt-4 text-xs text-ink-400">
              Didn&rsquo;t get it? Check spam or{' '}
              <button onClick={() => setSent(false)} className="text-brand-500 hover:underline">
                try again
              </button>
            </p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link href="/trip/new" className="text-sm text-ink-500 hover:text-brand-500 transition-colors">
            Skip sign-in and plan a trip &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
