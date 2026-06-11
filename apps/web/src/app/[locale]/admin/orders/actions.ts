'use server';
import { adminFetch } from '../_lib/api';
export async function getOrdersAction() {
  try {
    const data = await adminFetch<any>('/admin/orders?limit=10');
    return data;
  } catch { return null; }
}
