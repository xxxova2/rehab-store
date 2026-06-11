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

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'inherit',
};

const lbl: React.CSSProperties = {
  fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.5)',
  letterSpacing: '0.06em', textTransform: 'uppercase',
  marginBottom: '6px', display: 'block',
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)', padding: '32px 24px', fontFamily: '"Space Grotesk", sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 }}>Products</h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', marginTop: '4px' }}>{products.length} item{products.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={openAdd} style={{ height: '44px', padding: '0 24px', borderRadius: '999px', background: 'rgba(255,255,255,0.95)', color: '#3730a3', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            + Add Product
          </button>
        </div>

        {error && !modal && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#fca5a5', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {[...Array(6)].map((_, i) => <div key={i} style={{ height: 280, borderRadius: '16px', background: 'rgba(255,255,255,0.06)' }} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <p>No products yet. Add your first one.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {products.map(p => (
              <div key={p.id} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                <div style={{ height: '160px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                  {p.image
                    ? <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '32px' }}>🖼</div>
                  }
                </div>
                <div style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h3 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, flex: 1, margin: 0, lineHeight: 1.3 }}>{p.title}</h3>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: p.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.1)', color: p.status === 'active' ? '#86efac' : 'rgba(255,255,255,0.5)', marginLeft: '8px' }}>
                      {p.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '17px', fontWeight: 700, color: '#c7d2fe', fontFamily: '"JetBrains Mono", monospace', marginBottom: '4px' }}>
                    {p.price.toLocaleString()} {p.currency}
                  </p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>Stock: {p.stock}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openEdit(p)} style={{ flex: 1, height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                    <button onClick={() => remove(p.id)} style={{ height: '32px', padding: '0 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '20px' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{ width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', background: 'rgba(30,27,75,0.94)', backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '22px', cursor: 'pointer' }}>×</button>
            </div>

            {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', color: '#fca5a5', fontSize: '13px', marginBottom: '18px' }}>{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={lbl}>Title *</label>
                <input style={inp} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Product name" />
              </div>
              <div>
                <label style={lbl}>Description</label>
                <textarea style={{ ...inp, height: '80px', resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Price *</label>
                  <input style={inp} type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label style={lbl}>Currency</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                    {['AED','SAR','KWD','EGP','USD','EUR'].map(c => <option key={c} value={c} style={{ background: '#1e1b4b' }}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lbl}>Stock</label>
                  <input style={inp} type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label style={lbl}>Status</label>
                  <select style={{ ...inp, cursor: 'pointer' }} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'draft' }))}>
                    <option value="draft" style={{ background: '#1e1b4b' }}>Draft</option>
                    <option value="active" style={{ background: '#1e1b4b' }}>Active</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={lbl}>Image</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input style={{ ...inp, flex: 1 }} value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="Paste image URL..." />
                  <label style={{ height: '42px', padding: '0 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
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
                        } catch {
                          setError('Upload failed');
                        }
                      }}
                    />
                  </label>
                </div>
                {form.image && <img src={form.image} alt="" style={{ marginTop: '8px', width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />}
              </div>
              <button
                onClick={submit}
                disabled={isPending}
                style={{ height: '48px', borderRadius: '999px', background: isPending ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.95)', color: '#3730a3', fontWeight: 700, fontSize: '15px', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: '4px' }}
              >
                {isPending ? 'Saving…' : modal === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
