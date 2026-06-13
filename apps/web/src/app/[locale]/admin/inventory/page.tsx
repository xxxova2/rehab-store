'use client';

import { useState, useEffect } from 'react';
import { getInventoryProducts, getInventory, upsertInventory } from './actions';
import type { Product } from '@rehab/types';

const s = {
  page: { background: '#FAF7F2', minHeight: '100vh', padding: '1.5rem' },
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
  sizeChip: (active: boolean) => ({
    display: 'inline-block' as const, padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', margin: '0.1rem',
    background: active ? '#5A4A3A' : '#F0EBE3', color: active ? '#FFFFFF' : '#5A4A3A',
  }),
  thumb: { width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' as const, background: '#F0EBE3' },
  empty: { textAlign: 'center' as const, padding: '4rem 0', color: '#8C7D6D' },
  filterBtn: (active: boolean) => ({
    padding: '0.375rem 0.875rem', borderRadius: '9999px', border: 'none', fontSize: '0.8rem', cursor: 'pointer',
    background: active ? '#5A4A3A' : '#F0EBE3', color: active ? '#FFFFFF' : '#5A4A3A', fontWeight: active ? 600 : 400,
  }),
  toast: { position: 'fixed' as const, bottom: '1.5rem', right: '1.5rem', zIndex: 100, background: '#5A4A3A', color: '#FFFFFF', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.875rem' },
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Record<string, Record<string, number>>>({});
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2000); }

  async function load() {
    setLoading(true);
    try {
      const p = await getInventoryProducts();
      setProducts(p);

      const invData = await getInventory();
      const inv: Record<string, Record<string, number>> = {};
      const initEdits: Record<string, Record<string, string>> = {};
      invData.forEach((r) => {
        inv[r.product_id] = r.stock ?? {};
        initEdits[r.product_id] = {};
        Object.entries(r.stock ?? {}).forEach(([size, qty]) => {
          initEdits[r.product_id][size] = String(qty);
        });
      });
      setInventory(inv);
      setEdits(initEdits);
    } catch (e: any) {
      showToast('Failed to load: ' + (e.message ?? 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function saveStock(productId: string) {
    setSaving(true);
    const productEdits = edits[productId] ?? {};
    const updated: Record<string, number> = {};
    Object.entries(productEdits).forEach(([size, val]) => {
      updated[size] = parseInt(val || '0', 10);
    });

    try {
      await upsertInventory(productId, updated);
      setInventory(prev => ({ ...prev, [productId]: updated }));
      showToast('Stock updated');
    } catch (e: any) {
      showToast('Save failed: ' + (e.message ?? ''));
    } finally {
      setSaving(false);
    }
  }

  const totalStock = (pid: string) => Object.values(inventory[pid] ?? {}).reduce((a, b) => a + b, 0);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Inventory</h1>
          <p style={s.subtitle}>{products.length} products</p>
        </div>
      </div>

      {loading ? (
        <div style={s.empty}>Loading inventory...</div>
      ) : products.length === 0 ? (
        <div style={s.empty}><p>No products found</p></div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Product</th>
              <th style={s.th}>Sizes / Stock</th>
              <th style={s.th}>Total</th>
              <th style={s.th}>Status</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const pid = p.id;
              const stock = inventory[pid] ?? {};
              const sizes: string[] = p.sizes.map((s) => String(s));
              const sizeList: string[] = sizes.length > 0 ? sizes : Object.keys(stock);
              const productEdits = edits[pid] ?? {};

              return (
                <tr key={pid}>
                  <td style={{ ...s.td, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" style={s.thumb} /> : <div style={{ ...s.thumb, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: '#C8A27A' }}>◻</div>}
                    <div>
                      <span style={{ fontWeight: 500, display: 'block' }}>{p.title.en}</span>
                      <span style={{ fontSize: '0.75rem', color: '#8C7D6D' }}>{p.category}</span>
                    </div>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', alignItems: 'center' }}>
                      {sizeList.map(size => (
                        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <span style={s.sizeChip(true)}>{size}</span>
                          <input
                            style={{ width: '40px', padding: '0.15rem', borderRadius: '3px', border: '1px solid #E5DDD2', textAlign: 'center', fontSize: '0.75rem' }}
                            type="number"
                            min="0"
                            value={productEdits[size] ?? stock[size] ?? 0}
                            onChange={e => {
                              setEdits(prev => ({
                                ...prev,
                                [pid]: { ...(prev[pid] ?? {}), [size]: e.target.value },
                              }));
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ ...s.td, fontFamily: 'monospace', fontWeight: 600 }}>{totalStock(pid)}</td>
                  <td style={s.td}>
                    <span style={s.badge(totalStock(pid) > 0)}>
                      {totalStock(pid) > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td style={s.td}>
                    <button
                      onClick={() => saveStock(pid)}
                      disabled={saving}
                      style={{
                        padding: '0.25rem 0.75rem', borderRadius: '6px', border: 'none',
                        background: '#5A4A3A', color: '#FFFFFF', fontSize: '0.75rem', cursor: 'pointer',
                        opacity: saving ? 0.6 : 1,
                      }}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}
