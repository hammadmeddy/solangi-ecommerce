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

OTP is emailed (Gmail SMTP). If SMTP is not configured locally, the API returns a demo hint code.

## Built so far

- Homepage, modes (retail/wholesale/used/services), search + filters
- Auth (API session + **email OTP**) · customer · seller · admin media
- Server-synced cart (when signed in) + COD checkout
- Admin order status updates · DB-backed reviews
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

`next.config.mjs` sets `output: "standalone"`. On Hostinger use `next build --webpack` (Next 16.3+ / old glibc).

## Locales & currency

- Locales: `en`, `ur` (RTL for Urdu)
- Currencies (display only): PKR, USD, AED, EUR, GBP

## Still later

- Hostinger MySQL · JazzCash/EasyPaisa/Card · Affiliate/MLM/Investor engines
