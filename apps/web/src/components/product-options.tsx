'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cart';
import type { Product } from '@rehab/types';
import styles from '@/app/[locale]/(main)/product/[slug]/product.module.css';

export function ProductOptions({
  product,
  locale,
}: {
  product: Product;
  locale: string;
}) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.id ?? '');
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? '');
  const addItem = useCartStore((s) => s.addItem);
  const t = useTranslations('product');
  const lang = locale as 'ar' | 'en';

  const color = product.colors.find((c) => c.id === selectedColor) ?? product.colors[0];

  const handleAdd = () => {
    if (!color) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title[lang],
      image: product.images[0]?.url ?? '',
      basePriceCents: product.basePriceCents,
      size: selectedSize,
      colorId: color.id,
      colorName: color.name[lang],
      colorHex: color.hex,
      quantity: 1,
    });
  };

  return (
    <>
      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{t('selectColor')}</h2>
        <div className={styles.colors} role="radiogroup" aria-label={t('selectColor')}>
          {product.colors.map((c) => (
            <button
              key={c.id}
              type="button"
              className={styles.colorChip}
              aria-label={c.name[lang]}
              style={{
                background: c.hex,
                borderColor: c.id === selectedColor ? 'var(--md-sys-color-primary)' : undefined,
                transform: c.id === selectedColor ? 'scale(1.15)' : undefined,
              }}
              title={c.name[lang]}
              onClick={() => setSelectedColor(c.id)}
            />
          ))}
        </div>
      </section>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{t('selectSize')}</h2>
        <div className={styles.sizes} role="radiogroup" aria-label={t('selectSize')}>
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              className={styles.sizeChip}
              style={{
                background: s === selectedSize ? 'var(--md-sys-color-primary)' : undefined,
                color: s === selectedSize ? 'var(--md-sys-color-on-primary)' : undefined,
                borderColor: s === selectedSize ? 'var(--md-sys-color-primary)' : undefined,
              }}
              onClick={() => setSelectedSize(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      <button type="button" className={styles.addToCart} onClick={handleAdd}>
        {t('addToCart')}
      </button>
    </>
  );
}
