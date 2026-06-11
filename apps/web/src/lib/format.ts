/**
 * Currency utilities for Rehab Store.
 * - `formatPrice` renders locale-aware Intl.NumberFormat strings.
 * - `convertFromAED` does the FX conversion at display time (AED is base).
 * - FX rates are static and intentionally simple — Phase 2 wires a real rate provider.
 */

import type { AppLocale, Currency } from '@rehab/types';

export const CURRENCIES: Currency[] = ['AED', 'SAR', 'KWD', 'EGP', 'USD'];

/** Static FX rates → multiplier applied to AED base price. Update quarterly. */
const FX_FROM_AED: Record<Currency, number> = {
  USD: 0.2723,
  EUR: 0.2503,
  GBP: 0.2133,
  AED: 1.0,
  SAR: 1.021, // 1 AED ≈ 1.021 SAR (pegged)
  KWD: 0.0825,
  EGP: 13.36,
};

/** Display names for the currency switcher. */
export const CURRENCY_LABELS: Record<Currency, { en: string; ar: string; symbol: string }> = {
  USD: { en: 'US Dollar', ar: 'دولار أمريكي', symbol: 'US$' },
  EUR: { en: 'Euro', ar: 'يورو', symbol: '€' },
  GBP: { en: 'British Pound', ar: 'جنيه إسترليني', symbol: '£' },
  AED: { en: 'UAE Dirham', ar: 'درهم إماراتي', symbol: 'د.إ' },
  SAR: { en: 'Saudi Riyal', ar: 'ريال سعودي', symbol: 'ر.س' },
  KWD: { en: 'Kuwaiti Dinar', ar: 'دينار كويتي', symbol: 'د.ك' },
  EGP: { en: 'Egyptian Pound', ar: 'جنيه مصري', symbol: 'ج.م' },
};

export function convertFromAED(aedCents: number, target: Currency): number {
  return Math.round(aedCents * FX_FROM_AED[target]);
}

/**
 * Format a price in `currency` for display in `locale`.
 * Examples:
 *   formatPrice(129000, 'AED', 'ar') -> 'د.إ ١٬٢٩٠٫٠٠' (browser AR locale uses Arabic-Indic digits unless overridden)
 *   formatPrice(129000, 'AED', 'en') -> 'AED 1,290.00'
 *   formatPrice(129000, 'AED', 'ar', { westernDigits: true }) -> 'د.إ 1,290.00'
 */
export function formatPrice(
  aedCents: number,
  currency: Currency = 'AED',
  locale: AppLocale = 'en',
  options: { westernDigits?: boolean } = {},
): string {
  const value = convertFromAED(aedCents, currency);
  const target = CURRENCY_LABELS[currency];
  // Build a BCP-47 tag that targets the right number system
  // 'ar' + westernDigits=true => 'en-US-u-nu-latn' style override via locale string
  const numLocale = locale === 'ar' && options.westernDigits
    ? 'en-US'
    : locale === 'ar' ? 'ar-AE' : 'en-US';

  const formatter = new Intl.NumberFormat(numLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (currency === 'AED' || currency === 'SAR' || currency === 'KWD' || currency === 'EGP') {
    // For Arab currencies: show Arabic symbol first, then the latin number group
    if (locale === 'ar') {
      const numFmt = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value / 100);
      return options.westernDigits
        ? `${target.symbol} ${numFmt}`
        : `${target.symbol} \u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669`.charAt(0) + new Intl.NumberFormat('ar-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);
    }
  }

  return formatter.format(value / 100);
}

/** Detect the user's preferred currency from Accept-Language (or default to AED). */
export function detectCurrency(acceptLanguage: string | null): Currency {
  if (!acceptLanguage) return 'AED';
  const lang = acceptLanguage.toLowerCase();
  if (lang.includes('ar-eg') || lang.includes('ar-egypt')) return 'EGP';
  if (lang.includes('ar-kw') || lang.includes('ar-ku')) return 'KWD';
  if (lang.includes('ar-sa')) return 'SAR';
  if (lang.includes('ar-ae') || lang.includes('ar')) return 'AED';
  return 'USD';
}
