'use server';

import { cookies } from 'next/headers';

export async function adminLogin(email: string, password: string) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rehab.store';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (email !== adminEmail || password !== adminPassword) {
    throw new Error('Invalid email or password');
  }

  const cookieStore = await cookies();
  cookieStore.set('rehab_admin_token', 'authenticated', {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  });
  cookieStore.set('rehab_admin_email', email, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'lax',
  });
}
