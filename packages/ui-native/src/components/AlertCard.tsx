import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { themeColors, themeSpacing, themeRadii } from '../theme';

type AlertType = 'gate_change' | 'delay' | 'leave_reminder' | 'security_update' | 'cancelled';

const alertStyles: Record<AlertType, { bg: string; border: string; text: string }> = {
  gate_change: { bg: '#FBF7EF', border: '#D4A035', text: '#8B6914' },
  delay: { bg: '#FDF0EE', border: '#E8655A', text: '#B8362A' },
  leave_reminder: { bg: '#F0F4FA', border: '#1E3A6E', text: '#1E3A6E' },
  security_update: { bg: '#EDF4FA', border: '#5B9BD5', text: '#2D6BA0' },
  cancelled: { bg: '#FDF0EE', border: '#E8655A', text: '#B8362A' },
};

interface AlertCardProps {
  type: AlertType;
  title: string;
  message: string;
  timestamp?: string;
}

export function AlertCard({ type, title, message, timestamp }: AlertCardProps) {
  const style = alertStyles[type];
  return (
    <View style={[styles.container, { backgroundColor: style.bg, borderLeftColor: style.border }]}>
      <Text variant="bodySmall" weight="bold" color={style.text}>{title}</Text>
      <Text variant="caption" color={style.text} style={{ marginTop: 2 }}>{message}</Text>
      {timestamp && (
        <Text variant="caption" color={style.text} style={{ marginTop: 4, opacity: 0.6 }}>{timestamp}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
});
