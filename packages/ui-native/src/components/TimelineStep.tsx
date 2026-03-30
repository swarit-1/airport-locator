import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';

type StepStatus = 'completed' | 'active' | 'upcoming';

interface TimelineStepProps {
  label: string;
  detail: string;
  time?: string;
  minutes?: number;
  status: StepStatus;
  source?: string;
  isLast?: boolean;
}

const statusColors: Record<StepStatus, { dot: string; line: string; text: string }> = {
  completed: { dot: '#3A8B6C', line: '#D4EDDF', text: '#3A8B6C' },
  active: { dot: '#D4A035', line: '#F5EDDA', text: '#1A1A2E' },
  upcoming: { dot: '#BCBCCE', line: '#EDEDF4', text: '#9A9AB0' },
};

export function TimelineStep({ label, detail, time, minutes, status, source, isLast }: TimelineStepProps) {
  const colors = statusColors[status];
  return (
    <View style={styles.row}>
      {/* Left: dot + line */}
      <View style={styles.left}>
        <View style={[styles.dot, { backgroundColor: colors.dot }]}>
          {status === 'completed' && (
            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}>✓</Text>
          )}
        </View>
        {!isLast && <View style={[styles.line, { backgroundColor: colors.line }]} />}
      </View>
      {/* Right: content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={{ fontSize: 15, fontWeight: status === 'active' ? '700' : '600', color: colors.text }}>
            {label}
          </Text>
          {time && (
            <Text style={{ fontSize: 13, fontWeight: '600', color: status === 'active' ? '#D4A035' : '#9A9AB0' }}>
              {time}
            </Text>
          )}
        </View>
        <Text style={{ fontSize: 13, color: '#5A5A72', marginTop: 2 }}>{detail}</Text>
        {minutes !== undefined && (
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#1E3A6E', marginTop: 2 }}>
            {minutes} min
          </Text>
        )}
        {source && (
          <Text style={{ fontSize: 11, color: '#9A9AB0', marginTop: 2 }}>
            Source: {source}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    minHeight: 60,
  },
  left: {
    width: 32,
    alignItems: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  content: {
    flex: 1,
    paddingBottom: 16,
    paddingLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
