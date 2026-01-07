# Codegram

> Turn doom scrolling into doom coding

Mobile-first PWA that shows an infinite feed of coding project ideas. Like an idea, and an AI job creates a real GitHub repo with a working starter.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **PWA support** (next-pwa)
- **tRPC** (type-safe API)
- **Drizzle ORM** + **PostgreSQL**
- **TanStack Query**

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Setup Database

Asegúrate de tener PostgreSQL corriendo. Actualiza `.env` con tu connection string:

```env
DATABASE_URL="postgresql://localhost:5432/codegram"
```

### 3. Push schema to DB

```bash
pnpm db:push
```

### 4. Seed database

```bash
pnpm db:seed
```

### 5. Run dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or browser.

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm db:push` - Push schema to database
- `pnpm db:seed` - Seed database with mock data
- `pnpm db:studio` - Open Drizzle Studio (DB GUI)

## Features

- ✅ PWA support (installable on mobile)
- ✅ Mobile-first design
- ✅ tRPC API (type-safe)
- ✅ PostgreSQL + Drizzle ORM
- ✅ Like/unlike ideas
- ⏳ AI repo generation (coming soon)
- ⏳ GitHub integration (coming soon)

## Project Structure

```
codegram/
├── app/
│   ├── api/trpc/          # tRPC API routes
│   ├── layout.tsx         # Root layout + providers
│   └── page.tsx           # Main feed page
├── components/
│   └── idea-card.tsx      # Idea card component
├── lib/
│   ├── db/                # Database (schema, client)
│   └── trpc/              # tRPC (router, provider)
├── scripts/
│   └── seed.ts            # DB seed script
└── public/                # PWA assets
```

---

Built with joy and momentum 🚀

