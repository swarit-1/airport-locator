import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Button, Card, Badge, Divider, themeColors, themeSpacing, themeRadii } from '@boarding/ui-native';
import type { RootStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Types ───────────────────────────────────────────────────────────

interface Trip {
  id: string;
  flight_number: string;
  airport_iata: string;
  arrival_airport?: string;
  departure_date: string;
  departure_time?: string;
  leave_by?: string;
  status?: 'on_time' | 'delayed' | 'cancelled';
  flight_type?: 'domestic' | 'international';
}

// ─── Constants ───────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  on_time:   { bg: '#E8F5EE', text: '#3A8B6C', label: 'On Time' },
  delayed:   { bg: '#FDF3E3', text: '#D4A035', label: 'Delayed' },
  cancelled: { bg: '#FDE8E5', text: '#E8655A', label: 'Cancelled' },
};

const BG = '#FAF8F5';
const INK_PRIMARY = '#1A1A2E';
const INK_SECONDARY = '#6B6B80';
const INK_MUTED = '#9A9AB0';

// ─── Helpers ─────────────────────────────────────────────────────────

function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

function isUpcoming(trip: Trip): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseDate(trip.departure_date) >= today;
}

function formatDate(dateStr: string): string {
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Component ───────────────────────────────────────────────────────

export function TripsScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [pastExpanded, setPastExpanded] = useState(false);

  const loadTrips = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('activeTrip');
      const allTrips: Trip[] = [];

      if (raw) {
        const active = JSON.parse(raw);
        if (active && active.id) {
          allTrips.push(active);
        }
      }

      // Also check for a trips array
      const tripsRaw = await AsyncStorage.getItem('trips');
      if (tripsRaw) {
        const parsed = JSON.parse(tripsRaw);
        if (Array.isArray(parsed)) {
          for (const t of parsed) {
            if (t && t.id && !allTrips.find((a) => a.id === t.id)) {
              allTrips.push(t);
            }
          }
        }
      }

      setTrips(allTrips);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips]),
  );

  const upcoming = trips.filter(isUpcoming).sort(
    (a, b) => parseDate(a.departure_date).getTime() - parseDate(b.departure_date).getTime(),
  );
  const past = trips.filter((t) => !isUpcoming(t)).sort(
    (a, b) => parseDate(b.departure_date).getTime() - parseDate(a.departure_date).getTime(),
  );

  // ─── Empty state ─────────────────────────────────────────────────

  if (!loading && trips.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text variant="h1">Trips</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text variant="h1" style={{ fontSize: 40, lineHeight: 48 }}>✈</Text>
          </View>
          <Text variant="h3" color={INK_PRIMARY} style={{ marginBottom: 8 }}>
            No trips yet
          </Text>
          <Text
            variant="body"
            color={INK_SECONDARY}
            align="center"
            style={{ marginBottom: 28, lineHeight: 22, paddingHorizontal: 20 }}
          >
            Plan your first trip to see your personalized departure time.
          </Text>
          <Button title="Plan a Trip" onPress={() => nav.navigate('TripNew')} />
        </View>
      </View>
    );
  }

  // ─── Trip card ───────────────────────────────────────────────────

  function renderTripCard(trip: Trip, muted = false) {
    const status = STATUS_COLORS[trip.status ?? 'on_time'] ?? STATUS_COLORS.on_time;
    const route = trip.arrival_airport
      ? `${trip.airport_iata} → ${trip.arrival_airport}`
      : trip.airport_iata;

    return (
      <Pressable
        key={trip.id}
        onPress={() => nav.navigate('TripDetail', { id: trip.id })}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed && { opacity: 0.85, transform: [{ scale: 0.985 }] },
        ]}
      >
        <Card elevation="raised" style={[styles.tripCard, muted && { opacity: 0.55 }]}>
          {/* Top row: date + status badge */}
          <View style={styles.tripCardTop}>
            <Text variant="caption" color={muted ? INK_MUTED : INK_SECONDARY}>
              {formatDate(trip.departure_date)}
            </Text>
            {!muted && (
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <Text variant="caption" style={{ color: status.text, fontWeight: '600', fontSize: 11 }}>
                  {status.label}
                </Text>
              </View>
            )}
          </View>

          {/* Flight number + route */}
          <Text
            variant="body"
            weight="semibold"
            color={muted ? INK_MUTED : INK_PRIMARY}
            style={{ marginTop: 6, fontSize: 17 }}
          >
            {trip.flight_number}
          </Text>
          <Text variant="bodySmall" color={muted ? INK_MUTED : INK_SECONDARY} style={{ marginTop: 2 }}>
            {route}
          </Text>

          {/* Leave-by time */}
          {trip.leave_by && !muted && (
            <View style={styles.leaveByRow}>
              <Text variant="caption" color={INK_SECONDARY}>Leave by</Text>
              <Text variant="body" weight="semibold" color={themeColors.brand[500]} style={{ fontSize: 15 }}>
                {trip.leave_by}
              </Text>
            </View>
          )}
        </Card>
      </Pressable>
    );
  }

  // ─── Main content ────────────────────────────────────────────────

  return (
    <ScrollView
      style={[styles.container]}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: insets.bottom + 32,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h1">Trips</Text>
        <Pressable
          onPress={() => nav.navigate('TripNew')}
          style={({ pressed }) => [styles.newTripButton, pressed && { opacity: 0.7 }]}
          hitSlop={8}
        >
          <Text variant="body" weight="semibold" style={{ color: '#FFF', fontSize: 14 }}>
            + New Trip
          </Text>
        </Pressable>
      </View>

      {loading && (
        <ActivityIndicator size="small" color={themeColors.brand[500]} style={{ marginTop: 40 }} />
      )}

      {/* Upcoming */}
      {!loading && upcoming.length > 0 && (
        <View style={{ marginBottom: 28 }}>
          <Text variant="caption" color={INK_SECONDARY} style={styles.sectionLabel}>
            UPCOMING
          </Text>
          <View style={{ gap: 12 }}>
            {upcoming.map((trip) => renderTripCard(trip))}
          </View>
        </View>
      )}

      {/* Past */}
      {!loading && past.length > 0 && (
        <View>
          <Pressable
            onPress={() => setPastExpanded(!pastExpanded)}
            style={({ pressed }) => [styles.pastHeader, pressed && { opacity: 0.7 }]}
            hitSlop={8}
          >
            <Text variant="caption" color={INK_MUTED} style={styles.sectionLabel}>
              PAST
            </Text>
            <Text variant="caption" color={INK_MUTED}>
              {pastExpanded ? '▲' : '▼'}  {past.length}
            </Text>
          </Pressable>
          {pastExpanded && (
            <View style={{ gap: 10, marginTop: 8 }}>
              {past.map((trip) => renderTripCard(trip, true))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  newTripButton: {
    backgroundColor: themeColors.brand[500],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  cardPressable: {
    // ensures 44px min tap target
    minHeight: 44,
  },
  tripCard: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  tripCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  leaveByRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EDEDF4',
  },
  pastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
});
