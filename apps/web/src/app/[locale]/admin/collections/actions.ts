'use server';

import { revalidatePath } from 'next/cache';
import { createCollection, updateCollection, deleteCollection } from '@/lib/products';
import type { CreateCollectionInput } from '@/lib/products';

export async function createCollectionAction(locale: string, data: CreateCollectionInput) {
  await createCollection(data);
  revalidatePath(`/${locale}/admin/collections`);
  return { success: true };
}

export async function updateCollectionAction(locale: string, id: string, data: CreateCollectionInput) {
  await updateCollection(id, data);
  revalidatePath(`/${locale}/admin/collections`);
  return { success: true };
}

export async function deleteCollectionAction(locale: string, id: string) {
  await deleteCollection(id);
  revalidatePath(`/${locale}/admin/collections`);
  return { success: true };
}
