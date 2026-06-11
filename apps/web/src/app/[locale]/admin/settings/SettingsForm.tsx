'use client';

import { useActionState } from 'react';
import { saveStoreSettingsAction } from './actions';

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  defaultCurrency: string;
  defaultLocale: 'ar' | 'en';
  socialInstagram?: string;
  socialTikTok?: string;
  shippingFreeAed: number;
}

export function SettingsForm({
  locale,
  settings,
}: {
  locale: string;
  settings: StoreSettings;
}) {
  const [state, formAction, pending] = useActionState(
    saveStoreSettingsAction.bind(null, locale),
    null,
  );

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--md-sys-color-outline)',
    borderRadius: '6px',
    background: 'var(--md-sys-color-surface)',
    color: 'var(--md-sys-color-on-surface)',
    fontSize: '0.875rem',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 500,
    marginBottom: '0.25rem',
    color: 'var(--md-sys-color-on-surface-variant)',
  };

  const groupStyle: React.CSSProperties = {
    marginBottom: '1rem',
  };

  return (
    <form action={formAction} style={{ maxWidth: '480px' }}>
      {state?.success && (
        <div style={{ padding: '0.75rem', background: '#e8f5e9', borderRadius: '6px', marginBottom: '1rem', color: '#2e7d32', fontSize: '0.875rem' }}>
          Settings saved successfully
        </div>
      )}
      {state?.error && (
        <div style={{ padding: '0.75rem', background: '#fce4ec', borderRadius: '6px', marginBottom: '1rem', color: '#c62828', fontSize: '0.875rem' }}>
          {state.error}
        </div>
      )}

      <div style={groupStyle}>
        <label style={labelStyle} htmlFor="storeName">Store Name</label>
        <input id="storeName" name="storeName" defaultValue={settings.storeName} style={inputStyle} />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle} htmlFor="storeEmail">Store Email</label>
        <input id="storeEmail" name="storeEmail" type="email" defaultValue={settings.storeEmail} style={inputStyle} />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle} htmlFor="storePhone">Store Phone</label>
        <input id="storePhone" name="storePhone" defaultValue={settings.storePhone} style={inputStyle} />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle} htmlFor="defaultCurrency">Default Currency</label>
        <select id="defaultCurrency" name="defaultCurrency" defaultValue={settings.defaultCurrency} style={inputStyle}>
          <option value="AED">AED</option>
          <option value="SAR">SAR</option>
          <option value="KWD">KWD</option>
          <option value="EGP">EGP</option>
          <option value="USD">USD</option>
        </select>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle} htmlFor="defaultLocale">Default Locale</label>
        <select id="defaultLocale" name="defaultLocale" defaultValue={settings.defaultLocale} style={inputStyle}>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <div style={groupStyle}>
        <label style={labelStyle} htmlFor="socialInstagram">Instagram</label>
        <input id="socialInstagram" name="socialInstagram" defaultValue={settings.socialInstagram ?? ''} style={inputStyle} />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle} htmlFor="socialTikTok">TikTok</label>
        <input id="socialTikTok" name="socialTikTok" defaultValue={settings.socialTikTok ?? ''} style={inputStyle} />
      </div>

      <div style={groupStyle}>
        <label style={labelStyle} htmlFor="shippingFreeAed">Free Shipping Threshold (AED)</label>
        <input id="shippingFreeAed" name="shippingFreeAed" type="number" defaultValue={settings.shippingFreeAed} style={inputStyle} />
      </div>

      <button
        type="submit"
        disabled={pending}
        style={{
          padding: '0.625rem 1.5rem',
          background: pending ? 'var(--md-sys-color-primary-dim)' : 'var(--md-sys-color-primary)',
          color: 'var(--md-sys-color-on-primary)',
          border: 'none',
          borderRadius: '6px',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: pending ? 'not-allowed' : 'pointer',
          marginTop: '0.5rem',
        }}
      >
        {pending ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
}
