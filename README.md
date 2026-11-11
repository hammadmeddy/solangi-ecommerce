# Solangi Ecommerce

Next.js App Router storefront for **solangiecommerce.com**  
Tagline: **YOUR TRUST IS OUR WEALTH**

Separate from Pour-diem. Built for **Hostinger Web Apps** (Node / Next.js).

## Backend (local)

Prisma + SQLite API is live. See [`docs/backend.md`](docs/backend.md).

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
# GET http://127.0.0.1:3000/api/health
```

Demo OTP: **123456** (stored in DB; SMS later).

## Built so far

- Homepage, modes (retail/wholesale/used/services), search + filters
- Auth (API session + OTP) · customer · seller · admin media
- Cart + COD checkout (orders persist to DB when API is up)
- Catalog served from `/api/products` with local fallback

Design theme locked. **Malik pushes GitHub** — agents develop only.

## Scripts

```bash
npm install
npm run db:push
npm run db:seed
npm run dev      # http://localhost:3000 → /en
npm run build
npm run start    # production (Hostinger Web Apps)
```

`next.config.ts` sets `output: "standalone"` for Node hosting.

## Locales & currency

- Locales: `en`, `ur` (RTL for Urdu)
- Currencies (display only): PKR, USD, AED, EUR, GBP

## Still later

- Real SMS OTP · Hostinger MySQL · JazzCash/EasyPaisa/Card · Affiliate/MLM/Investor engines
