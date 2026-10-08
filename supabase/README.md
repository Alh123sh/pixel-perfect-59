# Database

The store uses PostgreSQL in Docker and Drizzle ORM. The browser never connects to the database. TanStack server functions are the only API.

Supabase is not used.

## Local setup

```bash
npm run db:up
npm run db:push
npm run db:seed
npm run dev
```

Copy `.env.example` to `.env.local` first. `DATABASE_URL` must not use a `VITE_` prefix. Docker publishes Postgres on host port 5440 so it does not collide with another database already using 5432.

`npm run db:seed` creates the catalog, the RITUAL10 and WELCOME coupons, and an admin user from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. That password is for this machine only. Change it. Public signup always creates a customer.

Product images uploaded in admin are written to `public/uploads/products/`. That folder is gitignored.

## Checkout

Orders are saved as pending. Prices, stock, coupons, shipping, and tax are read from the database. The browser cannot mark a payment paid. No card numbers are collected. A real payment provider is not connected, so `payment_status` stays `pending` until a server-side webhook exists.
