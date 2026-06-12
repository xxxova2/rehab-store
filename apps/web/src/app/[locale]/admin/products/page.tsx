'use client';

import { useState, useEffect, useTransition } from 'react';
import { createProduct, updateProduct, deleteProduct, getProducts } from './actions';
import { uploadProductImage } from '@/lib/supabase-storage';

type Product = {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
  status: 'active' | 'draft';
  stock: number;
};

const empty: Omit<Product, 'id'> = {
  title: '', description: '', price: 0,
  currency: 'AED', image: '', status: 'draft', stock: 0,
};

const s = {
  page: { minHeight: '100vh', background: '#FAF7F2', padding: '0' },
  inner: { maxWidth: 1100, margin: '0 auto' },
  header: { display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, marginBottom: '1.5rem' },
  title: { fontSize: '1.25rem', fontWeight: 600, margin: '0 0 0.25rem', color: '#2C2420' },
  subtitle: { color: '#8C7D6D', margin: '0', fontSize: '0.875rem' },
  addBtn: { height: '40px', padding: '0 1.25rem', borderRadius: '9999px', background: '#5A4A3A', color: '#FFFFFF', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' },
  card: { background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5DDD2', overflow: 'hidden' },
  cardImg: { height: '160px', background: '#F0EBE3', overflow: 'hidden' },
  cardBody: { padding: '0.875rem' },
  cardTitleRow: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'flex-start' as const, marginBottom: '0.375rem' },
  cardTitle: { fontSize: '0.9rem', fontWeight: 600, color: '#2C2420', flex: 1, margin: 0, lineHeight: 1.3 },
  statusBadge: (status: string) => ({
    fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '9999px',
    background: status === 'active' ? '#D1FAE5' : '#F0EBE3',
    color: status === 'active' ? '#065F46' : '#8C7D6D',
    marginLeft: '0.5rem', whiteSpace: 'nowrap' as const,
  }),
  price: { fontSize: '1rem', fontWeight: 700, color: '#5A4A3A', fontFamily: 'monospace', marginBottom: '0.75rem' },
  actions: { display: 'flex' as const, gap: '0.5rem' },
  editBtn: { flex: 1, height: '32px', borderRadius: '8px', background: '#F0EBE3', border: '1px solid #E5DDD2', color: '#5A4A3A', fontSize: '0.8rem', cursor: 'pointer' },
  deleteBtn: { height: '32px', padding: '0 1rem', borderRadius: '8px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.8rem', cursor: 'pointer' },
  loading: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' },
  skeleton: (i: number) => ({ height: 280, borderRadius: '12px', background: '#F0EBE3' }),
  empty: { textAlign: 'center' as const, padding: '4rem 0', color: '#8C7D6D' },
  error: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '0.75rem 1rem', color: '#DC2626', fontSize: '0.85rem', marginBottom: '1.25rem' },
  modal: { position: 'fixed' as const, inset: 0, zIndex: 50, display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, background: 'rgba(44,36,32,0.4)', backdropFilter: 'blur(4px)', padding: '1.25rem' },
  modalContent: { width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' as const, background: '#FFFFFF', borderRadius: '16px', padding: '1.5rem' },
  modalHeader: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: '1.25rem' },
  modalTitle: { fontSize: '1.125rem', fontWeight: 600, color: '#2C2420', margin: 0 },
  closeBtn: { background: 'none', border: 'none', color: '#8C7D6D', fontSize: '1.25rem', cursor: 'pointer' },
  field: { marginBottom: '1rem' },
  label: { display: 'block' as const, fontSize: '0.8rem', fontWeight: 500, color: '#5A4A3A', marginBottom: '0.375rem' },
  input: { width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #E5DDD2', background: '#FAF7F2', color: '#2C2420', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' as const },
  textarea: { width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #E5DDD2', background: '#FAF7F2', color: '#2C2420', fontSize: '0.875rem', outline: 'none', height: '80px', resize: 'vertical' as const, boxSizing: 'border-box' as const, fontFamily: 'inherit' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' },
  select: { padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid #E5DDD2', background: '#FAF7F2', color: '#2C2420', fontSize: '0.875rem', outline: 'none', cursor: 'pointer', width: '100%', boxSizing: 'border-box' as const },
  uploadBtn: { height: '40px', padding: '0 1rem', borderRadius: '8px', background: '#F0EBE3', border: '1px solid #E5DDD2', color: '#5A4A3A', fontSize: '0.8rem', cursor: 'pointer', display: 'flex' as const, alignItems: 'center' as const, gap: '0.375rem', whiteSpace: 'nowrap' as const },
  saveBtn: (disabled: boolean) => ({ width: '100%', height: '44px', borderRadius: '10px', background: disabled ? '#C8A27A' : '#5A4A3A', color: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', marginTop: '0.25rem' }),
  preview: { marginTop: '0.5rem', width: '100%', height: '120px', objectFit: 'cover' as const, borderRadius: '8px', border: '1px solid #E5DDD2' },
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    try { setProducts(await getProducts()); }
    catch { setError('Failed to load products'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function openAdd() { setForm({ ...empty }); setEditing(null); setModal('add'); setError(''); }
  function openEdit(p: Product) {
    setForm({ title: p.title, description: p.description ?? '', price: p.price, currency: p.currency, image: p.image ?? '', status: p.status, stock: p.stock });
    setEditing(p); setModal('edit'); setError('');
  }
  function closeModal() { setModal(null); setEditing(null); setError(''); }

  function submit() {
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (form.price <= 0) { setError('Price must be greater than 0'); return; }
    startTransition(async () => {
      try {
        if (modal === 'edit' && editing) await updateProduct(editing.id, form);
        else await createProduct(form);
        await load();
        closeModal();
      } catch { setError('Save failed'); }
    });
  }

  function remove(id: string) {
    if (!confirm('Delete this product?')) return;
    startTransition(async () => {
      try { await deleteProduct(id); await load(); }
      catch { setError('Delete failed'); }
    });
  }

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <div style={s.header}>
          <div>
            <h1 style={s.title}>Products</h1>
            <p style={s.subtitle}>{products.length} item{products.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openAdd} style={s.addBtn}>+ Add Product</button>
        </div>

        {error && !modal && (
          <div style={s.error}>{error}</div>
        )}

        {loading ? (
          <div style={s.loading}>
            {[...Array(6)].map((_, i) => <div key={i} style={s.skeleton(i)} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={s.empty}><p>No products yet. Add your first one.</p></div>
        ) : (
          <div style={s.grid}>
            {products.map(p => (
              <div key={p.id} style={s.card}>
                <div style={s.cardImg}>
                  {p.image
                    ? <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C8A27A', fontSize: '2rem' }}>🖼</div>
                  }
                </div>
                <div style={s.cardBody}>
                  <div style={s.cardTitleRow}>
                    <h3 style={s.cardTitle}>{p.title}</h3>
                    <span style={s.statusBadge(p.status)}>{p.status}</span>
                  </div>
                  <div style={s.price}>{p.price.toLocaleString()} {p.currency}</div>
                  <div style={s.actions}>
                    <button onClick={() => openEdit(p)} style={s.editBtn}>Edit</button>
                    <button onClick={() => remove(p.id)} style={s.deleteBtn}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={s.modalContent}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={closeModal} style={s.closeBtn}>×</button>
            </div>

            {error && <div style={s.error}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={s.field}>
                <label style={s.label}>Title *</label>
                <input style={s.input} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Product name" />
              </div>
              <div style={s.field}>
                <label style={s.label}>Description</label>
                <textarea style={s.textarea} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" />
              </div>
              <div style={s.row}>
                <div style={s.field}>
                  <label style={s.label}>Price *</label>
                  <input style={s.input} type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Currency</label>
                  <select style={s.select} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                    {['AED','SAR','KWD','EGP','USD','EUR'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={s.row}>
                <div style={s.field}>
                  <label style={s.label}>Stock</label>
                  <input style={s.input} type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))} />
                </div>
                <div style={s.field}>
                  <label style={s.label}>Status</label>
                  <select style={s.select} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'draft' }))}>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Image</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input style={{ ...s.input, flex: 1 }} value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="Paste image URL..." />
                  <label style={s.uploadBtn}>
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const fd = new FormData();
                        fd.set('file', file);
                        try {
                          const url = await uploadProductImage(fd);
                          setForm(f => ({ ...f, image: url }));
                        } catch { setError('Upload failed'); }
                      }}
                    />
                  </label>
                </div>
                {form.image && <img src={form.image} alt="" style={s.preview} />}
              </div>
              <button onClick={submit} disabled={isPending} style={s.saveBtn(isPending)}>
                {isPending ? 'Saving…' : modal === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
