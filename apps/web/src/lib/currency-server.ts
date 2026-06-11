import { cookies, headers } from 'next/headers';
import type { AppLocale } from '@rehab/types';
import type { Currency } from '@rehab/types';
import { detectCurrency, CURRENCIES } from './format';

const CURRENCY_COOKIE = 'REHAB_CURRENCY';

function isCurrency(v: string | undefined): v is Currency {
  return !!v && (CURRENCIES as string[]).includes(v);
}

export async function getCurrentCurrency(locale: AppLocale): Promise<Currency> {
  const store = await cookies();
  const cookieVal = store.get(CURRENCY_COOKIE)?.value;
  if (isCurrency(cookieVal)) return cookieVal;

  const h = await headers();
  const accept = h.get('accept-language');
  const detected = detectCurrency(accept);

  // In Arabic, prefer regional Arab currency over USD
  if (locale === 'ar' && detected === 'USD') return 'AED';
  return detected;
}
