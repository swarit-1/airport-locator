# Refactor Audit

## Routes

| Route | Status | Issues |
|-------|--------|--------|
| `/` | Working but generic | SVG wave, 4-up icon grid — needs redesign |
| `/trip/new` | Functional | Default date/time sync bug; timezone bug in engine |
| `/circles` | Demo only | Reads from hardcoded array, no persistence |
| `/circles/new` | Broken | Always routes to `circle-1`, no creation |
| `/circles/[id]` | Broken | Always loads `demoCircles[0]`, ignores param |
| `/profile` | Demo only | Hardcoded user, no persistence |
| `/admin` | Working | Links to sub-pages |
| `/admin/airports` | Demo only | Edits lost on nav, no persistence |
| `/admin/airlines` | Demo only | Same |
| `/admin/providers` | Static | Display-only, accurate |
| `/admin/reports` | Demo only | Fake reports, no persistence |
| `/airport/[iata]` | Working | Static generation works |
| `/share/[id]` | Broken | Completely hardcoded, ignores id |
| `/login` | Demo only | Fake magic link |
| `/styleguide` | Working | Needs update after design changes |

## Engine Bugs

1. **Timezone**: Appends `Z` to local departure time, interpreting it as UTC
2. **Bag check path**: Missing `bag_drop_to_security_minutes` in timing chain
3. **Latest safe bag drop**: Computed from departure minus cutoff, but doesn't chain through security
4. **Matcher safety**: Uses detoured leave time as arrival proxy — wrong

## Data Issues

- All core flows depend on component-local state or hardcoded arrays
- No repository/data-access layer
- Supabase client files exist but are unused
- Demo data recalculates "tomorrow" on every import

## Visual Problems

- Landing page: generic SaaS wave, 4-up icon grid
- Recommendation: collapsed breakdown feels like a generic table
- Circles: every item is a big bordered card
- Same `rounded-xl border p-5` pattern everywhere
- No visual hierarchy beyond font weight
- Chat is fake demo messages, no persistence

## What to Preserve

- Brand direction (blue, "Let's move")
- Monorepo structure and packages
- Token system (well-designed)
- Recommendation engine structure (needs bug fixes)
- Circle matcher structure (needs safety fix)
- Multi-step trip flow concept
- Responsive layout approach

## Plan

1. Create repository layer with demo + supabase adapters
2. Fix recommendation engine (timezone, bag path, safety)
3. Fix circle creation/detail/chat with persistence
4. Fix share page with real lookup
5. Fix admin persistence
6. Wire ride links through provider
7. Redesign landing page
8. Redesign recommendation result
9. Improve circles list density
10. Polish chat, forms, transitions
11. Update tests
12. Verify build
