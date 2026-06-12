'use client';

import { useState } from 'react';

interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'developer';
  createdAt: string;
}

const mockUsers: AdminUser[] = [
  { id: '1', email: 'admin@rehab.com', role: 'admin', createdAt: '2026-06-01T00:00:00Z' },
];

const s = {
  page: { padding: '1.5rem' },
  header: { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, marginBottom: '1.5rem' },
  title: { fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem', color: '#2C2420' },
  subtitle: { color: '#8C7D6D', margin: '0', fontSize: '0.875rem' },
  table: { width: '100%', borderCollapse: 'collapse' as const, background: '#FFFFFF', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5DDD2' },
  th: { textAlign: 'left' as const, padding: '0.75rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em', color: '#8C7D6D', fontWeight: 500, borderBottom: '1px solid #E5DDD2', background: '#FAF7F2' },
  td: { padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#2C2420', borderBottom: '1px solid #F0EBE3' },
  badge: (role: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      admin: { bg: '#FEE2E2', text: '#991B1B' },
      member: { bg: '#DBEAFE', text: '#1E40AF' },
      developer: { bg: '#D1FAE5', text: '#065F46' },
    };
    const c = colors[role] ?? { bg: '#F3F4F6', text: '#6B7280' };
    return { display: 'inline-block' as const, padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: c.bg, color: c.text };
  },
  empty: { textAlign: 'center' as const, padding: '4rem 0', color: '#8C7D6D' },
  info: { background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#92400E', marginBottom: '1.5rem' },
};

export default function UsersPage() {
  const [users] = useState<AdminUser[]>(mockUsers);

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Admin Users</h1>
          <p style={s.subtitle}>{users.length} user{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div style={s.info}>
        User management requires a Medusa backend. Currently showing local admin accounts.
      </div>

      {users.length === 0 ? (
        <div style={s.empty}><p>No admin users</p></div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Email</th>
              <th style={s.th}>Role</th>
              <th style={s.th}>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={s.td}><span style={{ fontWeight: 500 }}>{u.email}</span></td>
                <td style={s.td}><span style={s.badge(u.role)}>{u.role}</span></td>
                <td style={{ ...s.td, color: '#8C7D6D', fontSize: '0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
