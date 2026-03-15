# Design System

## Philosophy

Boarding's design is premium, calm, and intentional. Think: high-end travel utility, not startup template.

## Colors

### Brand
- Primary: `#2563EB` (brand-500) — saturated blue for hero elements, CTAs, active states
- Range: brand-50 (#EBF2FF) through brand-950 (#0F172A)

### Ink (Text)
- 900: Primary text (#0F172A)
- 700: Strong secondary (#334155)
- 500: Regular secondary (#64748B)
- 400: Muted text (#94A3B8)

### Surfaces
- Primary: White — main background
- Secondary: #F8FAFC — subtle sections
- Warm: #FFFBF5 — occasional warm accent

### Semantic
- Success: #16A34A, Warning: #D97706, Error: #DC2626, Info: #2563EB

## Typography

Font: Inter (with system fallbacks)

| Scale | Size | Use |
|-------|------|-----|
| hero | 72px | Intro screen only |
| 5xl | 48px | Key numbers (leave time) |
| 3xl | 30px | Page headings |
| xl | 20px | Section headings |
| base | 16px | Body text |
| sm | 14px | Secondary text |
| xs | 12px | Captions |
| 2xs | 10px | Metadata |

## Spacing

Based on 4px grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128

## Radii

| Token | Value | Use |
|-------|-------|-----|
| sm | 4px | Small elements, chips |
| md | 8px | Buttons, inputs |
| lg | 12px | Cards, panels |
| xl | 16px | Modals, large cards |
| 2xl | 24px | Hero elements |
| full | 9999px | Pills, avatars |

## Shadows

| Token | Use |
|-------|-----|
| xs | Subtle lift |
| sm | Cards at rest |
| md | Hover states |
| lg | Elevated panels |
| xl | Modals |
| brand | Primary CTA glow |

## Component Patterns

### Buttons
- `.gs-btn-primary` — brand blue, white text, brand shadow
- `.gs-btn-secondary` — white, border, ink text
- Min height: 44px (tap target)
- Active: scale(0.98)

### Chips
- `.gs-chip` — pill-shaped selectors
- `.gs-chip-active` — brand border + bg + ring

### Inputs
- `.gs-input` — full-width, rounded-lg, 48px height
- Hover: border darkens
- Focus: brand border + ring

### Cards
- `.gs-card` — bordered, rounded-xl, p-5
- Use sparingly — prefer surface backgrounds for sections
