import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { themeColors, themeFontSizes, themeFontWeights } from '../theme';

type Variant = 'hero' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'overline';

interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: string;
  weight?: keyof typeof themeFontWeights;
  align?: 'left' | 'center' | 'right';
}

type FontWeight = '400' | '500' | '600' | '700' | '800';

const variantStyles: Record<Variant, { fontSize: number; fontWeight: FontWeight; lineHeight: number }> = {
  hero: { fontSize: themeFontSizes.hero, fontWeight: themeFontWeights.extrabold, lineHeight: themeFontSizes.hero * 1.1 },
  h1: { fontSize: themeFontSizes['3xl'], fontWeight: themeFontWeights.bold, lineHeight: themeFontSizes['3xl'] * 1.2 },
  h2: { fontSize: themeFontSizes['2xl'], fontWeight: themeFontWeights.bold, lineHeight: themeFontSizes['2xl'] * 1.3 },
  h3: { fontSize: themeFontSizes.xl, fontWeight: themeFontWeights.semibold, lineHeight: themeFontSizes.xl * 1.3 },
  body: { fontSize: themeFontSizes.base, fontWeight: themeFontWeights.normal, lineHeight: themeFontSizes.base * 1.5 },
  bodySmall: { fontSize: themeFontSizes.sm, fontWeight: themeFontWeights.normal, lineHeight: themeFontSizes.sm * 1.5 },
  caption: { fontSize: themeFontSizes.xs, fontWeight: themeFontWeights.medium, lineHeight: themeFontSizes.xs * 1.4 },
  overline: { fontSize: themeFontSizes['2xs'], fontWeight: themeFontWeights.semibold, lineHeight: themeFontSizes['2xs'] * 1.4 },
};

export function Text({ variant = 'body', color, weight, align, style, ...props }: TextProps) {
  const vs = variantStyles[variant];
  return (
    <RNText
      style={[
        {
          fontSize: vs.fontSize,
          fontWeight: (weight ? themeFontWeights[weight] : vs.fontWeight) as FontWeight,
          lineHeight: vs.lineHeight,
          color: color ?? themeColors.ink[900],
          textAlign: align,
        },
        style,
      ]}
      {...props}
    />
  );
}
