'use client';

import { useState, useEffect } from 'react';
import { getCustomers, type CustomerSummary } from './actions';

const s = {
  page: { background: '#FAF7F2', minHeight: '100vh', padding: '1.5rem' },
  header: { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, marginBottom: '1.5rem' },
  title: { fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem', color: '#2C2420' },
  subtitle: { color: '#8C7D6D', margin: '0', fontSize: '0.875rem' },
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5DDD2' },
  th: { textAlign: 'left' as const, padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#8C7D6D', fontWeight: 500, borderBottom: '1px solid #E5DDD2', background: '#FAF7F2' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#2C2420', borderBottom: '1px solid #F0EBE3' },
  empty: { textAlign: 'center' as const, padding: '4rem 0', color: '#8C7D6D' },
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      setCustomers(await getCustomers());
    } catch { setCustomers([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Customers</h1>
          <p style={s.subtitle}>{customers.length} customer{customers.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div style={s.empty}>Loading customers...</div>
      ) : customers.length === 0 ? (
        <div style={s.empty}><p>No customers yet — orders will appear here once placed</p></div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Name</th>
              <th style={s.th}>Phone</th>
              <th style={s.th}>Orders</th>
              <th style={s.th}>Total Spent</th>
              <th style={s.th}>Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.phone}>
                <td style={s.td}><span style={{ fontWeight: 500 }}>{c.name}</span></td>
                <td style={s.td}>{c.phone}</td>
                <td style={s.td}>{c.orderCount}</td>
                <td style={{ ...s.td, fontFamily: 'monospace', fontWeight: 600 }}>{c.currency} {c.totalSpent.toLocaleString()}</td>
                <td style={{ ...s.td, color: '#8C7D6D', fontSize: '0.8rem' }}>{new Date(c.lastOrder).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
