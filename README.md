# Lost & Found

Campus Lost & Found — a Next.js + Supabase application for reporting found items, claiming lost belongings, and managing items through an admin dashboard.

## Features

- Authentication (Supabase)
- Public item listing with categories and photos
- Reporting found items (with photos)
- Claim flow for users to request items
- Admin area for approving items, managing categories, and reviewing claims
- Notifications for users (read/unread count)

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + RLS)
- pnpm

## Quick Start

1. Install dependencies

```bash
pnpm install
```

2. Create a `.env.local` at the project root and add the required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
# Optionally add any other environment/config vars your deployment requires
```

3. Run the development server

```bash
pnpm dev
```

Open http://localhost:3000

## Database / Supabase

This app expects a Postgres database (the SQL scripts use Supabase auth schema). The `scripts/` folder contains SQL for schema creation, migrations and seeds:

- [scripts/001_create_schema.sql](scripts/001_create_schema.sql) — full schema with RLS policies, triggers, and tables (profiles, admins, categories, items, item_photos, claims, notifications).
- [scripts/002_add_claim_columns.sql](scripts/002_add_claim_columns.sql) — migration to add admin notes and review timestamp.
- [scripts/002_seed_categories.sql](scripts/002_seed_categories.sql) — seed categories used by the app.

Apply the SQL to your database (for Supabase, run via SQL editor or `psql`):

```bash
# Example with psql (replace connection details):
psql "postgresql://USER:PASSWORD@HOST:PORT/DATABASE" -f scripts/001_create_schema.sql
psql "postgresql://USER:PASSWORD@HOST:PORT/DATABASE" -f scripts/002_add_claim_columns.sql
psql "postgresql://USER:PASSWORD@HOST:PORT/DATABASE" -f scripts/002_seed_categories.sql
```

Notes:
- The schema enables Row Level Security (RLS) and creates policies for profiles, items, claims, and notifications. Keep RLS policies intact when deploying to production.

## Project structure (high level)

- `app/` — Next.js App Router pages and layouts (including `admin/` and `dashboard/`).
- `components/` — Reusable UI components and design system primitives.
- `lib/supabase/` — Supabase helpers and middleware (`client.ts`, `server.ts`, `middleware.ts`).
- `scripts/` — SQL schema, migrations and seeds.
- `styles/` & `app/globals.css` — Tailwind / global styles.

Key files:

- `app/layout.tsx` — Global metadata and fonts.
- `next.config.mjs` — Next config (images unoptimized for this project).
- `postcss.config.mjs` — PostCSS / Tailwind integration.
- `lib/supabase/server.ts` — Server-side Supabase client helper.
- `lib/supabase/client.ts` — Browser Supabase client helper.

## Scripts

Available npm scripts (from `package.json`):

- `pnpm dev` — Run Next.js in development mode
- `pnpm build` — Build for production
- `pnpm start` — Start the production server
- `pnpm lint` — Run ESLint

## Deployment

Recommended: Vercel (first-class for Next.js). Set the same environment variables in your Vercel project and ensure your Supabase DB is reachable from production. The app includes `@vercel/analytics` integration (only used in production).

Image handling: `next.config.mjs` currently sets `images.unoptimized: true` — if you enable image optimization or an external loader, update configuration and environment accordingly.

## Environment variables

Minimum variables used by the app:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key

Server-side code in `lib/supabase/server.ts` also uses the public env values via server helpers. If you need service role/key style operations, follow Supabase best practices and keep service keys out of client-side envs.

## Security & RLS

This project relies on Supabase Row Level Security (RLS). The `scripts/001_create_schema.sql` file creates RLS policies for most tables and enforces ownership checks. Review policies when modifying tables or business logic.

## Contributing

1. Fork the repo
2. Create a feature branch
3. Add tests and ensure linting passes
4. Open a PR describing your changes

## Troubleshooting

- If users are unexpectedly logged out, ensure server-side Supabase clients are created per-request (see `lib/supabase/server.ts` and `lib/supabase/middleware.ts`).
- For CORS or image issues, double-check `next.config.mjs` and external domains.

## License

This repository does not include a license file. Add a license (for example, MIT) if you plan to open source this project.

---

If you'd like, I can also:

- Add a minimal `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` template
- Add a `Makefile` or convenience `pnpm` scripts for DB setup
- Create a short development checklist for reviewers

