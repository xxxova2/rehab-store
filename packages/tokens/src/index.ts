/**
 * Rehab Store — M3 design tokens (TypeScript).
 * Source of truth: rehab-tokens.json. This file is the typed API.
 */

import tokens from './rehab-tokens.json';

export type M3ColorRole =
  | 'primary'
  | 'onPrimary'
  | 'primaryContainer'
  | 'onPrimaryContainer'
  | 'secondary'
  | 'onSecondary'
  | 'secondaryContainer'
  | 'onSecondaryContainer'
  | 'tertiary'
  | 'onTertiary'
  | 'tertiaryContainer'
  | 'onTertiaryContainer'
  | 'error'
  | 'onError'
  | 'errorContainer'
  | 'onErrorContainer'
  | 'background'
  | 'onBackground'
  | 'surface'
  | 'onSurface'
  | 'surfaceVariant'
  | 'onSurfaceVariant'
  | 'surfaceDim'
  | 'surfaceBright'
  | 'surfaceContainerLowest'
  | 'surfaceContainerLow'
  | 'surfaceContainer'
  | 'surfaceContainerHigh'
  | 'surfaceContainerHighest'
  | 'outline'
  | 'outlineVariant'
  | 'inverseSurface'
  | 'inverseOnSurface'
  | 'inversePrimary'
  | 'surfaceTint'
  | 'scrim';

export type Scheme = 'light' | 'dark';

export const lightScheme: Record<M3ColorRole, string> =
  tokens.schemes.light as Record<M3ColorRole, string>;
export const darkScheme: Record<M3ColorRole, string> =
  tokens.schemes.dark as Record<M3ColorRole, string>;

export function cssVar(role: M3ColorRole): string {
  return `var(--md-sys-color-${kebab(role)})`;
}

function kebab(s: string): string {
  return s.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export const brand = {
  primarySeed: tokens.brand.primarySeed,
  secondarySeed: tokens.brand.secondarySeed,
  tertiarySeed: tokens.brand.tertiarySeed,
  neutralSeed: tokens.brand.neutralSeed,
} as const;

export const typography = tokens.typography;

export type { M3ColorRole as M3Role };
