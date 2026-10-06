# PharmaCare — Pharmacy & Supplement Management System (MVP)

A modern back-office for drugstores and supplement shops: dashboard analytics, product catalog,
inventory movements, sales orders, customers and receivables.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Lucide · Recharts · next-themes

> No database yet — all data comes from realistic mock JSON files in `src/data/`.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 and sign in with the demo account:

| Email | Password |
| --- | --- |
| `admin@pharmacare.ph` | `admin123` |

Requires Node.js 18.18+ (Node 20 or 22 recommended).

## Pages

| Route | What it does |
| --- | --- |
| `/login` | Split-screen sign-in with validation and demo-credential helper |
| `/dashboard` | 6 KPI cards, monthly sales trend, top 10 products, sales by category, reorder alerts, recent orders & payments |
| `/products` | Searchable / filterable catalog with status tabs, add, edit and delete (with confirmation) |
| `/inventory` | Summary cards + stock in / stock out history with filters and a "record movement" dialog |
| `/orders` | Orders table with status tabs, date range, search; **View Order** opens `/orders/[orderNumber]` |
| `/orders/[orderNumber]` | Order detail: line items, totals, customer, invoice and payments received |
| `/customers` | Sortable customer list with purchases, outstanding balance and last purchase |
| `/payments` | Invoices (Paid / Partial / Unpaid / Overdue) with "record payment", plus payment history |
| `/reports` | Sales vs profit, orders per month, receivables aging, collections by method, best sellers, expiry watchlist |
| `/settings` | Business info, profile, appearance (light / dark / system), notifications, team |

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # fonts, theme provider, toaster
│   ├── globals.css             # Tailwind v4 + design tokens (blue / white / emerald), dark mode
│   ├── login/page.tsx
│   ├── (app)/                  # authenticated area (sidebar + top bar)
│   │   ├── layout.tsx
│   │   ├── dashboard/  products/  inventory/  orders/[orderNumber]/
│   │   ├── customers/  payments/  reports/  settings/
│   │   └── loading.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                     # shadcn/ui primitives
│   ├── layout/                 # sidebar, top bar, user menu, notifications, theme toggle
│   ├── charts/                 # Recharts wrappers
│   ├── shared/                 # stat card, status badge, pagination, search, page header
│   └── products/ inventory/ orders/ customers/ payments/ settings/
├── data/                       # mock JSON (products, orders, invoices, payments, …)
├── lib/
│   ├── data.ts                 # data-access layer + metrics (swap for a DB later)
│   ├── constants.ts            # client-safe helpers (categories, stock status)
│   ├── types.ts  utils.ts  auth.ts
└── middleware.ts               # redirects to /login when not signed in
scripts/generate-mock-data.py   # regenerate the mock dataset
```

## Notes

- **"Today" is pinned** to `asOfDate` in `src/data/meta.json` (Oct 6, 2026) so "Sales Today" and overdue
  calculations stay meaningful whenever you run the demo.
- **Add / edit / delete, record payment and record movement** update in-memory state only; a page reload restores the mock data.
- **Auth is mocked** with a cookie (`src/lib/auth.ts` + `src/middleware.ts`). Swap for Auth.js, Clerk or Supabase Auth.
- **Connecting a database:** replace the functions in `src/lib/data.ts` with real queries (Prisma / Drizzle + Postgres
  is a natural fit) and turn the client-side mutations into Server Actions.
- Currency is Philippine Peso (₱); change formatting in `src/lib/utils.ts`.
