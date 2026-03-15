# Boarding — Current Gap Audit

Generated: 2026-03-15

## Route Inventory

| Route | Status | Durable | Notes |
|---|---|---|---|
| `/` | Working | N/A (static) | Landing page. Editorial design. No data dependencies. |
| `/trip/new` | Partially wired | Client-side only | Uses repo for rules. Computes recommendation client-side. Saves to localStorage-backed repo. NOT server-readable. |
| `/share/[id]` | Wired to repo | Client-side only | Loads from `getShareRepo()`. Uses `useHydrated()`. localStorage-only — not server-readable on first load. |
| `/circles` | Wired to repo | Client-side only | Loads from `getCircleRepo().getAll()`. localStorage-backed. |
| `/circles/new` | Wired to repo | Client-side only | Creates via `circleRepo.create()`. Routes to new ID. localStorage-only. |
| `/circles/[id]` | Wired to repo | Client-side only | Loads by `params.id`. Join/leave/chat persist through repo. localStorage-only. |
| `/login` | Simulated | None | `setTimeout(800)` + local state flip. No session created. No cookie. |
| `/profile` | Hardcoded | None | All state is `useState` with hardcoded demo values. No save. No session. |
| `/admin` | Wired to repo | Client-side only | Counts from repo. `useHydrated()`. |
| `/admin/airports` | Wired to repo | Client-side only | Edits persist through `updateAirportProfile()`. localStorage-backed. Save button works. |
| `/admin/airlines` | Wired to repo | Client-side only | Edits persist through `updateAirlinePolicy()`. Save button works. |
| `/admin/reports` | Wired to repo | Client-side only | Status changes persist via `updateStatus()`. |
| `/admin/providers` | Static display | N/A | Hardcoded provider list. Does not reflect actual runtime state. |
| `/airport/[iata]` | Static SEO pages | N/A | Uses `generateStaticParams`. Still imports from `demo-data.ts`. |
| `/styleguide` | Static display | N/A | Design system QA. |

## Critical Problem: localStorage-Only Persistence

The demo adapter stores all data in `window.localStorage` via the `Store` singleton. This means:
- **Dynamic routes like `/share/[id]` and `/circles/[id]` cannot render on the server.** They must wait for client hydration, showing a blank page on first load.
- **No SSR.** Every data-dependent page needs `useHydrated()` guard.
- **No share via URL.** If someone opens a `/share/[id]` link in a new browser, localStorage is empty.
- **No curl/bot/OG preview.** Server-side rendering sees no data.

**Fix required:** File-backed JSON store or cookie-synced approach for demo mode that the server can read.

## Remaining `demo-data.ts` Imports

| File | Import |
|---|---|
| `apps/web/src/app/airport/[iata]/page.tsx` | `airports, airportProfiles` |

The `demoCircles` export in `demo-data.ts` is no longer imported anywhere and can be removed.

## Hardcoded IDs / Static Arrays / Fake State

| Location | Issue |
|---|---|
| `/login/page.tsx` | `setTimeout(800)` simulates auth. No session created. |
| `/profile/page.tsx` | All profile data is hardcoded `useState`. Save button is no-op. |
| `/admin/providers/page.tsx` | Hardcoded provider status array. Does not read from actual provider registry. |
| `/airport/[iata]/page.tsx` | Imports `airports` from `demo-data.ts` instead of repository. |
| `RecommendationResult.tsx` | Trip page calls `recommendationEngine.compute()` client-side instead of through API route. |

## Known Logic Bugs

### Recommendation Engine
1. **Timezone:** Fixed. `parseLocalTime()` correctly interprets departure in airport-local time. Tests pass.
2. **Bag-check path:** Fixed. Both `curb_to_bag_drop_minutes` and `bag_drop_to_security_minutes` included. Tests pass.
3. **Safety milestones:** Fixed. `latestSafeGate = departure - gate_close_minutes`. Security entry chains backwards. Tests pass.
4. **Ride links:** Fixed in result component — uses provider via `rideLinks` prop. Circle detail page also fetches from provider.

### Circle Matcher
5. **Safety validation:** Still uses simplistic `detour < maxDetourMinutes` check. Does not validate whether a proposed circle preserves safe airport arrival timing for each rider.

### Session / Auth
6. **No session persistence.** Login page simulates auth but creates no cookie/session. All pages that should be auth-gated are not.
7. **No ProfileRepository.** Profile page has no data persistence path.
8. **No SessionRepository.** No concept of logged-in user across navigation.

## Docs / Tooling Mismatches

| Item | Status |
|---|---|
| `package.json` `packageManager` | Says `npm@11.6.2`. Staying on npm (pnpm unavailable in environment). |
| Lock file | `package-lock.json` exists. Correct for npm. |
| CLAUDE.md commands section | References `npm` commands. Correct. |
| README.md | Exists. Up to date. |
| `docs/refactor-audit.md` | Stale — from previous refactor pass. |
| Worker package | `apps/worker` referenced in scripts but not explored. |

## API Routes

| Route | Status |
|---|---|
| `POST /api/trips/recommendation` | Working. Server-side recommendation compute. Not currently used by trip page (trip page computes client-side). |
| `POST /api/trips/resolve-flight` | Working. Flight autofill via mock/live provider. |
| `POST /api/trips/resolve-location` | Working. Origin resolution via typed address or device location. |

## Summary of What Needs to Happen

1. **Make demo persistence server-readable** — file-backed JSON store, not localStorage-only.
2. **Build real auth/session** — cookie-based demo session, ProfileRepository.
3. **Route trip computation through API route** — server-side compute, persist recommendation server-side.
4. **Fix share page** — must work without client localStorage on first load.
5. **Fix matcher safety** — validate each rider's safe arrival.
6. **Wire `/airport/[iata]`** — use repository instead of demo-data.ts.
7. **Make login create a session** — cookie-based, server-readable.
8. **Make profile persist** — through ProfileRepository.
9. **Make provider status reflect reality** — read from provider registry, not hardcoded array.
10. **Package manager** — staying on npm (pnpm unavailable in environment). Already consistent.
11. **Upgrade worker** — expire circles, recompute recs.
12. **UI polish** — landing, recommendation result, circles, chat, admin.
