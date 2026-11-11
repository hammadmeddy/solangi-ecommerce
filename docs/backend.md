# Solangi backend (local)

## Stack
- **Next.js Route Handlers** under `/api/*`
- **Prisma 5 + SQLite** (`prisma/dev.db`) for local development
- **JWT httpOnly cookie** session (`solangi_session`)
- Demo OTP **`123456`** until SMS is connected

## Setup

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Health check: `GET /api/health`

## API surface
| Route | Purpose |
| --- | --- |
| `POST /api/auth/request-otp` | Create OTP challenge |
| `POST /api/auth/verify-otp` | Verify + set session cookie |
| `GET /api/auth/me` | Current user |
| `POST /api/auth/logout` | Clear session |
| `GET /api/products` | Catalog (`mode`, `category`, `q`, `sellerOnly=1`) |
| `GET /api/products/[id]` | Product detail |
| `GET /api/categories` | Categories |
| `GET/POST /api/orders` | List / place COD orders |
| `POST /api/seller/enable` | Promote the signed-in customer to seller |
| `GET/PUT /api/seller/store` | Seller store profile |
| `GET/POST /api/seller/listings` | Seller's products |
| `PATCH/DELETE /api/seller/listings/[id]` | Update or remove an owned listing |
| `GET /api/media` | Public hero, category, and product image URLs |
| `PATCH /api/admin/media` | Admin photo and announcement updates |

## Hostinger later
1. Provision MySQL (or Postgres)
2. Change `prisma/schema.prisma` `provider` + `DATABASE_URL`
3. Set `SOLANGI_AUTH_SECRET` to a long random value
4. `npx prisma db push && npm run db:seed`
5. Wire real SMS in `request-otp` (stop returning/using fixed `123456` in production)
