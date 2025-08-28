# Amit Gardens

A monthly scheduling application for managing gardeners and their assignments.

## Setup

### Requirements

- Node.js 18+
- MongoDB Atlas (or compatible) connection string

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and update the values.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. On first run, visit [`/api/admin/init`](http://localhost:3000/api/admin/init) to create database indexes and seed demo data.

### Build

```bash
npm run build
npm start
```

## Deployment

The project is designed for [Vercel](https://vercel.com/).

Set the following environment variables in the deployment platform:

- `MONGODB_URI`
- `MONGODB_DB`
- `NEXT_ADMIN_EMAIL`
- `NEXT_ADMIN_PASSWORD`
- `CRYPTO_TOKEN_SALT`
- `SESSION_SECRET`

After deploy, run `/api/admin/init` once to prepare the database.

## Security Notes

- Magic links are generated per gardener and stored as SHA-256 hashes using `CRYPTO_TOKEN_SALT`.
- Admin login uses credentials from env variables and a signed session cookie (`SESSION_SECRET`).
- Public routes implement basic rate limiting.
- All API routes use Zod validators and normalized dates (midnight local time) to ensure consistency.

## Development

- TypeScript strict mode, ESLint and Prettier are configured.
- Useful scripts:
  - `npm run dev` – start dev server
  - `npm run build` / `npm start` – build and run production
  - `npm run lint` – run ESLint
  - `npm run format` – format with Prettier

## Features

- Admin dashboard with KPIs, filtering and actions (CSV export, link creation, lock/unlock, reminders).
- Per-gardener plan page with assignment editing and submission flow.
- CSV export uses UTF‑8 with BOM for Hebrew compatibility.

