/**
 * Supabase Auth client for client components.
 * Uses @supabase/ssr createBrowserClient.
 */
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createBrowserAuthClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
