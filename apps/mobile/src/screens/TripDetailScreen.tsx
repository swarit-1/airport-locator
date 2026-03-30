import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, ScrollView, Share, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import {
  Text,
  Button,
  Card,
  Badge,
  Divider,
  AlertCard,
  CountdownRing,
  TimelineStep,
  themeColors,
  themeSpacing,
  themeRadii,
} from '@boarding/ui-native';
import type { RootStackParamList } from '../navigation';
import { useFlightStatusPolling } from '../hooks/useFlightStatusPolling';
import * as api from '../services/api';

// ─── Types ──────────────────────────────────────────────────────────

interface ActiveTrip {
  id: string;
  trip_id: string;
  airline_iata: string;
  airline_name: string;
  flight_number: string;
  departure_date: string;
  departure_time: string;
  airport_iata: string;
  arrival_airport: string | null;
  flight_type: 'domestic' | 'international';
  terminal: string | null;
  gate: string | null;
  origin_label: string;
  leave_by_time: string;
  arrive_airport_time: string;
  at_gate_time: string;
  boarding_time: string;
  total_minutes: number;
  phase: string;
  status: 'on_time' | 'delayed' | 'cancelled' | 'gate_changed';
  delay_minutes: number;
  status_message: string | null;
  breakdown: Array<{
    label: string;
    minutes: number;
    description: string;
    source?: string;
  }>;
  confidence: string;
}

interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  terminal: string;
  near_gates: string;
  avg_wait_minutes: number;
  walk_minutes: number;
}

// ─── Helpers ────────────────────────────────────────────────────────

function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function statusDotColor(
  status: ActiveTrip['status'],
): string {
  switch (status) {
    case 'on_time':
      return themeColors.accent.green;
    case 'delayed':
    case 'gate_changed':
      return themeColors.accent.amber;
    case 'cancelled':
      return themeColors.accent.coral;
    default:
      return themeColors.ink[400];
  }
}

function minutesUntil(iso: string): number {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000));
}

