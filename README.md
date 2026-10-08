# Velvetique Beauty

Storefront and admin for a small-batch beauty shop, built with TanStack Start, React, and Tailwind.

See [cursor-migration.md](./cursor-migration.md) for the codebase map and how to run it.

## Local development

You need Node.js 22+ and npm.

```sh
npm install
npm run dev
```

The dev server listens on [http://localhost:8080](http://localhost:8080).

The shop renders from the local catalog in `src/lib/products.ts` until `DATABASE_URL` is set. See [cursor-migration.md](./cursor-migration.md) for Postgres setup.
