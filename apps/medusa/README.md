# Rehab Store — Backend (Medusa)

Headless commerce backend for Rehab Store, on [Medusa.js v2](https://medusajs.com).

## Develop

```bash
# from monorepo root
docker compose -f infra/docker-compose.yml up -d    # postgres + redis
cp .env.example .env
npm install
npm run dev --workspace=@rehab/medusa
```

Medusa server boots on `http://localhost:9000` and admin on `http://localhost:7001`.

## Seed

```bash
npm run seed --workspace=@rehab/medusa
```

## Status

- [x] Medusa v2 scaffold with monorepo-friendly tsconfig
- [x] Postgres + Redis via docker-compose
- [ ] Stripe plugin (Phase 2)
- [ ] File storage plugin (Phase 1, for product imagery)
- [ ] Email / notification plugin (Phase 2)
- [ ] Custom product model with `model3d` JSON column (Phase 1)
