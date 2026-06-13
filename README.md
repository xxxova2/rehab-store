# Rehab Store

> 3D-friendly women's clothing webstore for the Rehab brand.
> **Arabic-first, headless commerce, M3 design tokens, Next.js 15 + React Three Fiber, Supabase, Playwright.**

[![CI](https://github.com/xxxova2/rehab-store/actions/workflows/ci.yml/badge.svg)](https://github.com/xxxova2/rehab-store/actions/workflows/ci.yml)

## Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + React 18 + R3F + `@material/web`
- **i18n:** next-intl with `[locale]` segment, Arabic default + English
- **Backend:** Supabase (Postgres + Auth + Storage) — previously Medusa.js
- **Design:** Material 3 tokens from `material-foundation/material-theme-builder`
- **Testing:** Playwright (Chromium, Firefox, WebKit) + vitest
- **Package manager:** npm workspaces

## Repo layout

```
.
├── apps/
│   ├── web/         # Next.js storefront (AR + EN)
│   └── medusa/      # Medusa backend (legacy)
├── packages/
│   ├── ui/          # M3-themed web component wrappers
│   ├── tokens/      # M3 design tokens (CSS vars)
│   ├── three/       # R3F scenes, garment viewer, mannequin, AR
│   └── types/       # Shared TypeScript types
├── scripts/         # seed, asset-fetch, theme-export
├── infra/           # docker-compose, deploy configs
└── .github/         # CI workflows (typecheck → E2E → Vercel deploy)
```

## Quick start

```bash
# 1. Install
npm install

# 2. Clone reference repos (one-time)
git clone https://github.com/material-foundation/material-theme-builder.git tools/material-theme-builder
git clone https://github.com/microsoft/playwright.git tools/playwright

# 3. Generate Rehab theme tokens
npm run theme:export

# 4. Run the storefront
npm run dev --workspace=apps/web
# → open http://127.0.0.1:3000  (auto-redirects to /ar)

# 5. Run E2E tests
npm run test:e2e
```

## Locales & currencies

- **Default locale:** `ar` (Arabic) — every visit to `/` is 307-redirected to `/ar`.
- **Secondary:** `en` (English) — accessible at `/en/*`.
- **Switcher:** the top bar carries both a locale switch (AR / EN) and a currency switch (AED · SAR · KWD · EGP · USD).
- **Persisted via cookies:** `REHAB_LOCALE`, `REHAB_CURRENCY`.
- **Prices use Western digits** (`font-feature-settings: 'lnum' 1`) — readable in both scripts.
- **Fonts:**
  - AR display: **Reem Kufi** · AR body: **IBM Plex Sans Arabic**
  - EN display: **Playfair Display** · EN body: **Inter** · Mono: **JetBrains Mono**

## Phases

See [ROADMAP.md](./ROADMAP.md) for the full plan.

- [x] **Phase 0** — Foundation (monorepo, tokens, tooling)
- [x] **Phase 0.5** — i18n + RTL (Arabic-first, 5 currencies, 8 sample products × 2 locales)
- [ ] **Phase 1** — Storefront + 3D (hero, viewer, mannequin, Medusa wiring)
- [ ] **Phase 2** — Cart, checkout, auth
- [ ] **Phase 3** — AR try-on, polish, launch
- [ ] **Phase 4** — Growth

## Brand

- **Wordmark:** *R rehab STORE* — Latin wordmark with circular "R" mark.
- **Headline (AR):** «الموضة هي الاساس ونحن لنا لمستنا الخاصة» — *Fashion is the foundation. We bring the touch.*
- **Primary:** `#1A1A1A` Ink Black
- **Secondary:** `#C8A27A` Warm Sand
- **Tertiary:** `#D67A8A` Rehab Rose
- **Surface:** `#FAF7F2` Bone

## Adding products

Until Medusa is wired up, products are JSON-driven:

1. Edit `apps/web/src/data/products.json` — add a new entry following the `Product` type in `packages/types/src/index.ts`.
2. Each product needs `title.en` + `title.ar` (and the other localized fields) and a `basePriceCents` in **AED**.
3. The storefront picks up the new product immediately on dev server reload.

When Medusa is ready:

1. `cd apps/medusa && docker compose -f ../../infra/docker-compose.yml up -d`
2. `npm run seed --workspace=apps/medusa`
3. The `lib/products.ts` resolvers will switch over to Medusa SDK calls.

## License

Proprietary — © Rehab Store.
