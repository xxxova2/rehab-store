'use client';

import { useState, useEffect } from 'react';
import { getSupabaseAdmin, ordersTable } from '@/lib/supabase';
import type { OrderRow, OrderItem } from '@/lib/db-types';

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
  shipped: { bg: '#E0E7FF', text: '#3730A3' },
  delivered: { bg: '#D1FAE5', text: '#065F46' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const s = {
  page: { background: '#FAF7F2', minHeight: '100vh', padding: '1.5rem' },
  header: { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, marginBottom: '1.5rem' },
  title: { fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem', color: '#2C2420' },
  subtitle: { color: '#8C7D6D', margin: '0', fontSize: '0.875rem' },
  search: { padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #E5DDD2', background: '#FFFFFF', color: '#2C2420', fontSize: '0.875rem', outline: 'none', width: '260px' },
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5DDD2' },
  th: { textAlign: 'left' as const, padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#8C7D6D', fontWeight: 500, borderBottom: '1px solid #E5DDD2', background: '#FAF7F2' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#2C2420', borderBottom: '1px solid #F0EBE3' },
  badge: (status: string) => {
    const c = statusColors[status] ?? { bg: '#F3F4F6', text: '#6B7280' };
    return { display: 'inline-block' as const, padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: c.bg, color: c.text };
  },
  empty: { textAlign: 'center' as const, padding: '4rem 0', color: '#8C7D6D' },
  loading: { textAlign: 'center' as const, padding: '4rem 0', color: '#8C7D6D' },
  detailModal: { position: 'fixed' as const, inset: 0, zIndex: 50, display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, background: 'rgba(44,36,32,0.4)', backdropFilter: 'blur(4px)', padding: '1.25rem' },
  detailContent: { width: '100%', maxWidth: '560px', background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem', maxHeight: '80vh', overflowY: 'auto' as const },
  closeBtn: { background: 'none', border: 'none', color: '#8C7D6D', fontSize: '1.25rem', cursor: 'pointer' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<OrderRow | null>(null);

  async function load() {
    setLoading(true);
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await ordersTable(supabase).select('*').order('created_at', { ascending: false });
      setOrders(data ?? []);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = orders.filter(o =>
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone?.includes(search)
  );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Orders</h1>
          <p style={s.subtitle}>{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <input style={s.search} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, or order #..." />
      </div>

      {loading ? (
        <div style={s.loading}>Loading orders...</div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}><p>{search ? 'No matching orders' : 'No orders yet'}</p></div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Order #</th>
              <th style={s.th}>Customer</th>
              <th style={s.th}>Phone</th>
              <th style={s.th}>Items</th>
              <th style={s.th}>Total</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} onClick={() => setSelected(o)} style={{ cursor: 'pointer', transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = '#FAF7F2')} onMouseLeave={e => (e.currentTarget.style.background = '')}>
                <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '0.8rem' }}>{o.order_number}</td>
                <td style={s.td}>{o.customer_name}</td>
                <td style={s.td}>{o.customer_phone}</td>
                <td style={s.td}>{(o.items ?? []).length}</td>
                <td style={{ ...s.td, fontFamily: 'monospace', fontWeight: 600 }}>{o.currency} {Number(o.total_amount).toLocaleString()}</td>
                <td style={s.td}><span style={s.badge(o.status)}>{o.status}</span></td>
                <td style={{ ...s.td, color: '#8C7D6D', fontSize: '0.8rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div style={s.detailModal} onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={s.detailContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#2C2420', margin: 0 }}>Order {selected.order_number}</h2>
              <button onClick={() => setSelected(null)} style={s.closeBtn}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div><span style={{ fontSize: '0.75rem', color: '#8C7D6D', display: 'block' }}>Customer</span><span style={{ fontWeight: 500 }}>{selected.customer_name}</span></div>
              <div><span style={{ fontSize: '0.75rem', color: '#8C7D6D', display: 'block' }}>Phone</span><span style={{ fontWeight: 500 }}>{selected.customer_phone}</span></div>
              <div><span style={{ fontSize: '0.75rem', color: '#8C7D6D', display: 'block' }}>Status</span><span style={s.badge(selected.status)}>{selected.status}</span></div>
              <div><span style={{ fontSize: '0.75rem', color: '#8C7D6D', display: 'block' }}>Total</span><span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{selected.currency} {Number(selected.total_amount).toLocaleString()}</span></div>
            </div>
            {selected.items && selected.items.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2C2420', margin: '0 0 0.5rem' }}>Items</h3>                        {(selected.items ?? []).map((item: OrderItem, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #F0EBE3', fontSize: '0.85rem' }}>
                    <span>{item.name} x{item.quantity}</span>
                    <span style={{ fontFamily: 'monospace' }}>{selected.currency} {Number(item.price).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
