import React from 'react';
import { View } from 'react-native';
import { Text } from './Text';
import { themeColors, themeRadii, themeSpacing } from '../theme';

type BadgeVariant = 'info' | 'success' | 'warning' | 'error' | 'brand' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  info: { bg: themeColors.info[50], text: themeColors.info[500] },
  success: { bg: themeColors.success[50], text: themeColors.success[500] },
  warning: { bg: themeColors.warning[50], text: themeColors.warning[500] },
  error: { bg: themeColors.error[50], text: themeColors.error[500] },
  brand: { bg: themeColors.brand[50], text: themeColors.brand[600] },
  neutral: { bg: themeColors.ink[100], text: themeColors.ink[600] },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const v = variantStyles[variant];
  return (
    <View
      style={{
        backgroundColor: v.bg,
        borderRadius: themeRadii.full,
        paddingHorizontal: themeSpacing[2],
        paddingVertical: 2,
        alignSelf: 'flex-start',
      }}
    >
      <Text variant="overline" color={v.text} weight="semibold">
        {label.toUpperCase()}
      </Text>
    </View>
  );
}
