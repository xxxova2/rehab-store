'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { adminFetch } from '../_lib/api';

const SETTINGS_PATH = 'src/app/[locale]/admin/_lib/store-settings.json';

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  defaultCurrency: string;
  defaultLocale: 'ar' | 'en';
  socialInstagram?: string;
  socialTikTok?: string;
  shippingFreeAed: number;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const fs = await import('fs/promises');
    const cwd = process.cwd();
    const data = await fs.readFile(`${cwd}/${SETTINGS_PATH}`, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      storeName: 'Rehab Store',
      storeEmail: 'hello@rehab.store',
      storePhone: '+971 4 123 4567',
      defaultCurrency: 'AED',
      defaultLocale: 'en',
      socialInstagram: '',
      socialTikTok: '',
      shippingFreeAed: 500,
    };
  }
}

export async function saveStoreSettingsAction(
  locale: string,
  _prevState: unknown,
  formData: FormData
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
    const fs = await import('fs/promises');
    const cwd = process.cwd();
    await fs.writeFile(`${cwd}/${SETTINGS_PATH}`, JSON.stringify(settings, null, 2), 'utf-8');
    revalidatePath(`/${locale}/admin/settings`);
    return { success: true };
  } catch (error) {
    console.error('Save settings error:', error);
    return { success: false, error: 'Failed to save settings' };
  }
}
