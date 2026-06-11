/**
 * Rehab Store — shared types.
 * Mirrors the Medusa product model, plus extensions for 3D + try-on.
 *
 * i18n: any text field shown to a user is `{ en, ar }`. Currency/sizes/IDs stay locale-neutral.
 */

export type Currency = 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'KWD' | 'EGP';

export type Localized = { en: string; ar: string };

export type Size =
  | 'XXS' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL'
  | '24' | '25' | '26' | '27' | '28' | '29' | '30' | '31' | '32';

export type Color = {
  id: string;
  name: Localized;
  hex: string;
  /** material target in the GLB to tint */
  materialTarget?: string;
};

export type ProductImage = {
  url: string;
  alt: Localized;
  width: number;
  height: number;
};

export type Product3D = {
  /** Path to GLB relative to /public */
  glbUrl: string;
  /** USDZ for iOS Quick Look (Phase 3) */
  usdzUrl?: string;
  /** Spline scene URL (https://prod.spline.design/.../scene.splinecode). When set, the product page renders the Spline scene in place of the GLB. */
  splineScene?: string;
  /** Anchor names in the GLB for try-on snap */
  anchors?: string[];
  /** Material zones swappable via color picker */
  colorZones?: string[];
  /** File size in KB, for the loading UX */
  sizeKb?: number;
};

export type Category =
  | 'dresses' | 'tops' | 'bottoms' | 'knitwear'
  | 'outerwear' | 'accessories' | 'shoes';

export type Product = {
  id: string;
  slug: string;
  title: Localized;
  subtitle?: Localized;
  description: Localized;
  category: Category;
  collection?: string;
  /** Base price in cents (AED) — converted to other currencies at display time. */
  basePriceCents: number;
  baseCurrency: Currency;
  images: ProductImage[];
  sizes: Size[];
  colors: Color[];
  materials: Localized[];
  care?: Localized[];
  model3d?: Product3D;
  fitNotes?: Localized;
  editorialBlurb?: Localized;
  inStock: boolean;
  createdAt: string;
};

export type Collection = {
  id: string;
  slug: string;
  title: Localized;
  description: Localized;
  hero?: ProductImage;
  productIds: string[];
};

export type CartLine = {
  id: string;
  productId: string;
  size: Size;
  colorId: string;
  quantity: number;
};

export type Cart = {
  id: string;
  lines: CartLine[];
  subtotalCents: number;
  currency: Currency;
};

export type Order = {
  id: string;
  number: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'cancelled';
  totalCents: number;
  currency: Currency;
  lines: CartLine[];
  placedAt: string;
};

/** Type-safe locale key. */
export type AppLocale = 'ar' | 'en';

/** Pick the locale-specific value from a `Localized`. */
export function pickLocalized<T>(value: { en: T; ar: T }, locale: AppLocale): T {
  return value[locale] ?? value.en;
}
