/**
 * Maps @boarding/tokens (CSS-oriented) to React Native StyleSheet values.
 */
import { colors, spacing, radii, typography, motion, layout, iconSize, zIndex } from '@boarding/tokens';

// ─── Helpers ──────────────────────────────────────────────────────────

/** Convert a CSS length string to numeric px. Handles rem, px, and plain numbers. */
function cssToNum(value: string): number {
  if (value === '0' || value === 'none') return 0;
  const remMatch = value.match(/^([\d.]+)rem$/);
  if (remMatch) return parseFloat(remMatch[1]!) * 16;
  const pxMatch = value.match(/^([\d.]+)px$/);
  if (pxMatch) return parseFloat(pxMatch[1]!);
  const msMatch = value.match(/^([\d.]+)ms$/);
  if (msMatch) return parseFloat(msMatch[1]!);
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

// ─── Colors (pass through — already hex) ──────────────────────────────

export const themeColors = colors;

// ─── Spacing (rem/px → number) ───────────────────────────────────────

export const themeSpacing = Object.fromEntries(
  Object.entries(spacing).map(([k, v]) => [k, cssToNum(v)]),
) as Record<keyof typeof spacing, number>;

// ─── Radii (rem → px, handle 'full') ─────────────────────────────────

export const themeRadii = Object.fromEntries(
  Object.entries(radii).map(([k, v]) => [k, v === '9999px' ? 9999 : cssToNum(v)]),
) as Record<keyof typeof radii, number>;

// ─── Shadows → RN shadow props ───────────────────────────────────────

export const themeShadows = {
  none: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  xs: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1 },
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  xl: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 },
  brand: { shadowColor: colors.brand[500], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
} as const;

// ─── Typography ──────────────────────────────────────────────────────
// fontSize entries are tuples: ['1rem', { lineHeight: '1.5rem' }]

export const themeFontSizes = Object.fromEntries(
  Object.entries(typography.fontSize).map(([k, v]) => {
    const sizeStr = Array.isArray(v) ? v[0] : v;
    return [k, cssToNum(sizeStr as string)];
  }),
) as Record<keyof typeof typography.fontSize, number>;

export const themeFontWeights = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const themeFontFamilies = {
  sans: 'System',
  display: 'System',
  mono: 'Courier',
};

// ─── Motion (ms strings → numbers) ───────────────────────────────────

export const themeMotion = {
  duration: Object.fromEntries(
    Object.entries(motion.duration).map(([k, v]) => [k, cssToNum(v)]),
  ) as Record<keyof typeof motion.duration, number>,
  easing: motion.easing,
};

// ─── Layout ──────────────────────────────────────────────────────────

export const themeLayout = {
  tapTarget: cssToNum(layout.tapTarget.min),
  gutter: {
    mobile: cssToNum(layout.gutter.mobile),
    tablet: cssToNum(layout.gutter.tablet),
    desktop: cssToNum(layout.gutter.desktop),
  },
  iconSize: Object.fromEntries(
    Object.entries(iconSize).map(([k, v]) => [k, cssToNum(v)]),
  ) as Record<keyof typeof iconSize, number>,
};

export const themeZIndex = zIndex;

// ─── Unified theme object ────────────────────────────────────────────

export const theme = {
  colors: themeColors,
  spacing: themeSpacing,
  radii: themeRadii,
  shadows: themeShadows,
  fontSizes: themeFontSizes,
  fontWeights: themeFontWeights,
  fontFamilies: themeFontFamilies,
  motion: themeMotion,
  layout: themeLayout,
  zIndex: themeZIndex,
} as const;

export type Theme = typeof theme;
