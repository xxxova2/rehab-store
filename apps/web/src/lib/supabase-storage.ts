'use server';

import { getSupabaseAdmin } from './supabase';

const BUCKET = 'product-images';

/** Upload an image to Supabase Storage. Returns the public URL. */
export async function uploadProductImage(
  formData: FormData,
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(fileName);

  return publicUrl.publicUrl;
}

/** Delete an image from Supabase Storage. */
export async function deleteProductImage(url: string): Promise<void> {
  const fileName = url.split('/').pop();
  if (!fileName) return;

  const supabase = getSupabaseAdmin();
  await supabase.storage.from(BUCKET).remove([fileName]);
}
