import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Button, Card, Badge, Divider, themeColors, themeSpacing, themeRadii } from '@boarding/ui-native';
import type { RootStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Types ───────────────────────────────────────────────────────────

interface Circle {
  id: string;
  name: string;
  riders: number;
  max_riders: number;
  departure_window: string;
  airport: string;
  savings_estimate: string;
}

// ─── Mock data ───────────────────────────────────────────────────────

const AVAILABLE_CIRCLES: Circle[] = [
  {
    id: 'circle-1',
    name: 'Downtown Seattle → SEA',
    riders: 3,
    max_riders: 4,
    departure_window: '5:00 AM - 6:30 AM',
    airport: 'SEA',
    savings_estimate: '$18-24 per person',
  },
  {
    id: 'circle-2',
    name: 'Buckhead → ATL',
    riders: 2,
    max_riders: 4,
    departure_window: '7:00 AM - 8:00 AM',
    airport: 'ATL',
    savings_estimate: '$15-20 per person',
  },
  {
    id: 'circle-3',
    name: 'Loop → ORD',
    riders: 1,
    max_riders: 4,
    departure_window: '6:00 AM - 7:30 AM',
    airport: 'ORD',
    savings_estimate: '$22-28 per person',
  },
];

type Filter = 'all' | 'my_airport' | 'leaving_soon';

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'my_airport', label: 'My Airport' },
  { value: 'leaving_soon', label: 'Leaving Soon' },
];

// ─── Constants ───────────────────────────────────────────────────────

const BG = '#FAF8F5';
const INK_PRIMARY = '#1A1A2E';
const INK_SECONDARY = '#6B6B80';
const INK_MUTED = '#9A9AB0';
const GREEN = '#3A8B6C';
const BRAND = themeColors.brand[500];

// ─── Component ───────────────────────────────────────────────────────

export function CirclesScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  const joinedCircles = AVAILABLE_CIRCLES.filter((c) => joinedIds.has(c.id));
  const available = AVAILABLE_CIRCLES.filter((c) => !joinedIds.has(c.id));

  function handleJoin(id: string) {
    setJoinedIds((prev) => new Set([...prev, id]));
  }

  // ─── Rider dots ──────────────────────────────────────────────────

  function RiderDots({ count, max }: { count: number; max: number }) {
    return (
      <View style={styles.dotsRow}>
        {Array.from({ length: max }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i < count ? BRAND : '#E0E0E8' },
            ]}
          />
        ))}
        <Text variant="caption" color={INK_SECONDARY} style={{ marginLeft: 6 }}>
          {count}/{max}
        </Text>
      </View>
    );
  }

  // ─── Circle card ─────────────────────────────────────────────────

  function renderCircleCard(circle: Circle, joined: boolean) {
    return (
      <Pressable
        key={circle.id}
        onPress={() => nav.navigate('CircleDetail', { id: circle.id })}
        style={({ pressed }) => [pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] }]}
      >
        <Card elevation="raised" style={styles.circleCard}>
          {/* Airport badge + rider dots */}
          <View style={styles.cardTopRow}>
            <View style={styles.airportBadge}>
              <Text variant="caption" style={{ color: BRAND, fontWeight: '700', fontSize: 11 }}>
                {circle.airport}
              </Text>
            </View>
            <RiderDots count={circle.riders} max={circle.max_riders} />
          </View>

          {/* Circle name */}
          <Text variant="body" weight="semibold" color={INK_PRIMARY} style={{ marginTop: 10, fontSize: 16 }}>
            {circle.name}
          </Text>

          {/* Details row */}
          <View style={styles.detailsRow}>
            <View style={{ flex: 1 }}>
              <Text variant="caption" color={INK_MUTED} style={{ marginBottom: 2 }}>
                Departure window
              </Text>
              <Text variant="bodySmall" color={INK_SECONDARY}>
                {circle.departure_window}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="caption" color={INK_MUTED} style={{ marginBottom: 2 }}>
                Est. savings
              </Text>
              <Text variant="bodySmall" weight="semibold" style={{ color: GREEN }}>
                {circle.savings_estimate}
              </Text>
            </View>
          </View>

          {/* Action */}
          {!joined && (
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                handleJoin(circle.id);
              }}
              style={({ pressed }) => [styles.joinButton, pressed && { opacity: 0.8 }]}
            >
              <Text variant="body" weight="semibold" style={{ color: '#FFF', fontSize: 14 }}>
                Join Circle
              </Text>
            </Pressable>
          )}

          {joined && (
            <View style={styles.joinedIndicator}>
              <Text variant="bodySmall" weight="semibold" style={{ color: GREEN }}>
                Joined
              </Text>
            </View>
          )}
        </Card>
      </Pressable>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: insets.bottom + 32,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Text variant="h1" style={{ marginBottom: 20 }}>Ride Circles</Text>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 24, marginHorizontal: -20 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {FILTERS.map((f) => {
          const active = f.value === activeFilter;
          return (
            <Pressable
              key={f.value}
              onPress={() => setActiveFilter(f.value)}
              style={[
                styles.filterChip,
                active ? styles.filterChipActive : styles.filterChipInactive,
              ]}
            >
              <Text
                variant="caption"
                style={{
                  color: active ? '#FFF' : INK_SECONDARY,
                  fontWeight: active ? '700' : '500',
                  fontSize: 13,
                }}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Your Circles */}
      {joinedCircles.length > 0 && (
        <View style={{ marginBottom: 28 }}>
          <Text variant="caption" color={INK_MUTED} style={styles.sectionLabel}>
            YOUR CIRCLES
          </Text>
          <View style={{ gap: 12 }}>
            {joinedCircles.map((c) => renderCircleCard(c, true))}
          </View>
        </View>
      )}

      {joinedCircles.length === 0 && (
        <View style={styles.emptyJoined}>
          <Text variant="bodySmall" color={INK_MUTED} align="center">
            You haven't joined any circles yet.
          </Text>
        </View>
      )}

      {/* Available */}
      {available.length > 0 && (
        <View style={{ marginBottom: 28 }}>
          <Text variant="caption" color={INK_MUTED} style={styles.sectionLabel}>
            AVAILABLE
          </Text>
          <View style={{ gap: 12 }}>
            {available.map((c) => renderCircleCard(c, false))}
          </View>
        </View>
      )}

      {/* Create CTA */}
      <View style={styles.ctaContainer}>
        <Button title="Create a Circle" onPress={() => {}} />
      </View>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: BRAND,
  },
  filterChipInactive: {
    backgroundColor: '#F0EDE8',
  },
  circleCard: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    minHeight: 44,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  airportBadge: {
    backgroundColor: '#EBF0FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EDEDF4',
  },
  joinButton: {
    backgroundColor: BRAND,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  joinedIndicator: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: '#E8F5EE',
  },
  emptyJoined: {
    paddingVertical: 20,
    marginBottom: 24,
  },
  ctaContainer: {
    marginTop: 4,
    marginBottom: 8,
  },
});
