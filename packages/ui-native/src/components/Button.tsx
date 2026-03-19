import React from 'react';
import { Pressable, PressableProps, ActivityIndicator } from 'react-native';
import { Text } from './Text';
import { themeColors, themeRadii, themeSpacing, themeShadows, themeLayout } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const sizeStyles: Record<Size, { height: number; paddingHorizontal: number; fontSize: number }> = {
  sm: { height: 36, paddingHorizontal: themeSpacing[3], fontSize: 14 },
  md: { height: themeLayout.tapTarget, paddingHorizontal: themeSpacing[4], fontSize: 16 },
  lg: { height: 52, paddingHorizontal: themeSpacing[6], fontSize: 18 },
};

const variantColors: Record<Variant, { bg: string; text: string; pressedBg: string; border?: string }> = {
  primary: { bg: themeColors.brand[600], text: '#FFFFFF', pressedBg: themeColors.brand[700] },
  secondary: { bg: 'transparent', text: themeColors.brand[600], pressedBg: themeColors.brand[50], border: themeColors.brand[300] },
  ghost: { bg: 'transparent', text: themeColors.ink[700], pressedBg: themeColors.ink[100] },
  danger: { bg: themeColors.error[500], text: '#FFFFFF', pressedBg: '#B91C1C' },
};

export function Button({ title, variant = 'primary', size = 'md', loading, icon, disabled, style, ...props }: ButtonProps) {
  const s = sizeStyles[size];
  const c = variantColors[variant];

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: themeRadii.lg,
          backgroundColor: pressed ? c.pressedBg : c.bg,
          borderWidth: c.border ? 1.5 : 0,
          borderColor: c.border,
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          gap: 8,
          opacity: disabled ? 0.5 : 1,
          ...(variant === 'primary' ? themeShadows.brand : themeShadows.none),
        },
        style as any,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={c.text} size="small" />
      ) : (
        <>
          {icon}
          <Text variant="body" color={c.text} weight="semibold" style={{ fontSize: s.fontSize }}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
