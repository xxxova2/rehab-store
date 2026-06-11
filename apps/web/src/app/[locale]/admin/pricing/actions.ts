'use server';
import { adminFetch } from '../_lib/api';
export async function getPricingAction() {
  try {
    const data = await adminFetch<any>('/admin/pricing-lists?limit=10');
    return data;
  } catch { return null; }
}
