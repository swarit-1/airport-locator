# Boarding

**never miss a flight again**

Boarding is a full-stack travel companion that calculates exactly when to leave for the airport, explains every minute of the breakdown, and connects travelers heading the same way to share rides. It ships as a Next.js web app, an Expo React Native mobile app, and a background worker — all sharing domain logic through a monorepo of typed packages.

---

## Table of Contents

- [Quick Start](#quick-start)
- [Mobile App](#mobile-app)
- [Architecture](#architecture)
- [What You'll See](#what-youll-see)
- [Key Features](#key-features)
- [Design System](#design-system)
- [Commands](#commands)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [Supabase Setup](#supabase-setup-optional)
- [Provider Status](#provider-status)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Quick Start

### Prerequisites

- **Node.js** 20 or newer
- **npm** 11 or newer (ships with Node 20+)
- No external services required — the app runs fully in demo mode

### Install & Run

```bash
# 1. Clone
git clone https://github.com/swarit-1/airport-locator.git
cd airport-locator

# 2. Copy environment file
cp .env.example .env

# 3. Install all workspace dependencies
npm install

# 4. Start the web app
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

The app starts in **demo mode** by default. All data persists in a file-backed JSON store (`.demo-data/store.json`) that is server-readable, so SSR pages like `/share/[id]` and `/circles/[id]` work immediately. No database, no API keys, no external services needed.

### Start the Worker (Optional)

The background worker handles recommendation refresh, circle matching, and expiry:

```bash
npm run dev:worker
```

---

## Mobile App

The Expo React Native app lives in `apps/mobile/`. It shares all domain logic, schemas, design tokens, and provider interfaces with the web app.

### Setup

```bash
# Install Expo CLI globally (if you haven't)
npm install -g expo-cli

# Install mobile dependencies
cd apps/mobile
npx expo install

# Start the Expo dev server
npx expo start
```

From there:
- Press **i** to open in iOS Simulator
- Press **a** to open in Android Emulator
- Scan the QR code with Expo Go on a physical device

### Mobile Screens

| Screen | Description |
|--------|-------------|
| **Home** | Hero branding, quick actions (Plan a Trip, Scan Boarding Pass), popular airports |
| **Trips** | List of saved trips with flight details |
| **Trip New** | Multi-step trip creation: airline → flight → origin → preferences → recommendation |
| **Trip Detail** | Leave time, timeline breakdown, key times, share |
| **Circles** | Browse ride-sharing circles |
| **Circle Detail** | Circle info, members, real-time chat |
| **Airport** | Airport rules by flight type, security times, quick links |
| **Profile** | Display name, TSA PreCheck/CLEAR toggles, sign out |
| **Settings** | 12 notification preference toggles (leave time, delays, gate changes, etc.) |
| **Boarding Pass** | BCBP barcode parser + camera scanner placeholder |

### EAS Build (Production)

```bash
cd apps/mobile
eas build --platform ios
eas build --platform android
```

---

## Architecture

```
airport-locator/
├── apps/
│   ├── web/              # Next.js 16 App Router (TypeScript, Tailwind, Framer Motion)
│   ├── mobile/           # Expo React Native (TypeScript, React Navigation)
│   └── worker/           # Background jobs (Node + TypeScript, interval-based)
├── packages/
│   ├── tokens/           # Design tokens — colors, spacing, motion, shadows, radii
│   ├── domain/           # Shared Zod schemas and TypeScript types
│   ├── providers/        # Provider interfaces, mocks, recommendation engine
│   ├── db/               # Migrations, seeds (airports, airlines, dining)
│   ├── ui/               # Shared web UI components (re-exports tokens)
│   ├── ui-native/        # React Native UI components (maps tokens to StyleSheet)
│   └── config/           # Environment config and feature flags
├── docs/                 # Architecture docs, design system, mobile roadmap
└── .demo-data/           # Auto-created file store for demo persistence
```

### How It Fits Together

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   apps/web      │    │   apps/mobile    │    │   apps/worker   │
│   (Next.js)     │    │   (Expo RN)      │    │   (Node cron)   │
└────────┬────────┘    └────────┬─────────┘    └────────┬────────┘
         │                      │                       │
         │    ┌─────────────────┴───────────────┐       │
         │    │        Shared Packages           │       │
         ├────┤  @boarding/domain (Zod schemas)  ├───────┤
         │    │  @boarding/providers (engine)     │       │
         │    │  @boarding/config (feature flags) │       │
         │    │  @boarding/tokens (design system) │       │
         │    │  @boarding/db (seeds & migrations)│       │
         │    └──────────────────────────────────┘       │
         │                                               │
    ┌────┴────────────────────────────────────────┬──────┘
    │              Data Layer                      │
    │  Demo: file-backed JSON store               │
    │  Prod: Supabase (Postgres + PostGIS + Auth) │
    └─────────────────────────────────────────────┘
```

---

## What You'll See

| Route | What It Does |
|-------|-------------|
| `/` | Landing page — editorial marketing site |
| `/trip/new` | "Let's move" intro → airline picker → flight details → origin → preferences → recommendation |
| `/share/[id]` | Server-rendered shareable recommendation page |
| `/circles` | Browse ride-sharing circles |
| `/circles/[id]` | Circle detail with chat (server-rendered initial state) |
| `/airport/SEA` | Airport info page with timing rules (10 airports, SSG) |
| `/admin` | Admin dashboard |
| `/admin/providers` | Live provider status (reads real runtime config) |
| `/admin/airports` | Edit airport timing rules |
| `/admin/airlines` | Edit airline policies |
| `/admin/reports` | Review user reports |
| `/styleguide` | Design system reference |
| `/login` | Demo auth (email only, no password) |
| `/profile` | User profile with travel preferences |

---

## Key Features

### Home-to-Gate Timing Engine

The recommendation engine (`packages/providers/src/engine/recommendation.ts`) is a real multi-factor calculator, not a magic constant:

- **Traffic**: Live or mock drive time from origin to airport
- **Pickup buffer**: Varies by ride mode (rideshare 5 min, friend dropoff 10 min, etc.)
- **Bag check path**: Curb → bag drop → security (airport-specific timings)
- **Security wait**: Live TSA data, crowdsourced reports, or historical model — discounted for PreCheck/CLEAR
- **Gate walk**: Airport-specific, adjusted for accessibility/kids
- **Risk buffer**: Conservative (1.5x), balanced (1.0x), aggressive (0.7x) multipliers
- **Party size**: +5 min for groups >3
- **International buffer**: +15 min
- **Confidence scoring**: Based on data source freshness and reliability

Each factor produces a breakdown item with label, minutes, description, source, and freshness timestamp.

### Ride Circles

- Scheduled circles for planned trips
- "Leaving now" circles for on-the-spot matching
- Public, private, or community-scoped visibility
- Real-time group chat
- Circle matching engine: scores by safety (50%), savings (30%), convenience (20%)
- Uber/Lyft deep-link handoff
- Pickup privacy (location hidden until confirmed)

### Airport Dining

- 28 curated restaurants across 10 major US airports
- Filterable by terminal, gate proximity, cuisine, dietary needs
- Walk time from security, estimated wait, mobile ordering support
- API endpoint: `GET /api/airport/[iata]/dining`

### Boarding Pass Scanner

- BCBP (IATA Resolution 792) barcode parser
- Extracts: passenger name, flight number, date, airports, seat, booking reference
- Auto-creates trip from parsed data
- Camera scanning available in Expo development builds

### Auto Check-In (Interface Ready)

- `CheckInProvider` interface with mock implementation
- Supports scheduling check-in at T-24h
- Deep-link fallback to airline's mobile check-in page

### Demo Persistence

Core data persists in a file-backed JSON store (`.demo-data/store.json`):
- Server components read the file store directly (SSR works)
- Client components read from localStorage for speed
- Client mutations sync to the file store via `POST /api/store` (fire-and-forget)
- Cookie-based demo auth via `/api/auth/*` routes

---

## Design System

The design system is defined in `packages/tokens/` and mapped to React Native in `packages/ui-native/`.

| Token | Web | React Native |
|-------|-----|-------------|
| **Brand blue** | `#1E4AA8` (CSS) | `themeColors.brand[500]` |
| **Spacing** | `1rem` / `0.5rem` (CSS) | `themeSpacing[4]` → `16` / `themeSpacing[2]` → `8` |
| **Radii** | `0.5rem` (CSS) | `themeRadii.lg` → `8` |
| **Shadows** | CSS `box-shadow` | `themeShadows.md` (shadowColor, offset, opacity, elevation) |
| **Motion** | `250ms` (CSS) | `themeMotion.duration.normal` → `250` |
| **Tap target** | `44px` min | `themeLayout.tapTarget` → `44` |

### Typography Scale

| Variant | Size | Usage |
|---------|------|-------|
| `hero` | 72px | Landing page hero text |
| `h1` | 30px | Page titles |
| `h2` | 24px | Section headers |
| `h3` | 20px | Card headers |
| `body` | 16px | Body text |
| `bodySmall` | 14px | Secondary text |
| `caption` | 12px | Labels, metadata |
| `overline` | 10px | Badges, category labels |

### Fonts

- **Sans**: Manrope (web) / System (native)
- **Display**: Newsreader (web) / System (native)
- **Mono**: JetBrains Mono (web) / Courier (native)

---

## Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all workspace dependencies |
| `npm run dev` | Start web app on port 3000 |
| `npm run dev:worker` | Start background worker |
| `npm run build` | Build all packages and apps |
| `npm run typecheck` | Type-check all packages |
| `npm run lint` | Lint all packages |
| `npm test` | Run all tests (Vitest) |

### Mobile-Specific

| Command | Description |
|---------|-------------|
| `cd apps/mobile && npx expo start` | Start Expo dev server |
| `cd apps/mobile && npx expo start --ios` | Open in iOS Simulator |
| `cd apps/mobile && npx expo start --android` | Open in Android Emulator |
| `cd apps/mobile && eas build --platform ios` | Build for iOS (EAS) |
| `cd apps/mobile && eas build --platform android` | Build for Android (EAS) |

---

## Environment Variables

Copy `.env.example` to `.env` and configure as needed:

```bash
# ─── Core ────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── Supabase (optional — app works without it) ─────
NEXT_PUBLIC_USE_SUPABASE=false
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# ─── Feature Flags (all off by default) ─────────────
FEATURE_LIVE_TRAFFIC=false         # Enable Google Routes traffic
FEATURE_LIVE_FLIGHT=false          # Enable FlightAware flight lookup
FEATURE_LIVE_WAIT_TIMES=false      # Enable TSA wait time APIs
FEATURE_MY_TSA=false               # Enable MyTSA integration
FEATURE_AUTO_CHECKIN=false         # Enable auto check-in
FEATURE_BOARDING_PASS_SCAN=false   # Enable boarding pass scanning
FEATURE_WALLET_INTEGRATION=false   # Enable Apple Wallet integration
FEATURE_AIRPORT_DINING=false       # Enable airport dining
FEATURE_CROWDSOURCED_WAIT=false    # Enable crowdsourced wait times
FEATURE_PUSH_NOTIFICATIONS=false   # Enable push notifications
FEATURE_TRAVEL_MANAGEMENT=false    # Enable travel management integration
NEXT_PUBLIC_FEATURE_PHONE_VERIFICATION=false

# ─── Provider API Keys ──────────────────────────────
GOOGLE_MAPS_API_KEY=               # For live traffic + geocoding
FLIGHTAWARE_API_KEY=               # For live flight status
TSA_API_KEY=                       # For TSA wait times
CLAUDE_API_KEY=                    # For AI features
```

---

## Vercel Deployment

The web app deploys to Vercel from the monorepo root.

### Vercel Project Settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `apps/web` |
| **Framework Preset** | Next.js |
| **Install Command** | `npm install --legacy-peer-deps` |
| **Build Command** | `npm run build` |
| **Node.js Version** | 20.x or newer |

These are also enforced by `apps/web/vercel.json`.

### Environment Variables on Vercel

For demo mode (no external services):
- No environment variables required — the app uses mocks and the file store writes to `/tmp` on Vercel

For live providers, add the relevant feature flags and API keys from the table above.

### How Demo Persistence Works on Vercel

On Vercel's serverless platform, the file store automatically uses `/tmp` instead of the project directory. Data persists within a single serverless function container's lifetime but resets on cold starts. The seed data (airports, airlines, demo circles) always auto-populates on first read.

---

## Supabase Setup (Optional)

The app works without Supabase using persisted demo data. To enable the Supabase adapter layer:

```bash
# 1. Install Supabase CLI
brew install supabase/tap/supabase

# 2. Start local Supabase
supabase start

# 3. Run migrations
psql -f packages/db/src/migrations/001_initial.sql

# 4. Update .env with Supabase credentials
NEXT_PUBLIC_USE_SUPABASE=true
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-supabase-start-output>
SUPABASE_SERVICE_ROLE_KEY=<from-supabase-start-output>
```

> **Note**: The Supabase adapter is scaffolded but not fully wired for production CRUD. Only set `NEXT_PUBLIC_USE_SUPABASE=true` once the adapters are complete.

---

## Provider Status

All providers are mock by default. Feature flags switch to real adapters:

| Provider | Mock | Live Adapter | Enable With |
|----------|------|-------------|------------|
| **Traffic** | Haversine distance + time-of-day multiplier | Google Routes API | `FEATURE_LIVE_TRAFFIC=true` + `GOOGLE_MAPS_API_KEY` |
| **Flight Status** | Seed data lookup | FlightAware API | `FEATURE_LIVE_FLIGHT=true` + `FLIGHTAWARE_API_KEY` |
| **Wait Times** | Historical model (per-airport) | TSA API + crowdsourced | `FEATURE_LIVE_WAIT_TIMES=true` + `TSA_API_KEY` |
| **Location** | Deterministic fallback geocoder | Google Geocoding | Reuses `GOOGLE_MAPS_API_KEY` |
| **Ride Links** | Deep links (working) | No API key needed | Always on |
| **Cost Estimates** | Distance heuristic | Uber/Lyft partner API | Needs partner agreement |
| **Notifications** | Console.log | Expo Push API | `FEATURE_PUSH_NOTIFICATIONS=true` |
| **Dining** | Curated seed data (28 restaurants) | Yelp/Google Places API | `FEATURE_AIRPORT_DINING=true` |
| **Check-In** | Mock (random seat assignment) | Airline APIs / deep links | `FEATURE_AUTO_CHECKIN=true` |

The admin panel at `/admin/providers` shows the real-time status of each provider based on your current configuration.

---

## Project Structure

### Apps

| App | Tech | Description |
|-----|------|-------------|
| `apps/web` | Next.js 16, TypeScript, Tailwind, Framer Motion | Web app — all routes, API endpoints, SSR/SSG |
| `apps/mobile` | Expo 52, React Native, React Navigation 7 | Mobile app — native trip flow, boarding pass scanner, push notifications |
| `apps/worker` | Node + TypeScript, tsx | Background jobs — recommendation refresh, circle matching, expiry |

### Packages

| Package | Description |
|---------|-------------|
| `@boarding/tokens` | Design tokens — colors (#1E4AA8 brand), spacing (4px base), motion, shadows, radii |
| `@boarding/domain` | Zod schemas — Trip, Recommendation, Circle, Profile, Airport, Airline, Dining, CheckIn, BoardingPass |
| `@boarding/providers` | Provider interfaces + mocks + recommendation engine + circle matcher |
| `@boarding/db` | Seeds (10 airports, 4 airlines, 28 restaurants) + Supabase migrations |
| `@boarding/ui` | Shared web UI components (re-exports tokens) |
| `@boarding/ui-native` | React Native UI components — Text, Button, Card, Input, Badge, Divider |
| `@boarding/config` | Feature flags (14 flags) + env config + Supabase settings |

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Demo auth — create session by email |
| `POST` | `/api/auth/logout` | Destroy session |
| `GET` | `/api/auth/session` | Get current session |
| `GET/PUT` | `/api/auth/profile` | Get or update user profile |
| `POST` | `/api/trips/recommendation` | Compute departure recommendation |
| `POST` | `/api/trips/resolve-flight` | Autofill flight details |
| `POST` | `/api/trips/resolve-location` | Resolve origin location |
| `GET/POST` | `/api/store` | Read/mutate the demo file store |
| `GET` | `/api/airport/[iata]/dining` | Get restaurants for an airport |

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make changes — the shared packages in `packages/` are the foundation; prefer extending them over duplicating logic
4. Run checks: `npm run typecheck && npm run lint && npm test`
5. Ensure `npm run build` passes
6. Open a PR

### Key Conventions

- All domain types defined in `packages/domain` with Zod
- Provider pattern: interface → mock → live adapter, toggled by feature flags
- Airport/airline rules are data-driven (seeds + admin UI)
- Demo mode works without Supabase — file-backed JSON store
- Cookie-based demo auth via `/api/auth/*` routes
- `NEXT_PUBLIC_USE_SUPABASE` must be explicitly `true` before leaving demo mode
- Motion: transform + opacity only, respect `prefers-reduced-motion`
- Mobile-first, 44px minimum tap targets

---

## License

Private — all rights reserved.
