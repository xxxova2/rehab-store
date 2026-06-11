'use client';

import { useCartStore } from '@/store/cart';

export function CartCount() {
  const count = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  if (count === 0) return null;
  return <span className="cart-count">{count}</span>;
}
