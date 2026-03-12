# GateShare

**never miss a flight again**

GateShare helps travelers figure out exactly when to leave for the airport, explains why, and then connects them with others heading the same way to share a ride.

## Quick Start

```bash
# Prerequisites: Node 20+, npm 11+
cp .env.example .env.local

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The app runs fully in demo mode without any external services. Demo mode persists core trip, recommendation, circle, chat, share, and admin edits in browser local storage. Provider integrations remain deterministic mocks unless live credentials are added.

To opt into the unfinished Supabase adapter layer, set `NEXT_PUBLIC_USE_SUPABASE=true`. Leave it `false` for local demo mode.

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
- Flight-number autofill route with live-adapter fallback
- Typed-origin and current-location resolution with deterministic fallback
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
- **Monorepo**: npm workspaces

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start web app |
| `npm run dev:worker` | Start worker |
| `npm run build` | Build all packages |
| `npm run typecheck` | Type-check everything |
| `npm run lint` | Lint everything |
| `npm test` | Run tests |

## Vercel Deployment

This repo is a monorepo. The deployable Next.js app lives in `apps/web`.

Use these Vercel project settings:

1. **Root Directory**: `apps/web`
2. **Framework Preset**: `Next.js`
3. **Install Command**: `npm install`
4. **Build Command**: leave default, or set `npm run build`
5. **Output Directory**: leave empty
6. **Node.js**: `20.x` or newer

The current error:

`No Output Directory named "public" found`

means Vercel imported the repo as a generic static project instead of a Next.js app. Setting the Root Directory to `apps/web` fixes that. The checked-in `apps/web/vercel.json` reinforces the framework/build settings once the project root is correct.

Required environment variables depend on the mode you want:

- Demo mode only: no external API keys required
- Live flight lookup: `FEATURE_LIVE_FLIGHT=true`, `FLIGHTAWARE_API_KEY`
- Live traffic/geocoding: `FEATURE_LIVE_TRAFFIC=true`, `GOOGLE_MAPS_API_KEY`
- Supabase mode: set the Supabase vars from `.env.example` and `NEXT_PUBLIC_USE_SUPABASE=true`

## Supabase Setup (Optional)

The app works without Supabase using persisted demo data. A Supabase repository adapter scaffold exists, but it is not fully wired for CRUD yet. To prepare for Supabase later:

1. Install [Supabase CLI](https://supabase.com/docs/guides/cli)
2. `supabase start`
3. Run migration: `psql -f packages/db/src/migrations/001_initial.sql`
4. Update `.env.local` with your Supabase credentials
5. Set `NEXT_PUBLIC_USE_SUPABASE=true` only after those adapters are finished

## What's Mocked

| Provider | Status | To Make Live |
|----------|--------|-------------|
| Traffic | Mock by default, Google Routes adapter available | Set `FEATURE_LIVE_TRAFFIC=true` and `GOOGLE_MAPS_API_KEY` |
| Flight Status | Mock by default, FlightAware-compatible adapter available | Set `FEATURE_LIVE_FLIGHT=true` and `FLIGHTAWARE_API_KEY` |
| Location Resolve | Deterministic fallback geocoder | Reuses Google Maps key when live traffic/geocoding is enabled |
| Wait Times | Mock (historical model) | Enable MyTSA, crowdsourced |
| Ride Links | Working (deep links) | No API key needed |
| Cost Estimates | Mock (distance heuristic) | Uber/Lyft partner API |
| Notifications | Mock (console.log) | Connect email/push provider |

## License

Private — all rights reserved.
