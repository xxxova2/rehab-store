'use server';

import { adminFetch, AdminAuthError } from '../_lib/api';
import type { ActionResult } from '../_lib/types';

let cachedLocationId: string | null = null;

interface StockLocationsResponse {
  stock_locations: Array<{ id: string; name: string }>;
}

async function fetchDefaultLocationId(): Promise<string | null> {
  if (cachedLocationId) {
    return cachedLocationId;
  }

  try {
    const data = await adminFetch<StockLocationsResponse>('/admin/stock-locations', {
      query: { limit: '1' },
    });
    const first = data.stock_locations?.[0];
    if (first) {
      cachedLocationId = first.id;
      return first.id;
    }
    return null;
  } catch (error) {
    if (error instanceof AdminAuthError) return null;
    console.error('Failed to fetch stock locations:', error);
    return null;
  }
}

export async function adjustStockAction(
  inventoryItemId: string | null,
  locationId: string | null,
  newStockedQty: number
): Promise<ActionResult<{ stocked_quantity: number }>> {
  if (!inventoryItemId) {
    return { error: 'No inventory item linked to this variant' };
  }

  let effectiveLocationId = locationId;
  if (!effectiveLocationId) {
    effectiveLocationId = await fetchDefaultLocationId();
  }

  if (!effectiveLocationId) {
    return { error: 'No stock location configured' };
  }

  try {
    await adminFetch(
      `/admin/inventory-items/${inventoryItemId}/location-levels/${effectiveLocationId}`,
      {
        method: 'POST',
        body: JSON.stringify({ stocked_quantity: newStockedQty }),
      }
    );

    return { success: true, data: { stocked_quantity: newStockedQty } };
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return { error: 'Admin session expired' };
    }
    console.error('Adjust stock error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to adjust stock',
    };
  }
}

export async function setReorderAtAction(
  productId: string,
  variantId: string,
  reorderAt: number
): Promise<ActionResult> {
  try {
    await adminFetch(`/admin/products/${productId}/variants/${variantId}`, {
      method: 'POST',
      body: JSON.stringify({
        metadata: { reorder_at: reorderAt },
      }),
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return { error: 'Admin session expired' };
    }
    console.error('Set reorder error:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to set reorder threshold',
    };
  }
}
