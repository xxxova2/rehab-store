import type { Product, Collection, Category, ProductImage, Currency } from '@rehab/types';
import {
  getSupabaseClient, getSupabaseAdmin,
  productsTable, inventoryTable, collectionsTable,
  rowsAs, rowAs,
} from './supabase';

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
  const { data, error } = await productsTable(getSupabaseClient())
    .select('data')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch products: ${error.message}`);
  const rows = rowsAs<{ data: Product }>(data);
  return rows.map((r) => r.data);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await productsTable(getSupabaseClient())
    .select('data')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
  const row = rowAs<{ data: Product }>(data);
  return row?.data ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await productsTable(getSupabaseClient())
    .select('data')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch product: ${error.message}`);
  }
  const row = rowAs<{ data: Product }>(data);
  return row?.data ?? null;
}

export async function getProductsByCategory(category: Category): Promise<Product[]> {
  const { data, error } = await productsTable(getSupabaseClient())
    .select('data')
    .contains('data', { category });

  if (error) throw new Error(`Failed to fetch products: ${error.message}`);
  const rows = rowsAs<{ data: Product }>(data);
  return rows.map((r) => r.data);
}

export async function getProductsByCollection(collectionSlug: string): Promise<Product[]> {
  const { data, error } = await productsTable(getSupabaseClient())
    .select('data')
    .contains('data', { collection: collectionSlug });

  if (error) throw new Error(`Failed to fetch products: ${error.message}`);
  const rows = rowsAs<{ data: Product }>(data);
  return rows.map((r) => r.data);
}

export async function getAllCollections(): Promise<Collection[]> {
  const { data, error } = await collectionsTable(getSupabaseClient())
    .select('data')
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch collections: ${error.message}`);
  const rows = rowsAs<{ data: Collection }>(data);
  return rows.map((r) => r.data);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const { data, error } = await collectionsTable(getSupabaseClient())
    .select('data')
    .eq('slug', slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Failed to fetch collection: ${error.message}`);
  }
  const row = rowAs<{ data: Collection }>(data);
  return row?.data ?? null;
}

export async function getRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  const product = await getProductById(productId);
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
  titleAr?: string;
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
    title: { en: data.title, ar: data.titleAr || data.title },
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

  const { error: productError } = await productsTable(getSupabaseAdmin()).insert({
    id, slug, data: productData,
  });
  if (productError) throw new Error(`Failed to create product: ${productError.message}`);

  const stockMap = { S: 0, M: 0, L: 0 };
  const { error: invError } = await inventoryTable(getSupabaseAdmin()).insert({
    product_id: id,
    stock: stockMap,
  });
  if (invError) throw new Error(`Failed to create inventory: ${invError.message}`);

  return { product: productData };
}

export async function updateProduct(id: string, data: CreateProductInput) {
  // Fetch existing product data first — needed for title fallback and slug
  const { data: existing } = await productsTable(getSupabaseAdmin()).select('data').eq('id', id).single();
  const existingData = existing?.data as Product | undefined;

  const patch: Partial<Product> = {
    basePriceCents: Math.round(data.price * 100),
    baseCurrency: (data.currency || 'AED') as Currency,
    inStock: data.status === 'active',
  };

  if (data.title) {
    // Use explicit titleAr if provided, otherwise preserve existing Arabic title or fallback to English
    const ar = data.titleAr || existingData?.title?.ar || data.title;
    patch.title = { en: data.title, ar };
  }

  if (data.description !== undefined) {
    patch.description = { en: data.description, ar: data.description };
  }

  if (data.image) {
    patch.images = [{ url: data.image, alt: { en: data.title, ar: data.title }, width: 1200, height: 1500 }];
  }

  if (data.category) {
    patch.category = data.category as Category;
  }

  if (data.collection) {
    patch.collection = data.collection;
  }

  const merged = { ...(existingData ?? {}), ...patch };

  const slug = data.title ? toSlug(data.title) : (existingData?.slug ?? id);

  const { error } = await productsTable(getSupabaseAdmin()).update({ slug, data: merged as Product }).eq('id', id);
  if (error) throw new Error(`Failed to update product: ${error.message}`);

  return { product: merged };
}

export async function deleteProduct(id: string) {
  const { error: invError } = await inventoryTable(getSupabaseAdmin()).delete().eq('product_id', id);
  if (invError) throw new Error(`Failed to delete inventory: ${invError.message}`);

  const { error } = await productsTable(getSupabaseAdmin()).delete().eq('id', id);
  if (error) throw new Error(`Failed to delete product: ${error.message}`);

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

  const hero = data.image
    ? { url: data.image, alt: { en: data.title, ar: data.title }, width: 1200, height: 1500 } as ProductImage
    : undefined;

  const collectionData: Collection = {
    id, slug,
    title: { en: data.title, ar: data.title },
    description: { en: data.description ?? '', ar: data.description ?? '' },
    hero, productIds: [],
  };

  const { error } = await collectionsTable(getSupabaseAdmin()).insert({ id, slug, data: collectionData });
  if (error) throw new Error(`Failed to create collection: ${error.message}`);

  return { collection: collectionData };
}

export async function updateCollection(id: string, data: CreateCollectionInput) {
  const slug = toSlug(data.title);
  const hero = data.image
    ? { url: data.image, alt: { en: data.title, ar: data.title }, width: 1200, height: 1500 } as ProductImage
    : undefined;

  const patch: Partial<Collection> = {
    title: { en: data.title, ar: data.title },
    description: { en: data.description ?? '', ar: data.description ?? '' },
    hero: hero ?? undefined,
  };

  const { data: existing } = await collectionsTable(getSupabaseAdmin()).select('data').eq('id', id).single();
  const merged = { ...(existing?.data ?? {}), ...patch };
  const { error } = await collectionsTable(getSupabaseAdmin()).update({ slug, data: merged as Collection }).eq('id', id);
  if (error) throw new Error(`Failed to update collection: ${error.message}`);

  return { collection: merged };
}

export async function deleteCollection(id: string) {
  const { error } = await collectionsTable(getSupabaseAdmin()).delete().eq('id', id);
  if (error) throw new Error(`Failed to delete collection: ${error.message}`);
  return { success: true };
}