function isPast(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

// ─── Timeline builder ───────────────────────────────────────────────

interface TimelineEntry {
  label: string;
  time: string;
  detail: string;
}

function buildTimeline(trip: ActiveTrip): TimelineEntry[] {
  const steps: TimelineEntry[] = [];

  // 1. Leave home
  steps.push({
    label: 'Leave home',
    time: trip.leave_by_time,
    detail: fmt(trip.leave_by_time),
  });

  // 2. Drive to airport
  const trafficStep = trip.breakdown.find(
    (b) => b.label.toLowerCase().includes('traffic') || b.label.toLowerCase().includes('drive'),
  );
  if (trafficStep) {
    steps.push({
      label: 'Drive to airport',
      time: trip.leave_by_time,
      detail: `${trafficStep.minutes} min`,
    });
  }

  // 3. Arrive at terminal
  steps.push({
    label: 'Arrive at terminal',
    time: trip.arrive_airport_time,
    detail: fmt(trip.arrive_airport_time),
  });

  // 4. Bag drop (conditional)
  const bagStep = trip.breakdown.find(
    (b) => b.label.toLowerCase().includes('bag'),
  );
  if (bagStep) {
    steps.push({
      label: 'Bag drop',
      time: trip.arrive_airport_time,
      detail: `${bagStep.minutes} min`,
    });
  }

  // 5. Security
  const secStep = trip.breakdown.find(
    (b) => b.label.toLowerCase().includes('security'),
  );
  if (secStep) {
    steps.push({
      label: 'Security',
      time: trip.arrive_airport_time,
      detail: `${secStep.minutes} min`,
    });
  }

  // 6. Walk to gate
  const walkStep = trip.breakdown.find(
    (b) => b.label.toLowerCase().includes('gate') && b.label.toLowerCase().includes('walk'),
  );
  steps.push({
    label: 'Walk to gate',
    time: trip.at_gate_time,
    detail: walkStep
      ? `${walkStep.minutes} min${trip.gate ? ` · Gate ${trip.gate}` : ''}`
      : trip.gate
        ? `Gate ${trip.gate}`
        : 'Estimate',
  });

  // 7. At gate (buffer)
  steps.push({
    label: 'At gate',
    time: trip.at_gate_time,
    detail: fmt(trip.at_gate_time),
  });

  // 8. Boarding begins
  steps.push({
    label: 'Boarding begins',
    time: trip.boarding_time,
    detail: fmt(trip.boarding_time),
  });

  // 9. Departure
  const depIso = `${trip.departure_date}T${trip.departure_time}`;
  steps.push({
    label: 'Departure',
    time: depIso,
    detail: fmt(depIso),
  });

  return steps;
}

function stepStatus(
  entry: TimelineEntry,
  index: number,
  entries: TimelineEntry[],
): 'completed' | 'active' | 'upcoming' {
  const now = Date.now();
  const thisTime = new Date(entry.time).getTime();
  const nextEntry = entries[index + 1];
  const nextTime = nextEntry ? new Date(nextEntry.time).getTime() : Infinity;

  if (now >= nextTime) return 'completed';
  if (now >= thisTime && now < nextTime) return 'active';
  return 'upcoming';
}

// ─── Screen ─────────────────────────────────────────────────────────

export function TripDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TripDetail'>>();
  const navigation = useNavigation();
  const { id } = route.params;

  const [trip, setTrip] = useState<ActiveTrip | null>(null);
  const [dining, setDining] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  // Poll flight status and refresh trip data on changes
  useFlightStatusPolling(useCallback((update) => {
    AsyncStorage.getItem('activeTrip').then((raw) => {
      if (raw) {
        const parsed: ActiveTrip = JSON.parse(raw);
        if (parsed.id === id || parsed.trip_id === id) {
          setTrip(parsed);
        }
      }
    }).catch(() => {});
    Alert.alert('Flight Update', update.message);
  }, [id]));

  // Load trip from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('activeTrip');
        if (raw) {
          const parsed: ActiveTrip = JSON.parse(raw);
          // Accept if matches id or if no specific id filter needed
          if (parsed.id === id || parsed.trip_id === id) {
            setTrip(parsed);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Fetch dining when departure < 2 hours away
  useEffect(() => {
    if (!trip) return;
    const depIso = `${trip.departure_date}T${trip.departure_time}`;
    const hoursUntilDep = (new Date(depIso).getTime() - Date.now()) / 3600000;
    if (hoursUntilDep > 0 && hoursUntilDep < 2) {
      api
        .getAirportDining(trip.airport_iata)
        .then((res) => setDining(res.restaurants?.slice(0, 3) ?? []))
        .catch(() => {});
    }
  }, [trip]);

  // Countdown target: leave-by if in the future, otherwise departure
  const countdownTarget = useMemo(() => {
    if (!trip) return null;
    if (!isPast(trip.leave_by_time)) return trip.leave_by_time;
    return `${trip.departure_date}T${trip.departure_time}`;
  }, [trip]);

  const countdownMinutes = countdownTarget ? minutesUntil(countdownTarget) : 0;
  const countdownLabel = trip && !isPast(trip.leave_by_time) ? 'Leave in' : 'Departs in';

  // Timeline
  const timeline = useMemo(() => (trip ? buildTimeline(trip) : []), [trip]);

  // Key times
  const keyTimes = useMemo(() => {
    if (!trip) return [];
    return [
      { label: 'Leave', time: trip.leave_by_time },
      { label: 'Airport', time: trip.arrive_airport_time },
      { label: 'Gate', time: trip.at_gate_time },
      { label: 'Board', time: trip.boarding_time },
    ];
  }, [trip]);

  // Determine which key time is "active"
  const activeKeyIndex = useMemo(() => {
    const now = Date.now();
    for (let i = keyTimes.length - 1; i >= 0; i--) {
      if (now >= new Date(keyTimes[i].time).getTime()) return i;
    }
    return 0;
  }, [keyTimes]);

  // ─── Handlers ───────────────────────────────────────────────────

  async function handleShare() {
    if (!trip) return;
    try {
      await Share.share({
        message: `My Boarding timeline: Leave by ${fmt(trip.leave_by_time)} for ${trip.flight_number} ${trip.airport_iata}${trip.arrival_airport ? ' \u2192 ' + trip.arrival_airport : ''}`,
      });
    } catch {
      // cancelled
    }
  }

  async function handleDelete() {
    Alert.alert('Delete Trip', 'Are you sure you want to delete this trip?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('activeTrip');
          } catch {
            // ignore
          }
          navigation.goBack();
        },
      },
    ]);
  }

  // ─── Loading / empty states ─────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.center}>
        <Text variant="bodySmall" color={themeColors.ink[400]}>
          Loading trip...
        </Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text variant="h3" color={themeColors.ink[400]}>
          Trip not found
        </Text>
        <Button
          title="Go Back"
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={{ marginTop: themeSpacing[4] }}
        />
      </View>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────

  const routeLabel = `${trip.airport_iata}${trip.arrival_airport ? ' \u2192 ' + trip.arrival_airport : ''}`;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerTitleRow}>
            <Text variant="h2" color={themeColors.ink[900]}>
              {trip.flight_number}
            </Text>
            <Text variant="h3" color={themeColors.ink[500]} style={{ marginLeft: themeSpacing[2] }}>
              {routeLabel}
            </Text>
          </View>
          <Text variant="bodySmall" color={themeColors.ink[500]}>
            {fmtDate(trip.departure_date)} at {trip.departure_time}
          </Text>
        </View>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: statusDotColor(trip.status) },
          ]}
        />
      </View>

      {/* ── Alert Card (conditional) ───────────────────────────── */}
      {trip.status !== 'on_time' && (
        <AlertCard
          type={trip.status === 'delayed' ? 'delay' : trip.status === 'cancelled' ? 'cancelled' : 'gate_change'}
          title={
            trip.status === 'delayed'
              ? `Delayed ${trip.delay_minutes} min`
              : trip.status === 'cancelled'
                ? 'Flight Cancelled'
                : 'Gate Changed'
          }
          message={trip.status_message ?? ''}
        />
      )}

      {/* ── Countdown ──────────────────────────────────────────── */}
      <Card elevation="floating" style={styles.countdownCard}>
        <CountdownRing
          targetTime={trip.leave_by_time}
          totalMinutes={trip.total_minutes}
          label={countdownLabel}
          size={160}
        />
      </Card>

      {/* ── Key Times Row ──────────────────────────────────────── */}
      <Card elevation="raised" style={styles.keyTimesCard}>
        <View style={styles.keyTimesRow}>
          {keyTimes.map((kt, i) => {
            const isActive = i === activeKeyIndex;
            return (
              <View key={kt.label} style={styles.keyTimeCol}>
                <Text
                  variant="caption"
                  color={isActive ? themeColors.accent.amber : themeColors.ink[400]}
                  weight={isActive ? 'bold' : 'medium'}
                >
                  {kt.label}
                </Text>
                <Text
                  variant="body"
                  weight="bold"
                  color={isActive ? themeColors.accent.amber : themeColors.ink[900]}
                >
                  {fmt(kt.time)}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* ── Journey Timeline ───────────────────────────────────── */}
      <Card elevation="raised">
        <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>
          Journey Timeline
        </Text>
        {timeline.map((entry, i) => {
          const status = stepStatus(entry, i, timeline);
          return (
            <TimelineStep
              key={i}
              label={entry.label}
              detail={entry.detail}
              status={status}
              isLast={i === timeline.length - 1}
            />
          );
        })}
      </Card>

      {/* ── Near Your Gate ─────────────────────────────────────── */}
      {dining.length > 0 && (
        <Card elevation="raised">
          <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>
            Near Your Gate
          </Text>
          {dining.map((r, i) => (
            <View key={r.id}>
              <View style={styles.diningRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="semibold">
                    {r.name}
                  </Text>
                  <Text variant="caption" color={themeColors.ink[500]}>
                    {r.cuisine}
                    {r.terminal ? ` \u00b7 Terminal ${r.terminal}` : ''}
                  </Text>
                </View>
                <Badge
                  label={`${r.walk_minutes} min walk`}
                  variant="neutral"
                />
              </View>
              {i < dining.length - 1 && <Divider spacing={4} />}
            </View>
          ))}
        </Card>
      )}

      {/* ── Actions ────────────────────────────────────────────── */}
      <View style={styles.actionsRow}>
        <Button
          title="Share"
          variant="secondary"
          onPress={handleShare}
          style={{ flex: 1, marginRight: themeSpacing[2] }}
        />
        <Button
          title="Delete Trip"
          variant="danger"
          onPress={handleDelete}
          style={{ flex: 1, marginLeft: themeSpacing[2] }}
        />
      </View>

      {/* Bottom padding */}
      <View style={{ height: themeSpacing[8] }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: themeSpacing[6],
    backgroundColor: themeColors.surface.secondary,
  },
  scroll: {
    flex: 1,
    backgroundColor: themeColors.surface.secondary,
  },
  content: {
    padding: themeSpacing[4],
    gap: themeSpacing[4],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 6,
    marginLeft: themeSpacing[3],
  },
  countdownCard: {
    alignItems: 'center',
    paddingVertical: themeSpacing[6],
  },
  keyTimesCard: {
    paddingVertical: themeSpacing[3],
  },
  keyTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keyTimeCol: {
    alignItems: 'center',
    flex: 1,
  },
  diningRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: themeSpacing[2],
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
