/**
 * Supabase Auth client for server components and server actions.
 * Uses @supabase/ssr to handle cookie-based session management in Next.js 15.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function isConfigured(): boolean {
  return !!(supabaseUrl?.startsWith('http') && supabaseAnonKey);
}

export async function createAuthClient() {
  if (!isConfigured()) {
    throw new Error('Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Forward-compatible: some build-time contexts disallow cookie writes
        }
      },
    },
  });
}

/** Check if the current request has a valid Supabase session. */
export async function getSession() {
  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return data.session;
}

/** Get the authenticated user, if any. */
export async function getAuthUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/** Sign in with email and password. */
export async function signIn(email: string, password: string) {
  const supabase = await createAuthClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign out the current session. */
export async function signOut() {
  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
