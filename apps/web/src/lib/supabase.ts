import { createClient } from '@supabase/supabase-js';
import type { Database } from './db-types';

type DbTable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T];

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

// ── Typed table accessors ────────────────────────────────────────────
// Cast the untyped `.from()` at the boundary so downstream code is
// fully typed via db-types.ts.

type SupabaseClient = ReturnType<typeof createClient>;

function typedTable<T extends keyof Database['public']['Tables']>(
  client: SupabaseClient,
  table: T,
) {
  // We use `as any` once here at the boundary — all downstream code is typed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (client.from as any)(table);
  return raw as {
    select: (cols?: string) => any;
    insert: (data: DbTable<T>['Insert']) => any;
    update: (data: DbTable<T>['Update']) => any;
    upsert: (data: DbTable<T>['Insert'], opts?: any) => any;
    delete: () => any;
    eq: (col: string, val: any) => any;
    single: () => Promise<{ data: DbTable<T>['Row'] | null; error: any }>;
    order: (col: string, opts?: any) => any;
  };
}

/** Typed accessor for the `products` table. */
export function productsTable(client: SupabaseClient) {
  return typedTable(client, 'products');
}

/** Typed accessor for the `collections` table. */
export function collectionsTable(client: SupabaseClient) {
  return typedTable(client, 'collections');
}

/** Typed accessor for the `inventory` table. */
export function inventoryTable(client: SupabaseClient) {
  return typedTable(client, 'inventory');
}

/** Typed accessor for the `orders` table. */
export function ordersTable(client: SupabaseClient) {
  return typedTable(client, 'orders');
}

/** Typed accessor for the `admin_users` table. */
export function adminUsersTable(client: SupabaseClient) {
  return typedTable(client, 'admin_users');
}

/** Typed accessor for the `store_settings` table. */
export function storeSettingsTable(client: SupabaseClient) {
  return typedTable(client, 'store_settings');
}

// ── Result casting helpers ───────────────────────────────────────────

/** Cast a Supabase query result array to a typed array. */
export function rowsAs<T>(data: unknown): T[] {
  return (data ?? []) as T[];
}

/** Cast a single Supabase query result row. */
export function rowAs<T>(data: unknown): T | null {
  return data as T | null;
}
