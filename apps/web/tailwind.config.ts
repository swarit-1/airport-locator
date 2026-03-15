import type { Config } from 'tailwindcss';
import { colors, radii, shadows, typography } from '@boarding/tokens';

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: colors.brand,
        ink: colors.ink,
        surface: {
          primary: colors.surface.primary,
          secondary: colors.surface.secondary,
          tertiary: colors.surface.tertiary,
          warm: colors.surface.warm,
          elevated: colors.surface.elevated,
        },
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
      },
      borderRadius: {
        sm: radii.sm,
        md: radii.md,
        lg: radii.lg,
        xl: radii.xl,
        '2xl': radii['2xl'],
      },
      boxShadow: {
        xs: shadows.xs,
        sm: shadows.sm,
        md: shadows.md,
        lg: shadows.lg,
        xl: shadows.xl,
        inner: shadows.inner,
        brand: shadows.brand,
      },
      fontFamily: {
        sans: [typography.fontFamily.sans],
        mono: [typography.fontFamily.mono],
      },
      fontSize: {
        '2xs': typography.fontSize['2xs'] as [string, { lineHeight: string }],
        hero: typography.fontSize.hero as [string, { lineHeight: string; letterSpacing: string }],
      },
      animation: {
        'slide-in-right': 'slideInRight 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-out-left': 'slideOutLeft 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-up': 'fadeUp 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        slideOutLeft: {
          from: { transform: 'translateX(0)', opacity: '1' },
          to: { transform: 'translateX(-100%)', opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
