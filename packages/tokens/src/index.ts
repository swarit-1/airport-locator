// Boarding Design Tokens
// Portable across web (Tailwind) and future native (React Native) apps

// ─── Colors ───────────────────────────────────────────────────────────
export const colors = {
  // Brand
  brand: {
    50: '#EAF0FF',
    100: '#D8E2FB',
    200: '#B7C7F1',
    300: '#8EA7E1',
    400: '#5F7FC7',
    500: '#1E4AA8', // Signature brand blue
    600: '#173B87',
    700: '#12306D',
    800: '#10295C',
    900: '#0E2249',
    950: '#08162F',
  },
  // Ink (text)
  ink: {
    900: '#0F172A',
    800: '#1E293B',
    700: '#334155',
    600: '#475569',
    500: '#64748B',
    400: '#94A3B8',
    300: '#CBD5E1',
    200: '#E2E8F0',
    100: '#F1F5F9',
    50: '#F8FAFC',
  },
  // Surfaces
  surface: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    warm: '#FFFBF5',
    elevated: '#FFFFFF',
  },
  // Semantic
  success: {
    500: '#16A34A',
    100: '#DCFCE7',
    50: '#F0FDF4',
  },
  warning: {
    500: '#D97706',
    100: '#FEF3C7',
    50: '#FFFBEB',
  },
  error: {
    500: '#DC2626',
    100: '#FEE2E2',
    50: '#FEF2F2',
  },
  info: {
    500: '#2563EB',
    100: '#DBEAFE',
    50: '#EFF6FF',
  },
} as const;

// ─── Typography ───────────────────────────────────────────────────────
export const typography = {
  fontFamily: {
    sans: '"Manrope", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: '"Newsreader", Georgia, serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSize: {
    '2xs': ['0.625rem', { lineHeight: '0.875rem' }],   // 10px
    xs: ['0.75rem', { lineHeight: '1rem' }],            // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],        // 14px
    base: ['1rem', { lineHeight: '1.5rem' }],           // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],        // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],         // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],          // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],     // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],       // 36px
    '5xl': ['3rem', { lineHeight: '1' }],               // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }],            // 60px
    hero: ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em' }], // 72px
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  8: '2rem',         // 32px
  10: '2.5rem',      // 40px
  12: '3rem',        // 48px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  32: '8rem',        // 128px
} as const;

// ─── Radii ────────────────────────────────────────────────────────────
export const radii = {
  none: '0',
  sm: '0.25rem',     // 4px - chips, small elements
  md: '0.5rem',      // 8px - buttons, inputs
  lg: '0.75rem',     // 12px - cards, panels
  xl: '1rem',        // 16px - modals, large cards
  '2xl': '1.5rem',   // 24px - hero elements
  full: '9999px',    // pills, avatars
} as const;

// ─── Shadows / Elevation ──────────────────────────────────────────────
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.04)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.04)',
  // Branded shadow for key CTAs
  brand: '0 10px 24px 0 rgb(30 74 168 / 0.22)',
} as const;

// ─── Borders ──────────────────────────────────────────────────────────
export const borders = {
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px',
  },
  color: {
    default: '#E2E8F0',
    subtle: '#F1F5F9',
    strong: '#CBD5E1',
    brand: '#1E4AA8',
    focus: '#1E4AA8',
  },
} as const;

// ─── Motion ───────────────────────────────────────────────────────────
export const motion = {
  duration: {
    instant: '75ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    intro: '800ms',
    page: '400ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    gentle: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
} as const;

// ─── Icons ────────────────────────────────────────────────────────────
export const iconSize = {
  xs: '14px',
  sm: '16px',
  md: '20px',
  lg: '24px',
  xl: '32px',
} as const;

// ─── Layout ───────────────────────────────────────────────────────────
export const layout = {
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1200px',
  },
  gutter: {
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem',
  },
  tapTarget: {
    min: '44px',
  },
} as const;

// ─── Z-Index ──────────────────────────────────────────────────────────
export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
  intro: 60,
} as const;
