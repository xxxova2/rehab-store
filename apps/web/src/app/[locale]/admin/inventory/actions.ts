'use server';

import { getSupabaseAdmin, rowsAs, inventoryTable } from '@/lib/supabase';
import type { InventoryRow } from '@/lib/db-types';

import { getAllProducts } from '@/lib/products';

export async function getInventoryProducts() {
  return getAllProducts();
}

export async function getInventory(): Promise<InventoryRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await inventoryTable(supabase).select('*');
  if (error) throw new Error(error.message);
  return rowsAs<InventoryRow>(data);
}

export async function upsertInventory(productId: string, stock: Record<string, number>) {
  const supabase = getSupabaseAdmin();
  const { error } = await inventoryTable(supabase).upsert(
    { product_id: productId, stock },
    { onConflict: 'product_id' },
  );
  if (error) throw new Error(error.message);
  return { success: true };
}
