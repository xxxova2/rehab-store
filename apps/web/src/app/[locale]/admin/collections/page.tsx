'use client';

import { useState, useEffect, useTransition } from 'react';
import { getAllCollections } from '@/lib/products';
import { createCollectionAction, updateCollectionAction, deleteCollectionAction } from './actions';

type CollectionItem = {
  id: string;
  title: string;
  slug: string;
  image: string;
  productCount: number;
};

const styles = {
  page: { padding: '1.5rem' },
  header: { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, marginBottom: '1.5rem' },
  title: { fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem', color: '#2C2420' },
  subtitle: { color: '#8C7D6D', margin: '0', fontSize: '0.875rem' },
  addBtn: { height: '40px', padding: '0 1.25rem', borderRadius: '9999px', background: '#5A4A3A', color: '#FFFFFF', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  card: { background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5DDD2', overflow: 'hidden' },
  cardImg: { height: '160px', background: '#F0EBE3', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, color: '#C8A27A', fontSize: '2.5rem' },
  cardBody: { padding: '1rem' },
  cardTitle: { fontSize: '1rem', fontWeight: 600, color: '#2C2420', margin: '0 0 0.25rem' },
  cardMeta: { fontSize: '0.8rem', color: '#8C7D6D', marginBottom: '0.75rem' },
  cardActions: { display: 'flex' as const, gap: '0.5rem' },
  editBtn: { flex: 1, height: '32px', borderRadius: '8px', background: '#F0EBE3', border: '1px solid #E5DDD2', color: '#5A4A3A', fontSize: '0.8rem', cursor: 'pointer' },
  deleteBtn: { height: '32px', padding: '0 1rem', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.8rem', cursor: 'pointer' },
  modal: { position: 'fixed' as const, inset: 0, zIndex: 50, display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, background: 'rgba(44,36,32,0.4)', backdropFilter: 'blur(4px)', padding: '1.25rem' },
  modalContent: { width: '100%', maxWidth: '480px', background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem' },
  modalHeader: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: '1.25rem' },
  modalTitle: { fontSize: '1.125rem', fontWeight: 600, color: '#2C2420', margin: 0 },
  closeBtn: { background: 'none', border: 'none', color: '#8C7D6D', fontSize: '1.25rem', cursor: 'pointer' },
  field: { marginBottom: '1rem' },
  label: { display: 'block' as const, fontSize: '0.8rem', fontWeight: 500, color: '#5A4A3A', marginBottom: '0.375rem' },
  input: { width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #E5DDD2', color: '#2C2420', fontSize: '0.875rem', outline: 'none', background: '#FAF7F2', boxSizing: 'border-box' as const },
  saveBtn: { width: '100%', height: '44px', borderRadius: '10px', background: '#5A4A3A', color: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem' },
  empty: { textAlign: 'center' as const, padding: '4rem 0', color: '#8C7D6D' },
  toast: { position: 'fixed' as const, bottom: '1.5rem', right: '1.5rem', zIndex: 100, background: '#5A4A3A', color: '#FFFFFF', padding: '0.75rem 1.25rem', borderRadius: '10px', fontSize: '0.875rem' },
  confirmModal: { position: 'fixed' as const, inset: 0, zIndex: 60, display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, background: 'rgba(44,36,32,0.4)', padding: '1.25rem' },
  confirmContent: { background: '#FFFFFF', borderRadius: '12px', padding: '1.5rem', maxWidth: '360px', width: '100%', textAlign: 'center' as const },
  confirmActions: { display: 'flex' as const, gap: '0.75rem', marginTop: '1rem', justifyContent: 'center' as const },
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<CollectionItem | null>(null);
  const [form, setForm] = useState({ title: '', description: '', image: '' });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState('');

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 2500); }

  async function load() {
    setLoading(true);
    try {
      const all = await getAllCollections();
      setCollections(all.map(c => ({
        id: c.id,
        title: (c.title as any)?.en ?? c.title ?? '',
        slug: c.slug,
        image: (c.hero as any)?.url ?? '',
        productCount: c.productIds?.length ?? 0,
      })));
    } catch { showToast('Failed to load collections'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setForm({ title: '', description: '', image: '' }); setEditing(null); setModal('add'); }
  function openEdit(c: CollectionItem) { setForm({ title: c.title, description: '', image: c.image }); setEditing(c); setModal('edit'); }
  function closeModal() { setModal(null); setEditing(null); }
  function submit() {
    if (!form.title.trim()) return;
    startTransition(async () => {
      try {
        if (modal === 'edit' && editing) {
          await updateCollectionAction('en', editing.id, form);
        } else {
          await createCollectionAction('en', form);
        }
        await load(); closeModal(); showToast('Collection saved');
      } catch { showToast('Save failed'); }
    });
  }
  function confirmDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      try { await deleteCollectionAction('en', deleteId); await load(); setDeleteId(null); showToast('Collection deleted'); }
      catch { showToast('Delete failed'); }
    });
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Collections</h1>
          <p style={styles.subtitle}>{collections.length} collection{collections.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openAdd} style={styles.addBtn}>+ Add Collection</button>
      </div>

      {loading ? (
        <div style={styles.grid}>
          {[...Array(3)].map((_, i) => <div key={i} style={{ ...styles.card, height: '260px' }} />)}
        </div>
      ) : collections.length === 0 ? (
        <div style={styles.empty}><p>No collections yet. Add your first one.</p></div>
      ) : (
        <div style={styles.grid}>
          {collections.map(c => (
            <div key={c.id} style={styles.card}>
              <div style={styles.cardImg}>{c.image ? <img src={c.image} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📁'}</div>
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{c.title}</h3>
                <p style={styles.cardMeta}>{c.slug}</p>
                <div style={styles.cardActions}>
                  <button onClick={() => openEdit(c)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => setDeleteId(c.id)} style={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div style={styles.modal} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{modal === 'add' ? 'Add Collection' : 'Edit Collection'}</h2>
              <button onClick={closeModal} style={styles.closeBtn}>×</button>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Title</label>
              <input style={styles.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Collection name" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <input style={styles.input} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Image URL</label>
              <input style={styles.input} value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." />
            </div>
            <button onClick={submit} disabled={isPending} style={{ ...styles.saveBtn, opacity: isPending ? 0.6 : 1 }}>{isPending ? 'Saving...' : 'Save'}</button>
          </div>
        </div>
      )}

      {deleteId && (
        <div style={styles.confirmModal} onClick={e => { if (e.target === e.currentTarget) setDeleteId(null); }}>
          <div style={styles.confirmContent}>
            <p style={{ margin: '0 0 0.5rem', color: '#2C2420' }}>Delete this collection?</p>
            <p style={{ color: '#8C7D6D', fontSize: '0.85rem', margin: 0 }}>This action cannot be undone.</p>
            <div style={styles.confirmActions}>
              <button onClick={() => setDeleteId(null)} style={{ ...styles.editBtn, padding: '0.5rem 1.25rem' }}>Cancel</button>
              <button onClick={confirmDelete} disabled={isPending} style={{ ...styles.deleteBtn, padding: '0.5rem 1.25rem', opacity: isPending ? 0.6 : 1 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}
