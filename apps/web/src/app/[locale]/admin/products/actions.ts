'use server';

import { getSupabaseAdmin } from '@/lib/supabase';
import localProducts from '@/data/products.json';

type AdminProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  status: 'active' | 'draft';
  stock: number;
};

/** In-memory store used when Supabase is not configured. */
const localStore: Map<string, any> = new Map();

function initStore() {
  if (localStore.size === 0) {
    for (const p of (localProducts as any[])) {
      localStore.set(p.id, { ...p });
    }
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

function toAdminProduct(row: any): AdminProduct {
  const d = row.data ?? {};
  return {
    id: row.id,
    title: typeof d.title === 'object' ? (d.title.en ?? d.title.ar ?? '') : (d.title ?? ''),
    description: typeof d.description === 'object' ? (d.description.en ?? '') : (d.description ?? ''),
    price: d.basePriceCents ? d.basePriceCents / 100 : 0,
    currency: d.baseCurrency ?? 'AED',
    image: d.images?.[0]?.url ?? '',
    status: d.inStock === false ? 'draft' : 'active',
    stock: 0,
  };
}

export async function getProducts(): Promise<AdminProduct[]> {
  try {
    const { data, error } = await (getSupabaseAdmin().from('products') as any)
      .select('id, data')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toAdminProduct);
  } catch {
    initStore();
    return Array.from(localStore.values()).map(toAdminProduct);
  }
}

export async function createProduct(data: {
  title: string; description?: string; price: number;
  currency: string; image?: string; status: 'active' | 'draft'; stock: number;
}) {
  const id = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    const slug = toSlug(data.title);

    const productData = {
      id,
      slug,
      title: { en: data.title, ar: data.title },
      subtitle: { en: '', ar: '' },
      description: { en: data.description ?? '', ar: data.description ?? '' },
      category: 'dresses',
      basePriceCents: Math.round(data.price * 100),
      baseCurrency: data.currency || 'AED',
      images: data.image
        ? [{ url: data.image, alt: { en: data.title, ar: data.title }, width: 1200, height: 1500 }]
        : [],
      sizes: ['S', 'M', 'L'],
      colors: [],
      materials: [],
      inStock: data.status === 'active',
      createdAt: new Date().toISOString(),
    };

    const { error } = await (getSupabaseAdmin().from('products') as any).insert({ id, slug, data: productData });
    if (error) throw error;
    return { product: productData };
  } catch {
    initStore();
    const product = { id, ...data };
    localStore.set(id, product);
    return { product };
  }
}

export async function updateProduct(id: string, data: {
  title: string; description?: string; price: number;
  currency: string; image?: string; status: 'active' | 'draft'; stock: number;
}) {
  try {
    const db = getSupabaseAdmin().from('products') as any;
    const slug = toSlug(data.title);

    const patch: Record<string, any> = {
      title: { en: data.title, ar: data.title },
      description: { en: data.description ?? '', ar: data.description ?? '' },
      basePriceCents: Math.round(data.price * 100),
      baseCurrency: data.currency || 'AED',
      inStock: data.status === 'active',
    };

    if (data.image) {
      patch.images = [{ url: data.image, alt: { en: data.title, ar: data.title }, width: 1200, height: 1500 }];
    }

    const { data: existing } = await db.select('data').eq('id', id).single();
    const merged = { ...(existing?.data ?? {}), ...patch };

    const { error } = await db.update({ slug, data: merged }).eq('id', id);
    if (error) throw error;
    return { product: merged };
  } catch {
    initStore();
    if (localStore.has(id)) {
      localStore.set(id, { ...localStore.get(id), ...data });
    }
    return { product: localStore.get(id) };
  }
}

export async function deleteProduct(id: string) {
  try {
    const { error } = await (getSupabaseAdmin().from('products') as any).delete().eq('id', id);
    if (error) throw error;
  } catch {
    initStore();
    localStore.delete(id);
  }
  return { success: true };
}
