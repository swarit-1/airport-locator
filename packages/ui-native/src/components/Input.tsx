import React, { useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { Text } from './Text';
import { themeColors, themeRadii, themeSpacing, themeLayout } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, style, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? themeColors.error[500]
    : focused
      ? themeColors.brand[500]
      : themeColors.ink[200];

  return (
    <View style={{ gap: 6 }}>
      {label && (
        <Text variant="caption" color={themeColors.ink[600]} weight="semibold">
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={themeColors.ink[300]}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          {
            height: themeLayout.tapTarget,
            borderWidth: 1.5,
            borderColor,
            borderRadius: themeRadii.lg,
            paddingHorizontal: themeSpacing[3],
            fontSize: 16,
            color: themeColors.ink[900],
            backgroundColor: themeColors.surface.primary,
          },
          style,
        ]}
        {...props}
      />
      {error && (
        <Text variant="caption" color={themeColors.error[500]}>
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text variant="caption" color={themeColors.ink[400]}>
          {hint}
        </Text>
      )}
    </View>
  );
}
