import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isConfigured(): boolean {
  return !!(supabaseUrl?.startsWith('http') && supabaseAnonKey && supabaseServiceKey);
}

let serviceClient: ReturnType<typeof createClient> | null = null;
let anonClient: ReturnType<typeof createClient> | null = null;

function getAdmin() {
  if (!serviceClient) {
    serviceClient = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { persistSession: false },
    });
  }
  return serviceClient;
}

function getAnon() {
  if (!anonClient) {
    anonClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: false },
    });
  }
  return anonClient;
}

/** Server-only client with service role. Throws if Supabase not configured. */
export function getSupabaseAdmin() {
  if (!isConfigured()) throw new Error('Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  return getAdmin();
}

/** Client with anon key. Throws if Supabase not configured. */
export function getSupabaseClient() {
  if (!isConfigured()) throw new Error('Supabase not configured — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return getAnon();
}
