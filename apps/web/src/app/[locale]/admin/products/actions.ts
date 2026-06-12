'use server';

import { createProduct as libCreate, updateProduct as libUpdate, deleteProduct as libDelete, getAllProducts } from '@/lib/products';
import type { CreateProductInput } from '@/lib/products';

export type AdminProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  image: string;
  status: 'active' | 'draft';
  stock: number;
};

function toAdminProduct(p: any): AdminProduct {
  return {
    id: p.id,
    title: typeof p.title === 'object' ? (p.title.en ?? p.title.ar ?? '') : (p.title ?? ''),
    description: typeof p.description === 'object' ? (p.description.en ?? '') : (p.description ?? ''),
    price: p.basePriceCents ? p.basePriceCents / 100 : 0,
    currency: p.baseCurrency ?? 'AED',
    image: p.images?.[0]?.url ?? '',
    status: p.inStock === false ? 'draft' : 'active',
    stock: 0,
  };
}

export async function getProducts(): Promise<AdminProduct[]> {
  const products = await getAllProducts();
  return products.map(toAdminProduct);
}

export async function createProduct(data: CreateProductInput) {
  return libCreate(data);
}

export async function updateProduct(id: string, data: CreateProductInput) {
  return libUpdate(id, data);
}

export async function deleteProduct(id: string) {
  return libDelete(id);
}
