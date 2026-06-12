'use client';

import { useState, useEffect, useTransition } from 'react';
import { getAllProducts, updateProduct } from '@/lib/products';

interface PriceItem {
  id: string;
  title: string;
  priceCents: number;
  currency: string;
  image: string;
}

const s = {
  page: { padding: '1.5rem' },
  header: { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, marginBottom: '1.5rem' },
  title: { fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem', color: '#2C2420' },
  subtitle: { color: '#8C7D6D', margin: '0', fontSize: '0.875rem' },
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5DDD2' },
  th: { textAlign: 'left' as const, padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#8C7D6D', fontWeight: 500, borderBottom: '1px solid #E5DDD2', background: '#FAF7F2' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#2C2420', borderBottom: '1px solid #F0EBE3', verticalAlign: 'middle' as const },
  input: { width: '120px', padding: '0.375rem 0.5rem', borderRadius: '6px', border: '1px solid #E5DDD2', background: '#FAF7F2', color: '#2C2420', fontSize: '0.875rem', outline: 'none', fontFamily: 'monospace' },
  currencySelect: { padding: '0.375rem 0.5rem', borderRadius: '6px', border: '1px solid #E5DDD2', background: '#FAF7F2', color: '#2C2420', fontSize: '0.875rem', outline: 'none', marginLeft: '0.5rem' },
  saveBtn: { padding: '0.375rem 0.875rem', borderRadius: '6px', border: 'none', background: '#5A4A3A', color: '#FFFFFF', fontSize: '0.8rem', cursor: 'pointer' },
  thumb: { width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' as const, background: '#F0EBE3' },
  empty: { textAlign: 'center' as const, padding: '4rem 0', color: '#8C7D6D' },
  toast: { position: 'fixed' as const, bottom: '1.5rem', right: '1.5rem', zIndex: 100, background: '#5A4A3A', color: '#FFFFFF', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.875rem' },
};

export default function PricingPage() {
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, { price: string; currency: string }>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState('');
  const [, startTransition] = useTransition();

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    setLoading(true);
    try {
      const products = await getAllProducts();
      const mapped = products.map(p => ({
        id: p.id,
        title: (p.title as any)?.en ?? p.title ?? '',
        priceCents: p.basePriceCents ?? 0,
        currency: p.baseCurrency ?? 'AED',
        image: (p.images as any)?.[0]?.url ?? '',
      }));
      setItems(mapped);
      const initial: Record<string, { price: string; currency: string }> = {};
      mapped.forEach(i => { initial[i.id] = { price: (i.priceCents / 100).toFixed(2), currency: i.currency }; });
      setEdits(initial);
    } catch { setItems([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function save(id: string) {
    const edit = edits[id];
    if (!edit) return;
    setSaving(s => ({ ...s, [id]: true }));
    startTransition(async () => {
      try {
        await updateProduct(id, {
          title: items.find(i => i.id === id)?.title ?? '',
          price: parseFloat(edit.price) || 0,
          currency: edit.currency,
          status: 'active',
          stock: 0,
        });
        showToast('Price updated');
      } catch { showToast('Update failed'); }
      finally { setSaving(s => ({ ...s, [id]: false })); }
    });
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Pricing</h1>
          <p style={s.subtitle}>{items.length} products · Prices in cents AED</p>
        </div>
      </div>

      {loading ? (
        <div style={s.empty}>Loading pricing...</div>
      ) : items.length === 0 ? (
        <div style={s.empty}><p>No products yet</p></div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Product</th>
              <th style={s.th}>Current</th>
              <th style={s.th}>Price (AED)</th>
              <th style={s.th}>Currency</th>
              <th style={s.th}></th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={{ ...s.td, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.image ? <img src={item.image} alt="" style={s.thumb} /> : <div style={{ ...s.thumb, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🖼</div>}
                  <span style={{ fontWeight: 500 }}>{item.title}</span>
                </td>
                <td style={{ ...s.td, fontFamily: 'monospace' }}>{(item.priceCents / 100).toLocaleString()} {item.currency}</td>
                <td style={s.td}>
                  <input
                    style={s.input}
                    type="number"
                    step="0.01"
                    min="0"
                    value={edits[item.id]?.price ?? ''}
                    onChange={ev => setEdits(prev => ({ ...prev, [item.id]: { ...prev[item.id], price: ev.target.value } }))}
                  />
                </td>
                <td style={s.td}>
                  <select
                    style={s.currencySelect}
                    value={edits[item.id]?.currency ?? 'AED'}
                    onChange={ev => setEdits(prev => ({ ...prev, [item.id]: { ...prev[item.id], currency: ev.target.value } }))}
                  >
                    {['AED', 'SAR', 'KWD', 'EGP', 'USD'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </td>
                <td style={s.td}>
                  <button onClick={() => save(item.id)} disabled={saving[item.id]} style={{ ...s.saveBtn, opacity: saving[item.id] ? 0.6 : 1 }}>
                    {saving[item.id] ? '...' : 'Save'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}
