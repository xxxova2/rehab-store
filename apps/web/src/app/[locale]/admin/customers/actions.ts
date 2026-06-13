'use server';

import { getSupabaseAdmin, ordersTable } from '@/lib/supabase';
import type { OrderRow } from '@/lib/db-types';

export interface CustomerSummary {
  phone: string;
  name: string;
  orderCount: number;
  totalSpent: number;
  currency: string;
  lastOrder: string;
}

export async function getCustomers(): Promise<CustomerSummary[]> {
  const supabase = getSupabaseAdmin();
  const { data } = await ordersTable(supabase).select('*').order('created_at', { ascending: false });
  const orders = (data ?? []) as OrderRow[];

  const groups: Record<string, CustomerSummary> = {};
  for (const o of orders) {
    const phone = o.customer_phone ?? 'unknown';
    if (!groups[phone]) {
      groups[phone] = {
        phone,
        name: o.customer_name,
        orderCount: 0,
        totalSpent: 0,
        currency: o.currency ?? 'AED',
        lastOrder: o.created_at,
      };
    }
    groups[phone].orderCount++;
    groups[phone].totalSpent += Number(o.total_amount ?? 0);
    if (new Date(o.created_at) > new Date(groups[phone].lastOrder)) {
      groups[phone].lastOrder = o.created_at;
    }
  }
  return Object.values(groups).sort((a, b) => b.orderCount - a.orderCount);
}
