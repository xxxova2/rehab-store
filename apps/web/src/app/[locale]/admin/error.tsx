'use client';

import { useEffect } from 'react';
import { createBrowserAuthClient } from '@/lib/supabase-browser';

export default function AdminError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    const isAuthError =
      error.name === 'AdminAuthError' ||
      error.message.toLowerCase().includes('unauthorized') ||
      error.message.toLowerCase().includes('token') ||
      error.message.toLowerCase().includes('session');

    if (isAuthError) {
      const supabase = createBrowserAuthClient();
      supabase.auth.signOut().catch(() => {});
      const locale = window.location.pathname.startsWith('/ar/') ? 'ar' : 'en';
      window.location.replace(`/${locale}/admin/login`);
    }
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        color: 'var(--md-sys-color-on-surface, #1c1b1f)',
        background: 'var(--md-sys-color-surface, #fef7ff)',
      }}
    >
      <div>
        <p style={{ fontSize: '1rem', margin: 0 }}>
          {error.name === 'AdminAuthError'
            ? 'Session expired. Redirecting to login...'
            : 'Something went wrong. Please try again.'}
        </p>
      </div>
    </div>
  );
}
