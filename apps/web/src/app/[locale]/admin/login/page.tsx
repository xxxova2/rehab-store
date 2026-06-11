'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from './actions';

export default function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin(email, password);
      router.push('/en/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-brand-base text-brand-text">
      <div className="absolute inset-0 bg-brand-glow opacity-40 pointer-events-none" />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl border border-brand-border/60 bg-glass backdrop-blur-xl shadow-glass p-8 space-y-6"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Admin login
          </h1>
          <p className="text-sm text-brand-muted">Sign in to manage products.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm text-brand-muted" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-brand-border/60 bg-glass px-3 py-2 text-brand-text placeholder:text-brand-muted outline-none transition focus:border-brand-accent"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-brand-muted" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-brand-border/60 bg-glass px-3 py-2 text-brand-text placeholder:text-brand-muted outline-none transition focus:border-brand-accent"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-accent px-3 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}