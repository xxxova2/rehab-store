# Rehab Store — Roadmap

> Generated Phase 0 build · See [README.md](./README.md) for stack details.

## Phase 0 — Foundation ✅
- [x] Monorepo with npm workspaces
- [x] Reference repos cloned (`tools/material-theme-builder`, `tools/playwright`)
- [x] Apps scaffolded (Next.js, Medusa)
- [x] Shared packages (tokens, ui, three, types)
- [x] Playwright + smoke test
- [x] M3 theme tokens for Rehab brand
- [x] docker-compose for Medusa stack
- [x] GitHub Actions CI

## Phase 0.5 — i18n + RTL (Arabic-first) ✅
- [x] next-intl with `[locale]` segment (ar default, en secondary)
- [x] Root `/` → 307 → `/ar` (locale cookie set)
- [x] `<html lang="ar" dir="rtl">` / `<html lang="en" dir="ltr">`
- [x] Locale switcher (ar/en) in top bar
- [x] Currency switcher (AED · SAR · KWD · EGP · USD) with cookie persistence
- [x] Reem Kufi + IBM Plex Sans Arabic for AR; Playfair + Inter for EN
- [x] `font-feature-settings: 'lnum' 1` for Western digits in prices
- [x] 8 sample products × 2 locales × 5 currencies (JSON fallback)
- [x] `/product/[slug]` localized detail page (color, size, materials, care, fit, related)
- [x] All copy externalized into `messages/ar.json` and `messages/en.json`
- [x] Logical CSS properties (margin/padding-inline-*, inset-inline-*)
- [x] Build: 30+ static/SSG pages prerendered

## Phase 1 — Storefront + 3D
- [ ] Routes: `/`, `/shop`, `/product/[slug]`, `/cart`, `/about`, `/lookbook`
- [ ] Header, nav, search, cart drawer (M3 sheet)
- [ ] Home: R3F hero + featured collections + journal teaser
- [ ] Shop: faceted filters, product card with 3D tilt
- [ ] Product page: 3D garment viewer (GLB, OrbitControls, color swatches)
- [ ] Virtual mannequin (body GLB + sliders)
- [ ] CC0 garment asset pipeline (6–8 samples)
- [ ] Medusa wiring (products, collections, regions)
- [ ] Playwright: nav / filter / product / add-to-cart
- [ ] Lighthouse ≥ 90

## Phase 2 — Cart, Checkout, Auth
- [ ] Persistent cart (Zustand + Medusa cart ID)
- [ ] Cart drawer → checkout → Stripe (test mode)
- [ ] Order confirmation with 3D celebration
- [ ] NextAuth email magic link + Medusa customer linking
- [ ] Wishlist, order history, account
- [ ] Playwright full purchase flow + visual baselines

## Phase 3 — AR Try-On + Polish
- [ ] WebXR try-on with `@react-three/xr`
- [ ] Photo try-on (homography MVP)
- [ ] SEO: schema.org, sitemap, dynamic OG
- [ ] A11y: keyboard 3D nav, captions, reduced motion
- [ ] Performance: Draco + Meshopt, lazy load, RSC
- [ ] `@playwright/mcp` visual review pass
- [ ] axe-core zero violations

## Phase 4 — Launch & Growth
- [ ] Vercel (web) + Fly.io (Medusa) + S3 + Cloudflare
- [ ] Algolia search
- [ ] Email flows (Resend)
- [ ] Plausible / PostHog
- [ ] Real GLB model pipeline
