'use server';

import { revalidatePath } from 'next/cache';
import { adminFetch } from '../_lib/api';
import type { ActionResult } from '../_lib/types';

export type { ActionResult };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function createCollectionAction(
  locale: string,
  formData: FormData
): Promise<ActionResult> {
  const title = (formData.get('title') as string) ?? '';
  const titleAr = (formData.get('title_ar') as string) ?? '';
  const descriptionAr = (formData.get('description_ar') as string) ?? '';
  const customHandle = ((formData.get('handle') as string) ?? '').trim();

  if (!title.trim()) {
    return { error: 'Title is required' };
  }

  const handle = customHandle.length > 0 ? customHandle : slugify(title);

  try {
    await adminFetch('/admin/collections', {
      method: 'POST',
      body: JSON.stringify({
        title,
        handle,
        metadata: {
          title_ar: titleAr,
          description_ar: descriptionAr,
        },
      }),
    });
  } catch (error) {
    console.error('Create collection error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to create collection',
    };
  }

  revalidatePath(`/${locale}/admin/collections`);
  return { success: true };
}

export async function updateCollectionAction(
  locale: string,
  collectionId: string,
  formData: FormData
): Promise<ActionResult> {
  const title = (formData.get('title') as string) ?? '';
  const titleAr = (formData.get('title_ar') as string) ?? '';
  const descriptionAr = (formData.get('description_ar') as string) ?? '';
  const customHandle = ((formData.get('handle') as string) ?? '').trim();

  if (!title.trim()) {
    return { error: 'Title is required' };
  }

  const handle = customHandle.length > 0 ? customHandle : slugify(title);

  try {
    await adminFetch(`/admin/collections/${collectionId}`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        handle,
        metadata: {
          title_ar: titleAr,
          description_ar: descriptionAr,
        },
      }),
    });
  } catch (error) {
    console.error('Update collection error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to update collection',
    };
  }

  revalidatePath(`/${locale}/admin/collections`);
  return { success: true };
}

export async function deleteCollectionAction(
  locale: string,
  collectionId: string
): Promise<ActionResult> {
  try {
    await adminFetch(`/admin/collections/${collectionId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Delete collection error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to delete collection',
    };
  }

  revalidatePath(`/${locale}/admin/collections`);
  return { success: true };
}
