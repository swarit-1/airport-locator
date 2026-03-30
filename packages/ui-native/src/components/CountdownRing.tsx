import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Text } from './Text';

interface CountdownRingProps {
  /** Target time as ISO string */
  targetTime: string;
  /** Total duration in minutes (for full ring calculation) */
  totalMinutes: number;
  /** Label below the time (e.g., "leave by") */
  label: string;
  /** Ring size in px */
  size?: number;
  /** Ring color */
  color?: string;
  /** Track color */
  trackColor?: string;
}

export function CountdownRing({
  targetTime,
  totalMinutes,
  label,
  size = 200,
  color = '#D4A035',
  trackColor = '#EDEDF4',
}: CountdownRingProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const target = new Date(targetTime).getTime();
  const totalMs = totalMinutes * 60 * 1000;
  const remaining = Math.max(0, target - now);
  const progress = Math.max(0, Math.min(1, remaining / totalMs));

  const hours = Math.floor(remaining / 3600000);
  const mins = Math.floor((remaining % 3600000) / 60000);

  const timeStr = new Date(targetTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const countdownStr = remaining <= 0
    ? 'Now'
    : hours > 0
      ? `${hours}h ${mins}m`
      : `${mins}m`;

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={{ fontSize: 36, fontWeight: '700', color: '#1A1A2E', letterSpacing: -1 }}>
          {timeStr}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: '500', color: '#9A9AB0', marginTop: 2 }}>
          {label}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: '600', color: color, marginTop: 6 }}>
          {countdownStr}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
