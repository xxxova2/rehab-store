'use client';

import { useState, useEffect } from 'react';
import { getAllProducts } from '@/lib/products';

interface InventoryItem {
  id: string;
  title: string;
  stock: boolean;
  price: number;
  currency: string;
  image: string;
  category: string;
}

const s = {
  page: { padding: '1.5rem' },
  header: { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, marginBottom: '1.5rem' },
  title: { fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem', color: '#2C2420' },
  subtitle: { color: '#8C7D6D', margin: '0', fontSize: '0.875rem' },
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5DDD2' },
  th: { textAlign: 'left' as const, padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#8C7D6D', fontWeight: 500, borderBottom: '1px solid #E5DDD2', background: '#FAF7F2' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#2C2420', borderBottom: '1px solid #F0EBE3', verticalAlign: 'middle' as const },
  badge: (inStock: boolean) => ({
    display: 'inline-block' as const, padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500,
    background: inStock ? '#D1FAE5' : '#FEE2E2', color: inStock ? '#065F46' : '#991B1B',
  }),
  thumb: { width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' as const, background: '#F0EBE3' },
  empty: { textAlign: 'center' as const, padding: '4rem 0', color: '#8C7D6D' },
  filterBtn: (active: boolean) => ({
    padding: '0.375rem 0.875rem', borderRadius: '9999px', border: 'none', fontSize: '0.8rem', cursor: 'pointer',
    background: active ? '#5A4A3A' : '#F0EBE3', color: active ? '#FFFFFF' : '#5A4A3A', fontWeight: active ? 600 : 400,
  }),
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'in-stock' | 'out-of-stock'>('all');

  async function load() {
    setLoading(true);
    try {
      const products = await getAllProducts();
      setItems(products.map(p => ({
        id: p.id,
        title: (p.title as any)?.en ?? p.title ?? '',
        stock: p.inStock ?? false,
        price: p.basePriceCents ?? 0,
        currency: p.baseCurrency ?? 'AED',
        image: (p.images as any)?.[0]?.url ?? '',
        category: p.category ?? '',
      })));
    } catch { setItems([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = items.filter(i => {
    if (filter === 'in-stock') return i.stock;
    if (filter === 'out-of-stock') return !i.stock;
    return true;
  });

  const inStockCount = items.filter(i => i.stock).length;
  const outCount = items.filter(i => !i.stock).length;

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Inventory</h1>
          <p style={s.subtitle}>{items.length} products · {inStockCount} in stock · {outCount} out of stock</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setFilter('all')} style={s.filterBtn(filter === 'all')}>All</button>
          <button onClick={() => setFilter('in-stock')} style={s.filterBtn(filter === 'in-stock')}>In Stock</button>
          <button onClick={() => setFilter('out-of-stock')} style={s.filterBtn(filter === 'out-of-stock')}>Out of Stock</button>
        </div>
      </div>

      {loading ? (
        <div style={s.empty}>Loading inventory...</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}><p>No products matching filter</p></div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Product</th>
              <th style={s.th}>Category</th>
              <th style={s.th}>Price</th>
              <th style={s.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id}>
                <td style={{ ...s.td, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.image ? <img src={item.image} alt="" style={s.thumb} /> : <div style={{ ...s.thumb, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🖼</div>}
                  <span style={{ fontWeight: 500 }}>{item.title}</span>
                </td>
                <td style={s.td}>{item.category}</td>
                <td style={{ ...s.td, fontFamily: 'monospace' }}>{item.currency} {(item.price / 100).toLocaleString()}</td>
                <td style={s.td}><span style={s.badge(item.stock)}>{item.stock ? 'In Stock' : 'Out of Stock'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
