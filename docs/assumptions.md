# Assumptions

## Product Assumptions
- U.S. only at launch; all airports are U.S. airports
- English only
- No payments, no driver marketplace in v1
- ID verification deferred (data model ready)
- Ride circles are coordination only — handoff to Uber/Lyft for actual booking

## Recommendation Engine
- Traffic estimates use Haversine distance + time-of-day multiplier (mock)
- Security wait times from historical airport averages (mock)
- Airline bag drop cutoffs: AA/UA 45min domestic, DL 40min, all 60min international
- Gate close times: 15min domestic, 20min international
- TSA PreCheck reduces security time by 50%
- CLEAR reduces security time by 70%
- Kids add 30% to walk times
- Accessibility needs add 50% to walk times
- Party size >3 adds 5 minute group buffer
- International flights add 15 minute buffer

## Risk Profiles
- Conservative: 1.5x uncertainty buffers, ±22min window
- Balanced: 1.0x uncertainty buffers, ±15min window
- Aggressive: 0.7x uncertainty buffers, ±10min window

## Circle Matching
- Same airport required
- Max proximity: configurable per circle (default 10km)
- Max detour: configurable per circle (default 15min)
- Score weighting: safety 50%, savings 30%, convenience 20%
- Detour estimated from Haversine distance

## Cost Estimates
- Base fare: $8 + $1.80/km (mock heuristic)
- Shared ride premium: 20% over solo
- Per-person cost: shared total / party size

## Data
- 10 seeded airports (SEA, MCO, DEN, DFW, LAX, SFO, ATL, JFK, LGA, ORD)
- 4 seeded airlines (AA, DL, UA, WN)
- Airport profiles are editable via admin
- Walking times, security estimates, and policies are all configurable

## Technical
- App runs fully offline with mock providers
- No Supabase required for demo mode
- Worker uses interval-based polling (no Redis)
- RLS policies on all user-owned tables
- PostGIS for spatial queries
