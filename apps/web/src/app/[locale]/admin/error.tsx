'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    if (error.name === 'AdminAuthError' || error.message.toLowerCase().includes('unauthorized') || error.message.toLowerCase().includes('token')) {
      document.cookie = 'rehab_admin_token=; Path=/; Max-Age=0; SameSite=Lax';
      document.cookie = 'rehab_admin_email=; Path=/; Max-Age=0; SameSite=Lax';
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
