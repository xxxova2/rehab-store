'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdmin, storeSettingsTable } from '@/lib/supabase';

import type { StoreSettingsData } from '@/lib/db-types';

export type StoreSettings = StoreSettingsData;

const DEFAULTS: StoreSettings = {
  storeName: 'Rehab Store',
  storeEmail: 'hello@rehab.store',
  storePhone: '+971 4 123 4567',
  defaultCurrency: 'AED',
  defaultLocale: 'en',
  socialInstagram: '',
  socialTikTok: '',
  shippingFreeAed: 500,
};

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await storeSettingsTable(supabase)
      .select('data')
      .eq('id', 'default')
      .single();

    if (error || !data?.data) return DEFAULTS;
    return { ...DEFAULTS, ...data.data } as StoreSettings;
  } catch {
    return DEFAULTS;
  }
}

export async function saveStoreSettingsAction(
  locale: string,
  _prevState: unknown,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  const storeName = (formData.get('storeName') as string) ?? '';
  const storeEmail = (formData.get('storeEmail') as string) ?? '';
  const storePhone = (formData.get('storePhone') as string) ?? '';
  const defaultCurrency = (formData.get('defaultCurrency') as string) ?? 'AED';
  const defaultLocale = (formData.get('defaultLocale') as 'ar' | 'en') ?? 'en';
  const socialInstagram = (formData.get('socialInstagram') as string) ?? '';
  const socialTikTok = (formData.get('socialTikTok') as string) ?? '';
  const shippingFreeAed = parseInt((formData.get('shippingFreeAed') as string) ?? '0', 10) || 0;

  const settings: StoreSettings = {
    storeName,
    storeEmail,
    storePhone,
    defaultCurrency,
    defaultLocale,
    socialInstagram,
    socialTikTok,
    shippingFreeAed,
  };

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await storeSettingsTable(supabase).upsert(
      { id: 'default', data: settings },
      { onConflict: 'id' },
    );

    if (error) throw new Error(error.message);

    revalidatePath(`/${locale}/admin/settings`);
    return { success: true };
  } catch (error) {
    console.error('Save settings error:', error);
    return { success: false, error: 'Failed to save settings' };
  }
}
