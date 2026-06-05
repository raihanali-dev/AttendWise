# AttendWise

A modern attendance tracking and prediction platform for college students. Track daily attendance, predict safe skips, and stay above your target with beautiful analytics.

## Features

- Manual daily attendance marking (Present / Absent / No Class)
- Subject management with configurable attendance weights
- Overall and subject-wise attendance calculations
- Prediction engine (classes needed / safe to skip)
- What-if calculator
- Monthly calendar view with color-coded history
- Attendance history with filters, edit, and delete
- Advanced analytics (pie, bar, line charts)
- CSV & Excel export / CSV import
- Dark / light mode with theme toggle
- Fully responsive (desktop + mobile bottom nav)
- Secure authentication with Better Auth

## Tech Stack

- **Frontend:** Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
- **Backend:** Next.js API Routes & Server Actions
- **Auth:** Better Auth
- **Database:** PostgreSQL (Neon)
- **ORM:** Prisma
- **Deployment:** Vercel

## Getting Started

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://user:password@host:5432/attendwise?sslmode=require"
BETTER_AUTH_SECRET="generate-a-secure-random-string-at-least-32-chars"
BETTER_AUTH_URL="http://localhost:3000"
```

Generate a secret:

```bash
openssl rand -base64 32
```

### 3. Database setup

```bash
npx prisma generate
npx prisma migrate deploy
```

For local development with a new database:

```bash
npx prisma migrate dev
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL` — Neon PostgreSQL connection string
   - `BETTER_AUTH_SECRET` — secure random string (32+ chars)
   - `BETTER_AUTH_URL` — your production URL (e.g. `https://attendwise.vercel.app`)
4. Deploy

Run migrations against production:

```bash
npx prisma migrate deploy
```

## Project Structure

```
app/              # Next.js App Router pages
components/       # UI and feature components
lib/              # Auth, Prisma, validations
actions/          # Server actions
utils/            # Attendance logic, import/export
types/            # TypeScript types
prisma/           # Schema and migrations
hooks/            # Custom React hooks
```

## Attendance Logic

| Status   | Attended | Conducted |
|----------|----------|-----------|
| Present  | +weight  | +weight   |
| Absent   | +0       | +weight   |
| No Class | +0       | +0        |

## License

MIT
