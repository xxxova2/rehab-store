'use client';

import { useState, useEffect, useTransition } from 'react';
import { getAdminUsers, inviteAdminUser, updateAdminUserRole, deleteAdminUser } from './actions';
import type { AdminUserRow } from './actions';

const s = {
  page: { background: '#FAF7F2', minHeight: '100vh', padding: '1.5rem' },
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
  modal: { position: 'fixed' as const, inset: 0, zIndex: 50, display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, background: 'rgba(44,36,32,0.4)', backdropFilter: 'blur(4px)', padding: '1.25rem' },
  modalContent: { width: '100%', maxWidth: '480px', background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem' },
  modalHeader: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: '1.25rem' },
  modalTitle: { fontSize: '1.125rem', fontWeight: 600, color: '#2C2420', margin: 0 },
  closeBtn: { background: 'none', border: 'none', color: '#8C7D6D', fontSize: '1.25rem', cursor: 'pointer' },
  field: { marginBottom: '1rem' },
  label: { display: 'block' as const, fontSize: '0.8rem', fontWeight: 500, color: '#5A4A3A', marginBottom: '0.375rem' },
  input: { width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #E5DDD2', color: '#2C2420', fontSize: '0.875rem', outline: 'none', background: '#FAF7F2', boxSizing: 'border-box' as const },
  select: { width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #E5DDD2', background: '#FAF7F2', color: '#2C2420', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', boxSizing: 'border-box' as const },
  saveBtn: (disabled: boolean) => ({ width: '100%', height: '44px', borderRadius: '10px', background: disabled ? '#C8A27A' : '#5A4A3A', color: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', marginTop: '0.25rem' }),
  toast: { position: 'fixed' as const, bottom: '1.5rem', right: '1.5rem', zIndex: 100, background: '#5A4A3A', color: '#FFFFFF', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.875rem' },
  confirmModal: { position: 'fixed' as const, inset: 0, zIndex: 60, display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, background: 'rgba(44,36,32,0.4)', padding: '1.25rem' },
  confirmContent: { background: '#FFFFFF', borderRadius: '12px', padding: '1.5rem', maxWidth: '360px', width: '100%', textAlign: 'center' as const },
  confirmActions: { display: 'flex' as const, gap: '0.75rem', marginTop: '1rem', justifyContent: 'center' as const },
  editBtn: { flex: 1, height: '32px', borderRadius: '8px', background: '#F0EBE3', border: '1px solid #E5DDD2', color: '#5A4A3A', fontSize: '0.8rem', cursor: 'pointer' },
  deleteBtn: { height: '32px', padding: '0 1rem', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.8rem', cursor: 'pointer' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', password: '', role: 'member' as 'admin' | 'member' | 'developer' });
  const [deleteTarget, setDeleteTarget] = useState<AdminUserRow | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    setLoading(true);
    try {
      const result = await getAdminUsers();
      setUsers(result);
    } catch { showToast('Failed to load users'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function handleInvite() {
    if (!inviteForm.email.trim() || !inviteForm.password.trim()) return;
    startTransition(async () => {
      try {
        await inviteAdminUser(inviteForm.email, inviteForm.password, inviteForm.role);
        await load();
        setShowInvite(false);
        setInviteForm({ email: '', password: '', role: 'member' });
        showToast('User invited successfully');
      } catch (e: any) {
        showToast(e.message ?? 'Failed to invite user');
      }
    });
  }

  function handleRoleChange(userId: string, role: 'admin' | 'member' | 'developer') {
    startTransition(async () => {
      try {
        await updateAdminUserRole(userId, role);
        await load();
        showToast('Role updated');
      } catch (e: any) {
        showToast(e.message ?? 'Failed to update role');
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      try {
        await deleteAdminUser(deleteTarget.id);
        await load();
        setDeleteTarget(null);
        showToast('User deleted');
      } catch (e: any) {
        showToast(e.message ?? 'Failed to delete user');
      }
    });
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Admin Users</h1>
          <p style={s.subtitle}>{users.length} user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          style={{ height: '40px', padding: '0 1.25rem', borderRadius: '9999px', background: '#5A4A3A', color: '#FFFFFF', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
        >
          + Invite User
        </button>
      </div>

      {loading ? (
        <div style={s.empty}>Loading users...</div>
      ) : users.length === 0 ? (
        <div style={s.empty}><p>No admin users. The first admin must be created manually via Supabase Dashboard.</p></div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Email</th>
              <th style={s.th}>Role</th>
              <th style={s.th}>Created</th>
              <th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={s.td}>
                  <span style={{ fontWeight: 500 }}>{u.email}</span>
                  {u.id === currentUserId && <span style={{ color: '#8C7D6D', fontSize: '0.75rem', marginLeft: '0.5rem' }}>(you)</span>}
                </td>
                <td style={s.td}>
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value as 'admin' | 'member' | 'developer')}
                    disabled={u.id === currentUserId}
                    style={{
                      ...s.select,
                      width: 'auto',
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.8rem',
                      opacity: u.id === currentUserId ? 0.5 : 1,
                    }}
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="developer">Developer</option>
                  </select>
                </td>
                <td style={{ ...s.td, color: '#8C7D6D', fontSize: '0.8rem' }}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td style={s.td}>
                  <button
                    onClick={() => setDeleteTarget(u)}
                    disabled={u.id === currentUserId}
                    style={{
                      padding: '0.25rem 0.75rem', borderRadius: '6px', border: '1px solid #FECACA',
                      background: '#FEF2F2', color: '#DC2626', fontSize: '0.75rem', cursor: u.id === currentUserId ? 'not-allowed' : 'pointer',
                      opacity: u.id === currentUserId ? 0.5 : 1,
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showInvite && (
        <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) setShowInvite(false); }}>
          <div style={s.modalContent}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Invite Admin User</h2>
              <button onClick={() => setShowInvite(false)} style={s.closeBtn}>×</button>
            </div>
            <div style={s.field}>
              <label style={s.label}>Email *</label>
              <input style={s.input} type="email" value={inviteForm.email} onChange={e => setInviteForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@example.com" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Temporary Password *</label>
              <input style={s.input} type="password" value={inviteForm.password} onChange={e => setInviteForm(f => ({ ...f, password: e.target.value }))} placeholder="Set initial password" />
            </div>
            <div style={s.field}>
              <label style={s.label}>Role</label>
              <select style={s.select} value={inviteForm.role} onChange={e => setInviteForm(f => ({ ...f, role: e.target.value as 'admin' | 'member' | 'developer' }))}>
                <option value="member">Member — Read-only access to orders and products</option>
                <option value="admin">Admin — Full access to all sections</option>
                <option value="developer">Developer — Access to settings and sensitive data</option>
              </select>
            </div>
            <button onClick={handleInvite} disabled={isPending} style={s.saveBtn(isPending)}>
              {isPending ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div style={s.confirmModal} onClick={e => { if (e.target === e.currentTarget) setDeleteTarget(null); }}>
          <div style={s.confirmContent}>
            <p style={{ margin: '0 0 0.5rem', color: '#2C2420' }}>Remove {deleteTarget.email}?</p>
            <p style={{ color: '#8C7D6D', fontSize: '0.85rem', margin: 0 }}>This will revoke admin access immediately.</p>
            <div style={s.confirmActions}>
              <button onClick={() => setDeleteTarget(null)} style={{ ...s.editBtn, padding: '0.5rem 1.25rem' }}>Cancel</button>
              <button onClick={handleDelete} disabled={isPending} style={{ ...s.deleteBtn, padding: '0.5rem 1.25rem', opacity: isPending ? 0.6 : 1 }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={s.toast}>{toast}</div>}
    </div>
  );
}
