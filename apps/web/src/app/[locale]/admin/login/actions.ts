'use server';

import { cookies } from 'next/headers';

export async function adminLogin(email: string, password: string) {
  const base = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000';
  const origin = base.startsWith('http') ? base : `http://${base}`;

  const res = await fetch(`${origin}/auth/user/emailpass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!res.ok) {
    let message = 'Unable to sign in.';
    try {
      const data = await res.json();
      if (typeof data?.message === 'string') message = data.message;
    } catch {
      // leave default message if body isn't JSON
    }
    throw new Error(message);
  }

  const data = await res.json().catch(() => ({}));
  const token = data?.token as string | undefined;

  if (!token) {
    throw new Error('Missing token from backend');
  }

  const cookieStore = await cookies();
  cookieStore.set('rehab_admin_token', String(token), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  });
}
