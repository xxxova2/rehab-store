import type { Product, Collection, Category, ProductImage, Currency } from '@rehab/types';
import { getSupabaseClient, getSupabaseAdmin } from './supabase';
import productsJson from '@/data/products.json';
import collectionsJson from '@/data/collections.json';

const localStore = new Map<string, Product>();

function getFs() {
  try { return { fs: require('fs'), path: require('path') }; } catch { return null; }
}

function loadPersistedProducts(): Product[] | null {
  try {
    const deps = getFs();
    if (!deps) return null;
    const DATA_FILE = '/tmp/products-data.json';
    if (deps.fs.existsSync(DATA_FILE)) {
      return JSON.parse(deps.fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch {}
  return null;
}

function persistProducts(): void {
  try {
    const deps = getFs();
    if (!deps) return;
    const DATA_FILE = '/tmp/products-data.json';
    const dir = deps.path.dirname(DATA_FILE);
    if (!deps.fs.existsSync(dir)) deps.fs.mkdirSync(dir, { recursive: true });
    deps.fs.writeFileSync(DATA_FILE, JSON.stringify(Array.from(localStore.values()), null, 2));
  } catch {}
}

function initLocalStore() {
  if (localStore.size === 0) {
    const persisted = loadPersistedProducts();
    const source = persisted ?? (productsJson as Product[]);
    for (const p of source) {
      localStore.set(p.id, p);
    }
  }
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

function adminDb() {
  try {
    return getSupabaseAdmin().from('products') as any;
  } catch {
    return null;
  }
}

function adminCollectionsDb() {
  try {
    return getSupabaseAdmin().from('collections') as any;
  } catch {
    return null;
  }
}

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    || `product-${Date.now()}`;
}

export async function getAllProducts(): Promise<Product[]> {
  const db = products();
  if (!db) {
    initLocalStore();
    return Array.from(localStore.values());
  }

  const { data, error } = await db
    .select('data')
    .order('created_at', { ascending: false });

  if (error) {
    initLocalStore();
    return Array.from(localStore.values());
  }

  const result = (data ?? []).map((row: any) => row.data as Product);
  if (result.length === 0) {
    initLocalStore();
    return Array.from(localStore.values());
  }

  return result;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const db = products();
  if (!db) {
    initLocalStore();
    return Array.from(localStore.values()).find((p) => p.slug === slug) ?? null;
  }

  const { data, error } = await db
    .select('data')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    initLocalStore();
    return Array.from(localStore.values()).find((p) => p.slug === slug) ?? null;
  }
  return (data as any)?.data as Product ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = products();
  if (!db) {
    initLocalStore();
    return Array.from(localStore.values()).find((p) => p.id === id) ?? null;
  }

  const { data, error } = await db
    .select('data')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    initLocalStore();
    return Array.from(localStore.values()).find((p) => p.id === id) ?? null;
  }
  return (data as any)?.data as Product ?? null;
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  const db = products();
  if (!db) {
    initLocalStore();
    return Array.from(localStore.values()).filter((p) => p.category === category);
  }

  const { data, error } = await db
    .select('data')
    .contains('data', { category });

  if (error) throw error;
  return (data ?? []).map((row: any) => row.data as Product);
}

export async function getProductsByCollection(collectionSlug: string): Promise<Product[]> {
  const db = products();
  if (!db) {
    initLocalStore();
    return Array.from(localStore.values()).filter((p) => p.collection === collectionSlug);
  }

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
    return jsonCollections();
  }

  const result = (data ?? []).map((row: any) => row.data as Collection);
  if (result.length === 0) return jsonCollections();

  return result;
}

