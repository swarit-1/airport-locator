// Boarding Design Tokens
// Portable across web (Tailwind) and future native (React Native) apps

// ─── Colors ───────────────────────────────────────────────────────────
export const colors = {
  // Brand
  brand: {
    50: '#F0F4FA',
    100: '#D9E2F0',
    200: '#B3C5E1',
    300: '#8AA4C8',
    400: '#5A7DA8',
    500: '#1E3A6E',   // Primary — deep navy
    600: '#17305C',
    700: '#112548',
    800: '#0C1A34',
    900: '#081020',
    950: '#040810',
  },
  // Ink (text)
  ink: {
    900: '#1A1A2E',
    800: '#2A2A42',
    700: '#3D3D58',
    600: '#5A5A72',
    500: '#7A7A92',
    400: '#9A9AB0',
    300: '#BCBCCE',
    200: '#DCDCE8',
    100: '#EDEDF4',
    50: '#F7F7FA',
  },
  // Surfaces
  surface: {
    primary: '#FFFFFF',
    secondary: '#FAF8F5',   // Warm off-white
    tertiary: '#F4F6F9',    // Cool gray
    warm: '#FAF8F5',
    dark: '#1A1A2E',        // For dark hero sections
    elevated: '#FFFFFF',
  },
  // Semantic
  success: {
    500: '#3A8B6C',
    100: '#D4EDDF',
    50: '#EDF7F2',
  },
  warning: {
    500: '#D4A035',
    100: '#F5EDDA',
    50: '#FBF7EF',
  },
  error: {
    500: '#E8655A',
    100: '#FADDD9',
    50: '#FDF0EE',
  },
  info: {
    500: '#5B9BD5',
    100: '#D9EAF5',
    50: '#EDF4FA',
  },
  // Accent
  accent: {
    amber: '#D4A035',
    coral: '#E8655A',
    green: '#3A8B6C',
    sky: '#5B9BD5',
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
  brand: '0 10px 24px 0 rgb(30 58 110 / 0.22)',
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
    brand: '#1E3A6E',
    focus: '#1E3A6E',
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
