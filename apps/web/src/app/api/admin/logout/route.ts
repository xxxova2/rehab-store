import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Dynamically import to avoid bundling server-only code in client bundles
    const { signOut } = await import('@/lib/supabase-auth');
    await signOut();
  } catch {
    // Even if Supabase signOut fails, clear the local state
  }

  // Also clear the legacy Medusa token cookie if present
  const response = NextResponse.json({ ok: true });
  response.cookies.delete('rehab_admin_token');

  return response;
}
