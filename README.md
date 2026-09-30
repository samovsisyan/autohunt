# AutoHunt

Car import & sales platform for AutoHunt (Gyumri, Armenia): marketplace of cars in stock, US auction import (Copart / IAAI), a **backend-driven total-cost calculator**, customer dashboard with import tracking, corporate quotes, blog, and an admin panel. Trilingual: Armenian (default), Russian and English.

> **Don't just see the auction price. See the real cost in Armenia.**

## Stack

- **Next.js 16** (App Router, Turbopack, RSC, ISR), **React 19**, **TypeScript**
- **Tailwind CSS v4** with a small custom component system (`src/components/ui`)
- **PostgreSQL + Prisma 7** (`@prisma/adapter-pg`)
- **zod** validation, **jose** JWT sessions (httpOnly cookie), **bcrypt** password hashes
- Image storage: local `public/uploads` or any S3-compatible bucket (AWS S3, Cloudflare R2, DO Spaces)

## Quick start

```bash
cp .env.example .env            # set DATABASE_URL and AUTH_SECRET (openssl rand -hex 32)
npm install                     # also runs `prisma generate`
npx prisma migrate deploy       # or: npm run db:migrate
npm run db:seed                 # demo inventory, rates, blog, customers
npm run dev                     # http://localhost:3000 → redirects to /hy
```

Demo accounts (seed data, change before any real deployment):

| Role | Email | Password |
|---|---|---|
| Admin (`/admin`) | admin@autohunt.am | admin1234 |
| Customer (`/hy/dashboard`) | customer@autohunt.am | demo1234 |
| Corporate customer | corporate@autohunt.am | demo1234 |

## Architecture

```
Browser ──► proxy.ts (locale redirect, auth gate for /admin and /{locale}/dashboard)
   │
   ├─ Server Components (pages, SSG/ISR) ─┐
   ├─ Route handlers  src/app/api/*       ├─► services ─► repositories / Prisma ─► PostgreSQL
   └─ Server actions  src/server/actions  ┘        ▲
                                                   └─ validation (zod) & business rules
```

```
src/
  app/[locale]/…        public site + customer dashboard (hy | ru | en)
  app/admin/…           admin panel (role ADMIN), English UI
  app/api/…             JSON API: calculator, calculations, requests, auth, cars, admin upload
  app/sitemap.ts, robots.ts, opengraph-image.tsx, icon.tsx
  server/
    calculator/engine.ts           pure cost engine – no numbers, only rule *shapes*
    calculator/calculator.repository.ts  loads rates & rules from the DB
    calculator/calculator.service.ts     caching, estimate, save/share
    services/*                     cars, blog, content, SEO, requests, dashboard, storage, auth
    actions/admin/*                admin mutations (all pass through requireAdmin())
    validation/*                   zod schemas for every input
    auth/                          JWT session, password hashing
    seo.ts                         metadata builder: canonical, hreflang, OG/Twitter, admin overrides
  components/ui|layout|cars|calculator|dashboard|admin|home|forms
  i18n/                            locale config, dictionaries (hy/ru/en), deterministic formatters
prisma/schema.prisma, seed.ts, seed-data/
```

### The calculator is backend-driven

The browser only sends inputs (`auction, price, year, engine, fuel, vehicleType, origin, destination`) to `POST /api/calculator/estimate`; every rate lives in the database and is edited at **/admin/calculator**:

| Table | Controls |
|---|---|
| `Auction` + `AuctionFeeTier` | buyer fee = fixed + price × % per price tier |
| `OriginCountry`, `Destination`, `VehicleType`, `ShippingRate` | US inland transport, ocean shipping, land delivery from Poti |
| `CustomsRule` | matched by fuel, vehicle age and engine cc (lowest priority first). duty = max(value × %, cc × €/cc), then excise, VAT %, clearance fee |
| `FeeRule` | documentation / registration / AutoHunt service: fixed or % of car price / subtotal, with min/max |
| `ExchangeRate` | AMD (dram equivalent), EUR (per-cc duty) |
| `Setting: calculator` | whether customs value includes transport + shipping (CIF), reference year |

Pipeline: *vehicle → country → year → engine → fuel → customs rule → shipping rule → fees → estimate*. Results are always labeled **estimated**; imports store a breakdown snapshot, and admins set a separate **final** total after the official assessment.

> ⚠️ The seeded customs rules, fees and shipping prices are **sample values** for demonstration. Verify them against current Armenian customs regulations and your carrier contracts before going live. They include 20% VAT, which is why the $12,000 Camry example totals ~$21.9k.

### Multilingual SEO

- Real localized routes: `/hy/…`, `/ru/…`, `/en/…` (server-rendered, no client-side text swapping)
- Per-page `canonical`, `hreflang` alternates + `x-default`, localized Open Graph / Twitter metadata
- Localized sitemap with alternates; blog posts have per-language slugs, and the language switcher redirects to the right slug
- Schema.org JSON-LD: `AutoDealer` organization, `WebSite` + `SearchAction`, `BreadcrumbList`, `Product`/`Car` + `Offer`, `ItemList`, `BlogPosting`, `FAQPage`, `WebApplication`
- Filtered/sorted listing URLs are `noindex, follow`; dashboard, auth, favorites and compare are `noindex`
- `/admin/seo` overrides title, description, keywords, OG image and canonical for any path + language

### Admin panel (`/admin`)

Dashboard stats · Cars (CRUD, gallery upload & ordering, documents, publish/unpublish, mark sold, per-language descriptions & SEO) · Imports (customer assignment, VIN/lot, financials, calculator-assisted estimate, 9-stage timeline, customer documents; stage changes notify the customer) · Requests (lead inbox with status workflow) · Customers (individual/corporate, create, role) · Calculator settings (above, with a live test runner) · Blog (3-language Markdown editor with preview) · Pages (homepage hero, trust block, FAQ, CTA, contact details per language) · SEO · Languages (translation coverage).

### Performance

Lighthouse (mobile, observed throttling, production build): homepage ~90, `/cars` ~90, calculator ~94, CLS 0; SEO and best practices 100. Main techniques: SSG/ISR for public pages (header login state comes from a non-sensitive hint cookie so pages stay static), `next/image` with AVIF/WebP and responsive sizes, preloaded `display: optional` fonts, lazily loaded modal forms, and `content-visibility` on below-the-fold sections.

## Production checklist

- Set a strong `AUTH_SECRET`, real `NEXT_PUBLIC_SITE_URL`, and change or remove the demo accounts
- Configure `STORAGE_DRIVER=s3` + bucket credentials (car photos then go to cloud storage)
- Replace sample contact details in **/admin/pages → Contact details**
- Review all calculator rates in **/admin/calculator**
- Photos in `public/images` are Unsplash placeholders — replace with your own inventory photos
- The in-memory rate limiter in `src/server/http.ts` is per instance; use Redis/edge rate limiting when running multiple instances

## Scripts

| Command | |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run db:migrate` / `db:seed` / `db:reset` | Prisma |
| `npm run typecheck` / `lint` | tsc / ESLint |
