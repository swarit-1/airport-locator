# GateShare

**Know when to leave. Share the ride.**

GateShare helps travelers figure out exactly when to leave for the airport — then connects them with others heading the same way to share a ride.

## Quick Start

```bash
# Prerequisites: Node 20+, pnpm 9+
cp .env.example .env.local

pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The app runs fully in demo mode without any external services. All providers use deterministic mocks.

## What You'll See

1. **Landing page** — marketing site at `/`
2. **Trip flow** — start at `/trip/new` to see the "Let's move" intro, pick an airline, enter flight details, and get a recommendation
3. **Ride circles** — browse at `/circles`, create new ones, join and chat
4. **Admin** — edit airport/airline rules at `/admin`
5. **Styleguide** — design system reference at `/styleguide`
6. **Airport pages** — SEO pages like `/airport/SEA`

## Architecture

```
├── apps/
│   ├── web/         # Next.js 14 App Router
│   └── worker/      # Background jobs (refresh, matching, expiry)
├── packages/
│   ├── tokens/      # Design tokens (colors, spacing, motion)
│   ├── domain/      # Shared Zod schemas and types
│   ├── providers/   # Provider interfaces, mocks, rec engine
│   ├── db/          # Migrations, seeds
│   ├── ui/          # Shared UI library
│   └── config/      # Environment config and feature flags
└── docs/            # Architecture, design system, mobile roadmap
```

## Key Features

### Home-to-Gate Timing
- Multi-step trip creation flow
- Real recommendation engine (not a magic constant)
- Factors: traffic, security wait times, airline rules, airport walking, risk profile
- Breakdown showing "why this time" with source freshness

### Ride Circles
- Scheduled circles for planned trips
- "Leaving now" circles for on-the-spot matching
- Public, private, or community-scoped
- Group chat
- Uber/Lyft deep link handoff
- Pickup privacy (hidden until confirmed)

### Design System
- Custom design tokens (not default shadcn)
- Signature brand blue palette
- Consistent typography scale, radii, shadows
- Motion system with reduced-motion support
- Styleguide route for QA

## Tech Stack

- **Framework**: Next.js 14, TypeScript strict
- **Styling**: Tailwind CSS with custom design tokens
- **Animation**: Framer Motion
- **Backend**: Supabase (Auth, Postgres + PostGIS, Realtime)
- **Validation**: Zod
- **Monorepo**: pnpm workspaces + Turborepo

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | Type-check everything |
| `pnpm lint` | Lint everything |
| `pnpm test` | Run tests |

## Supabase Setup (Optional)

The app works without Supabase using in-memory demo data. To connect:

1. Install [Supabase CLI](https://supabase.com/docs/guides/cli)
2. `supabase start`
3. Run migration: `psql -f packages/db/src/migrations/001_initial.sql`
4. Update `.env.local` with your Supabase credentials

## What's Mocked

| Provider | Status | To Make Live |
|----------|--------|-------------|
| Traffic | Mock (Haversine heuristic) | Set `GOOGLE_MAPS_API_KEY` |
| Flight Status | Mock (deterministic) | Set `FLIGHTAWARE_API_KEY` |
| Wait Times | Mock (historical model) | Enable MyTSA, crowdsourced |
| Ride Links | Working (deep links) | No API key needed |
| Cost Estimates | Mock (distance heuristic) | Uber/Lyft partner API |
| Notifications | Mock (console.log) | Connect email/push provider |

## License

Private — all rights reserved.
