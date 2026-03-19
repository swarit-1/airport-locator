import React from 'react';
import { View, ViewProps } from 'react-native';
import { themeColors, themeRadii, themeSpacing, themeShadows } from '../theme';

interface CardProps extends ViewProps {
  elevation?: 'flat' | 'raised' | 'floating';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const elevationMap = {
  flat: themeShadows.none,
  raised: themeShadows.sm,
  floating: themeShadows.lg,
};

const paddingMap = {
  none: 0,
  sm: themeSpacing[3],
  md: themeSpacing[4],
  lg: themeSpacing[6],
};

export function Card({ elevation = 'raised', padding = 'md', style, children, ...props }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: themeColors.surface.elevated,
          borderRadius: themeRadii.xl,
          padding: paddingMap[padding],
          ...elevationMap[elevation],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}
