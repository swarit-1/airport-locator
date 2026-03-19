import React from 'react';
import { View } from 'react-native';
import { themeColors, themeSpacing } from '../theme';

interface DividerProps {
  spacing?: number;
}

export function Divider({ spacing: gap }: DividerProps) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: themeColors.ink[100],
        marginVertical: gap ?? themeSpacing[3],
      }}
    />
  );
}
