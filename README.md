# 💰 Family Finance Planner

A beautiful, mobile-first personal finance app built with Next.js 14, Prisma, and SQLite.

## Features

- **Dashboard** — Net worth at a glance, monthly budget progress, quick actions
- **The Ledger** — Track income & expenses by category, manage recurring subscriptions
- **The Vault** — Monitor bank accounts, investments, and loans (money you owe)

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
echo 'DATABASE_URL="file:./dev.db"' > .env.local

# Push database schema and generate client
npm run db:push

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🐳 Deploy with Dockge

1. **Copy your project** to your server (e.g. `/opt/stacks/family-finance/`)

2. **In Dockge**, create a new stack and paste the contents of `compose.yaml`

3. **Deploy** — the container will:
   - Build the Next.js app
   - Auto-run Prisma migrations on startup
   - Persist your SQLite database in `./finance-data/`

4. **Access** at `http://your-server:3999`

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Database | SQLite via Prisma ORM |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Deployment | Docker / Dockge |

## Data Persistence

All data is stored in an SQLite database at `/data/dev.db` inside the container, mapped to `./finance-data/dev.db` on your host. Your data persists across container restarts and updates.
