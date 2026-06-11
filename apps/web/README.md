# Rehab Store — Web (Next.js)

Storefront app for Rehab Store. Built on Next.js 15 (App Router), TypeScript, React Three Fiber, and `@material/web`.

## Develop

```bash
# from monorepo root
npm install
npm run dev --workspace=@rehab/web
```

Then open http://localhost:3000.

## Stack

- **Next.js 15** App Router + React 19
- **TypeScript** strict mode
- **Material 3** design tokens from `@rehab/tokens` (generated from `material-theme-builder`)
- **`@material/web`** for themed Lit web components
- **React Three Fiber** + drei + WebXR for 3D
- **Zustand** for client state, **TanStack Query** for server state

## Routes (Phase 0 → Phase 1)

- `/` — Home (theme switcher in Phase 0; 3D hero in Phase 1)
- `/shop` *(P1)* — Catalog with faceted filters
- `/product/[slug]` *(P1)* — 3D garment viewer
- `/cart` *(P2)* — Cart drawer / page
- `/about` *(P1)* — Brand story
- `/lookbook` *(P1)* — Editorial lookbook
