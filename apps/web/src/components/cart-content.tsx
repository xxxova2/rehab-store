'use client';

import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cart';
import { convertFromAED } from '@/lib/format';
import type { Currency } from '@rehab/types';

export function CartContent({ locale, currency }: { locale: string; currency: Currency }) {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();
  const t = useTranslations('cart');
  const tNav = useTranslations('nav');

  if (items.length === 0) {
    return (
      <div className="card" style={{ maxWidth: 540, margin: '0 auto' }}>
        <p className="card__eyebrow">{t('title')}</p>
        <h3 className="card__title">{t('emptyTitle')}</h3>
        <p className="card__body">{t('emptyBody')}</p>
      </div>
    );
  }

  const total = subtotal();
  const formattedTotal = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(convertFromAED(total, currency) / 100);

  return (
    <div className="cart-layout">
      <div className="cart-items">
        {items.map((item) => {
          const price = convertFromAED(item.basePriceCents, currency);
          const lineTotal = price * item.quantity;
          const formattedPrice = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
          }).format(price / 100);
          const formattedLineTotal = new Intl.NumberFormat(locale === 'ar' ? 'ar-AE' : 'en-US', {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
          }).format(lineTotal / 100);

          return (
            <div key={item.id} className="cart-item">
              <div
                className="cart-item-swatch"
                style={{ backgroundColor: item.colorHex }}
              />
              <div className="cart-item-info">
                <a href={`/${locale}/product/${item.slug}`} className="cart-item-title">
                  {item.title}
                </a>
                <p className="cart-item-variant">
                  {item.colorName} / {item.size}
                </p>
                <p className="cart-item-price">{formattedPrice}</p>
              </div>
              <div className="cart-item-qty">
                <button
                  type="button"
                  className="cart-qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="cart-qty-value">{item.quantity}</span>
                <button
                  type="button"
                  className="cart-qty-btn"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <p className="cart-item-total">{formattedLineTotal}</p>
              <button
                type="button"
                className="cart-remove-btn"
                onClick={() => removeItem(item.id)}
                aria-label={t('remove')}
              >
                {t('remove')}
              </button>
            </div>
          );
        })}
      </div>

      <div className="cart-summary">
        <div className="cart-summary-row">
          <span>{t('itemCount', { count: items.reduce((s, i) => s + i.quantity, 0) })}</span>
          <span>{formattedTotal}</span>
        </div>
        <div className="cart-summary-row cart-summary-total">
          <span>{t('subtotal')}</span>
          <span>{formattedTotal}</span>
        </div>
        <button type="button" className="cart-checkout-btn" disabled>
          {t('checkout')}
        </button>
        <a href={`/${locale}/shop`} className="cart-continue-link">
          {t('continueShopping')}
        </a>
      </div>
    </div>
  );
}
