# Motion Principles

## Core Rule
Motion communicates state changes, orients between screens, and makes the app feel premium — never decorative.

## Durations
| Token | Duration | Use |
|-------|----------|-----|
| instant | 75ms | Micro-interactions (checkbox, toggle) |
| fast | 150ms | Hover states, focus rings |
| normal | 250ms | Standard transitions |
| slow | 350ms | Step transitions, panels |
| intro | 800ms | Opening "Let's move" hold |
| page | 400ms | Route-level transitions |

## Easing
| Token | Curve | Use |
|-------|-------|-----|
| default | cubic-bezier(0.4, 0, 0.2, 1) | Most animations |
| out | cubic-bezier(0, 0, 0.2, 1) | Enter animations |
| spring | cubic-bezier(0.34, 1.56, 0.64, 1) | Playful emphasis |

## Patterns

### Step Transitions
- Direction-aware: entering from right (forward) or left (back)
- Transform: translateX + opacity
- Duration: 350ms with default easing

### Intro Sequence
1. Full-viewport brand-blue screen
2. "Let's move" scales in with spring easing (500ms)
3. Hold for ~800ms total
4. Slide left + fade out (400ms)
5. Next screen enters from right
6. Click/Enter/tap skips immediately

### List Items
- Staggered fade-up: 50ms delay between items
- Duration: 250ms per item

### Reduced Motion
When `prefers-reduced-motion: reduce`:
- All durations → ~15ms (instant)
- Slide transitions → crossfade
- No spring easing
- No staggered delays

## What NOT to Animate
- width, height, top, left (causes layout thrashing)
- Colors on large surfaces
- Multiple simultaneous competing animations
- Anything that blocks interaction
