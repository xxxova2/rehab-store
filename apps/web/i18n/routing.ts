import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['ar', 'en'] as const,
  defaultLocale: 'ar',
  localePrefix: 'as-needed',
  localeCookie: {
    name: 'REHAB_LOCALE',
    maxAge: 60 * 60 * 24 * 365,
  },
  pathnames: {
    '/': '/',
    '/shop': '/shop',
    '/cart': '/cart',
    '/about': '/about',
    '/lookbook': '/lookbook',
    '/product/[slug]': '/product/[slug]',
    '/admin/login': '/admin/login',
  },
});

export type AppLocale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

export const LOCALE_LABELS: Record<AppLocale, string> = {
  ar: 'العربية',
  en: 'English',
};

export const LOCALE_FLAGS: Record<AppLocale, string> = {
  ar: 'AR',
  en: 'EN',
};

export const LOCALE_DIR: Record<AppLocale, 'ltr' | 'rtl'> = {
  ar: 'rtl',
  en: 'ltr',
};

/** Union of valid href paths for typed next-intl navigation. */
export type AppHref = '/' | '/shop' | '/cart' | '/about' | '/lookbook' | '/admin/login';

export function isAppLocale(value: string): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value);
}
