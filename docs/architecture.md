# Architecture

## Overview

GateShare is a monorepo with two apps and six packages, designed for a web-first MVP that can later share domain logic with a native iOS app.

## Data Flow

```
User → Trip Form → Recommendation Engine → Result Screen
                                          → Circle Matcher → Ride Circles
```

### Recommendation Pipeline

1. User enters trip details (airline, flight, airport, preferences)
2. Engine fetches traffic, flight status, and wait times from providers
3. Engine applies airport walking rules, airline policies, and risk profile
4. Engine computes: leave time, window, breakdown, confidence
5. Result stored as recommendation snapshot with version tracking

### Provider Architecture

Each external data source has a provider interface:

```typescript
interface TrafficProvider {
  getTrafficEstimate(origin, destination, departAt?): Promise<TrafficResult>
}
```

Implementations:
- **Mock**: Deterministic, works offline, used in dev
- **Real adapter**: Wraps external API, enabled via feature flag

Chain-of-responsibility for wait times:
1. Airport-specific configured source
2. MyTSA API
3. Crowdsourced in-app reports
4. Historical airport fallback model

### Circle Matching

The `CircleMatcher` filters candidates by:
1. Same airport
2. Overlapping leave windows
3. Geographic proximity (Haversine)
4. Detour tolerance
5. Safety (won't put anyone's flight at risk)

Scoring: safety 50% + savings 30% + convenience 20%

## Database

Supabase Postgres with PostGIS. Key tables:
- `airports`, `airport_profiles` — reference data
- `airlines`, `airline_policies` — reference data
- `trips` — user trips with all travel details
- `recommendations` — computed timing snapshots
- `ride_circles`, `ride_circle_members` — coordination
- `messages` — circle chat
- `profiles` — user data with trust signals
- `reports`, `audit_logs` — trust and safety

RLS policies protect user-owned data. Reference data (airports, airlines) is publicly readable.

## Worker

Simple interval-based Node process:
- Refreshes recommendations every 5 minutes
- Expires "leaving now" circles every minute
- Runs circle matching for new trips

No Redis or message queue — Postgres-centric job processing.
