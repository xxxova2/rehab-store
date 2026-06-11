import type { Product, Collection, Category } from '@rehab/types';
import { getSupabaseClient } from './supabase';
import productsJson from '@/data/products.json';
import collectionsJson from '@/data/collections.json';

/** Fallback JSON data used when Supabase is not configured. */
function jsonProducts(): Product[] {
  return productsJson as Product[];
}
function jsonCollections(): Collection[] {
  return collectionsJson as Collection[];
}

function products() {
  try {
    return getSupabaseClient().from('products') as any;
  } catch {
    return null;
  }
}

function collections() {
  try {
    return getSupabaseClient().from('collections') as any;
  } catch {
    return null;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const db = products();
  if (!db) return jsonProducts();

  const { data, error } = await db
    .select('data')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase query failed, falling back to JSON:', error.message);
    return jsonProducts();
  }

  const result = (data ?? []).map((row: any) => row.data as Product);
  if (result.length === 0) {
    console.warn('Supabase returned 0 products, falling back to JSON');
    return jsonProducts();
  }

  return result;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = products();
  if (!db) return jsonProducts().find((p) => p.slug === slug) ?? null;

  const { data, error } = await db
    .select('data')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return (data as any)?.data as Product ?? null;
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  const db = products();
  if (!db) return jsonProducts().filter((p) => p.category === category);

  const { data, error } = await db
    .select('data')
    .contains('data', { category });

  if (error) throw error;
  return (data ?? []).map((row: any) => row.data as Product);
}

export async function getProductsByCollection(collectionSlug: string): Promise<Product[]> {
  const db = products();
  if (!db) return jsonProducts().filter((p) => p.collection === collectionSlug);

  const { data, error } = await db
    .select('data')
    .contains('data', { collection: collectionSlug });

  if (error) throw error;
  return (data ?? []).map((row: any) => row.data as Product);
}

export async function getAllCollections(): Promise<Collection[]> {
  const db = collections();
  if (!db) return jsonCollections();

  const { data, error } = await db
    .select('data')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Supabase query failed, falling back to JSON:', error.message);
    return jsonCollections();
  }

  const result = (data ?? []).map((row: any) => row.data as Collection);
  if (result.length === 0) {
    console.warn('Supabase returned 0 collections, falling back to JSON');
    return jsonCollections();
  }

  return result;
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const db = collections();
  if (!db) return jsonCollections().find((c) => c.slug === slug) ?? null;

  const { data, error } = await db
    .select('data')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return (data as any)?.data as Collection ?? null;
}

export async function getRelatedProducts(
  productId: string,
  limit = 4,
): Promise<Product[]> {
  const product = await getProductBySlug(productId);
  if (!product) return [];
  const all = await getAllProducts();
  return all
    .filter((p) => p.id !== productId && (p.category === product.category || p.collection === product.collection))
    .slice(0, limit);
}

export async function getCatalogStats() {
  const all = await getAllProducts();
  return {
    totalProducts: all.length,
    byCategory: all.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1;
      return acc;
    }, {}),
  };
}
