'use server';

import { createProduct as libCreate, updateProduct as libUpdate, deleteProduct as libDelete, getAllProducts } from '@/lib/products';
import type { CreateProductInput } from '@/lib/products';
import type { Product } from '@rehab/types';
import fs from 'fs';
import path from 'path';

const DATA_FILE = '/tmp/products-data.json';

function loadPersisted(): Product[] | null {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }
  } catch {}
  return null;
}

function persistAll(products: Product[]) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
  } catch {}
}

async function getAllProductsWithPersist(): Promise<Product[]> {
  const persisted = loadPersisted();
  if (persisted && persisted.length > 0) return persisted;
  const all = await getAllProducts();
  return all as unknown as Product[];
}

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
  const products = await getAllProductsWithPersist();
  return products.map(toAdminProduct);
}

export async function createProduct(data: CreateProductInput) {
  const result = await libCreate(data);
  const all = await getAllProductsWithPersist();
  persistAll(all);
  return result;
}

export async function updateProduct(id: string, data: CreateProductInput) {
  const result = await libUpdate(id, data);
  const all = await getAllProductsWithPersist();
  persistAll(all);
  return result;
}

export async function deleteProduct(id: string) {
  const result = await libDelete(id);
  const all = await getAllProductsWithPersist();
  persistAll(all);
  return result;
}
