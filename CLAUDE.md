# Boarding — Project Context

## Stack
- **Monorepo**: npm workspaces
- **Web**: Next.js 14 App Router, TypeScript strict, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth, Postgres + PostGIS, Realtime, Storage)
- **Worker**: Node + TypeScript, interval-based Postgres jobs
- **Validation**: Zod schemas in `packages/domain`
- **Providers**: Interface + mock pattern in `packages/providers`

## Commands
```bash
npm install           # Install all deps
npm run dev           # Run web app in dev mode
npm run dev:worker    # Run worker in dev mode
npm run build         # Build all packages and apps
npm run typecheck     # Type-check all packages
npm run lint          # Lint all packages
npm test              # Run all tests
```

## Architecture Map
```
apps/web          → Next.js frontend (all routes)
apps/worker       → Background jobs (refresh, matching, expiry)
packages/tokens   → Design tokens (colors, spacing, motion, etc.)
packages/domain   → Shared Zod schemas and TypeScript types
packages/providers→ Provider interfaces, mocks, recommendation engine
packages/db       → Migrations, seeds, Supabase helpers
packages/ui       → Shared UI components (re-exports tokens)
packages/config   → Env config and feature flags
```

## Design Principles
- Editorial premium, calm, intentional — not a generic template
- Signature brand navy (#1E3A6E), deep ink, warm surfaces
- Typography and spacing create hierarchy before cards/borders
- Mobile-first, thumb-friendly, 44px min tap targets
- Cards only where they group distinct concepts
- Landing and trip flow favor dense rows/modules over repeated generic cards

## Motion Rules
- Prefer transform + opacity (no layout-janking width/height)
- Short durations for interactions (150-250ms)
- Richer transitions for intro and route changes (350-400ms)
- Intro: 800ms hold → slide left with enter from right
- Respect prefers-reduced-motion (fast crossfade fallback)

## Provider Strategy
Providers auto-enable when API keys are present. No feature flag gating required:
- Traffic: MockTrafficProvider → GoogleRoutesTrafficProvider (needs GOOGLE_MAPS_API_KEY)
- Flight: AviationStackFlightProvider → MockFlightProvider fallback (needs AVIATIONSTACK_API_KEY)
- Geocoding: GoogleGeocodingProvider (needs GOOGLE_MAPS_API_KEY)
- Wait times: HistoricalWaitTimeProvider (per-airport/terminal data, no API key needed)
- Ride links: Deep links work without API keys
- Cost estimates: Distance heuristic (real pricing needs partner API)
- Flight lookup, origin resolution, and recommendation compute run through app route handlers so the client does not import provider logic directly

## Key Conventions
- All domain types defined in packages/domain with Zod
- Airport/airline rules are data-driven (seeds + admin UI)
- Recommendation engine in packages/providers/src/engine/
- RLS policies on user-owned data
- Demo mode works without Supabase. Data persists in a file-backed JSON store (`.demo-data/store.json`) and is server-readable for SSR
- Client mutations sync to the file store via `/api/store` so `/share/[id]` and `/circles/[id]` work in any browser
- Cookie-based demo auth via `/api/auth/*` routes — no real authentication provider needed
- `NEXT_PUBLIC_USE_SUPABASE` must be explicitly set to `true` before the repo layer leaves demo mode

## Current Status
- [x] Monorepo scaffold
- [x] Design tokens
- [x] Domain types and schemas
- [x] Provider interfaces and mocks
- [x] Recommendation engine
- [x] Circle matcher
- [x] Database schema and seeds
- [x] Full web app with all routes
- [x] "Let's move" intro screen
- [x] Trip creation flow
- [x] Recommendation result + breakdown
- [x] Ride circles list, detail, chat
- [x] Admin interface
- [x] Styleguide route
- [x] Tests
- [x] Flight autofill route with live/mock fallback
- [x] Origin resolution route with typed-address and device-location paths
- [x] Editorial redesign of landing, intro, airline picker, and trip shell
- [x] Server-readable demo persistence (file-backed JSON store)
- [x] Cookie-based demo auth with profile persistence
- [x] Server-side recommendation persistence (share pages work immediately)
- [x] Provider status page reads real runtime state
- [x] Airport SEO pages use @boarding/db seeds directly
- [ ] Production Supabase integration
- [ ] Proven production provider credentials and end-to-end live API QA

## Gotchas
- App runs fully in demo mode without Supabase
- Core demo persistence is file-backed (`.demo-data/store.json`), NOT localStorage-only
- Client components read from localStorage for speed but sync mutations to the file store via `/api/store`
- Server components (`/share/[id]`, `/circles/[id]`, `/admin/providers`) read from the file store directly
- Airport SEO pages use generateStaticParams with seeds from @boarding/db
- Motion animations check prefersReducedMotion
- All forms use native HTML inputs (not react-hook-form yet for simplicity)
- `NEXT_PUBLIC_SUPABASE_URL` being present no longer flips repo mode on by itself