function jsonCollections(): Collection[] {
  return collectionsJson as Collection[];
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

export interface CreateProductInput {
  title: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
  status: 'active' | 'draft';
  stock: number;
  category?: string;
  collection?: string;
}

export async function createProduct(data: CreateProductInput) {
  const id = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const slug = toSlug(data.title);

  const productData: Product = {
    id,
    slug,
    title: { en: data.title, ar: data.title },
    subtitle: { en: '', ar: '' },
    description: { en: data.description ?? '', ar: data.description ?? '' },
    category: (data.category ?? 'dresses') as Category,
    collection: data.collection ?? '',
    basePriceCents: Math.round(data.price * 100),
    baseCurrency: (data.currency || 'AED') as Currency,
    images: data.image
      ? [{ url: data.image, alt: { en: data.title, ar: data.title }, width: 1200, height: 1500 }]
      : [],
    sizes: ['S', 'M', 'L'],
    colors: [],
    materials: [],
    inStock: data.status === 'active',
    createdAt: new Date().toISOString(),
  };

  const db = adminDb();
  if (db) {
    const { error } = await db.insert({ id, slug, data: productData });
    if (error) throw error;
  } else {
    initLocalStore();
    localStore.set(id, productData);
    persistProducts();
  }

  return { product: productData };
}

export async function updateProduct(id: string, data: CreateProductInput) {
  const slug = toSlug(data.title);

  const patch: Record<string, any> = {
    title: { en: data.title, ar: data.title },
    subtitle: { en: '', ar: '' },
    description: { en: data.description ?? '', ar: data.description ?? '' },
      basePriceCents: Math.round(data.price * 100),
      baseCurrency: (data.currency || 'AED') as Currency,
    inStock: data.status === 'active',
  };

  if (data.image) {
    patch.images = [{ url: data.image, alt: { en: data.title, ar: data.title }, width: 1200, height: 1500 }];
  }

  const db = adminDb();
  if (db) {
    const { data: existing } = await db.select('data').eq('id', id).single();
    const merged = { ...(existing?.data ?? {}), ...patch };
    const { error } = await db.update({ slug, data: merged }).eq('id', id);
    if (error) throw error;
    return { product: merged };
  }

  initLocalStore();
  if (localStore.has(id)) {
    const existing = localStore.get(id)!;
    localStore.set(id, { ...existing, ...patch, slug });
  }
  persistProducts();
  return { product: localStore.get(id) };
}

export async function deleteProduct(id: string) {
  const db = adminDb();
  if (db) {
    const { error } = await db.delete().eq('id', id);
    if (error) throw error;
  } else {
    initLocalStore();
    localStore.delete(id);
    persistProducts();
  }
  return { success: true };
}

export interface CreateCollectionInput {
  title: string;
  description?: string;
  image?: string;
}

export async function createCollection(data: CreateCollectionInput) {
  const id = `col_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const slug = toSlug(data.title);

  const hero = data.image ? { url: data.image, alt: { en: data.title, ar: data.title }, width: 1200, height: 1500 } as ProductImage : undefined;

  const collectionData: Collection = {
    id,
    slug,
    title: { en: data.title, ar: data.title },
    description: { en: data.description ?? '', ar: data.description ?? '' },
    hero,
    productIds: [],
  };

  const db = adminCollectionsDb();
  if (db) {
    const { error } = await db.insert({ id, slug, data: collectionData });
    if (error) throw error;
  }

  return { collection: collectionData };
}

export async function updateCollection(id: string, data: CreateCollectionInput) {
  const slug = toSlug(data.title);

  const hero = data.image ? { url: data.image, alt: { en: data.title, ar: data.title }, width: 1200, height: 1500 } as ProductImage : undefined;

  const patch: Record<string, any> = {
    title: { en: data.title, ar: data.title },
    description: { en: data.description ?? '', ar: data.description ?? '' },
    hero: hero ?? null,
  };

  const db = adminCollectionsDb();
  if (db) {
    const { data: existing } = await db.select('data').eq('id', id).single();
    const merged = { ...(existing?.data ?? {}), ...patch };
    const { error } = await db.update({ slug, data: merged }).eq('id', id);
    if (error) throw error;
    return { collection: merged };
  }

  return { collection: patch };
}

export async function deleteCollection(id: string) {
  const db = adminCollectionsDb();
  if (db) {
    const { error } = await db.delete().eq('id', id);
    if (error) throw error;
  }
  return { success: true };
}
