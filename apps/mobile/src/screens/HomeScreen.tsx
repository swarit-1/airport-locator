import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { airportSeeds, airportProfileSeeds } from '@boarding/db';
import * as api from '../services/api';
import { useFlightStatusPolling } from '../hooks/useFlightStatusPolling';
import type { RootStackParamList } from '../navigation';

// ─── Types ───────────────────────────────────────────────────────────

type Nav = NativeStackNavigationProp<RootStackParamList>;

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
  breakdown: Array<{ label: string; minutes: number; description: string; source?: string }>;
  confidence: 'high' | 'medium' | 'low';
}

interface Restaurant {
  name: string;
  terminal?: string;
  gate_range?: string;
  cuisine?: string;
  rating?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ASYNC_KEY = 'activeTrip';

// ─── Hook ────────────────────────────────────────────────────────────

function useActiveTrip() {
  const [trip, setTrip] = useState<ActiveTrip | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(ASYNC_KEY);
      setTrip(raw ? JSON.parse(raw) : null);
    } catch {
      setTrip(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { trip, loading, reload: load };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function formatCountdown(isoTarget: string): string {
  const diff = new Date(isoTarget).getTime() - Date.now();
  if (diff <= 0) return 'Now';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const POPULAR_IATAS = ['JFK', 'LAX', 'ORD', 'ATL', 'DEN', 'SFO', 'SEA', 'DFW'];

function getAirportInfo(iata: string) {
  const seed = airportSeeds.find((a) => a.iata_code === iata);
  const profile = airportProfileSeeds.find(
    (p) => p.iata_code === iata && p.flight_type === 'domestic',
  );
  return {
    city: seed?.city ?? iata,
    avgSecurity: profile?.avg_security_wait_minutes ?? 18,
  };
}

const statusDotColor: Record<ActiveTrip['status'], string> = {
  on_time: themeColors.success[500],
  delayed: themeColors.warning[500],
  cancelled: themeColors.error[500],
  gate_changed: themeColors.warning[500],
};

const statusLabel: Record<ActiveTrip['status'], string> = {
  on_time: 'On Time',
  delayed: 'Delayed',
  cancelled: 'Cancelled',
  gate_changed: 'Gate Changed',
};

// ─── Component ───────────────────────────────────────────────────────

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { trip, loading, reload } = useActiveTrip();
  const [refreshing, setRefreshing] = useState(false);
  const [dining, setDining] = useState<Restaurant[]>([]);

  // Poll flight status every 5 minutes and reload trip data on changes
  useFlightStatusPolling(useCallback((update) => {
    reload();
    Alert.alert('Flight Update', update.message);
  }, [reload]));

  // Reload trip on focus
  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  // Fetch dining when active trip is near departure
  useEffect(() => {
    if (!trip) {
      setDining([]);
      return;
    }
    const hoursOut =
      (new Date(trip.boarding_time).getTime() - Date.now()) / 3_600_000;
    if (hoursOut > 2) {
      setDining([]);
      return;
    }
    let cancelled = false;
    api.getAirportDining(trip.airport_iata).then(
      (res) => { if (!cancelled) setDining(res.restaurants ?? []); },
      () => { if (!cancelled) setDining([]); },
    );
    return () => { cancelled = true; };
  }, [trip]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  if (loading) {
    return (
      <View style={[styles.center, { flex: 1, backgroundColor: themeColors.surface.secondary }]}>
        <ActivityIndicator size="large" color={themeColors.brand[500]} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.surface.secondary }}
      contentContainerStyle={{ paddingBottom: themeSpacing[10] }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.brand[500]} />
      }
    >
      {trip ? (
        <ActiveTripDashboard trip={trip} dining={dining} nav={nav} insets={insets} />
      ) : (
        <EmptyState nav={nav} insets={insets} />
      )}
    </ScrollView>
  );
}

// ─── State A: No Active Trip ─────────────────────────────────────────

function EmptyState({
  nav,
  insets,
}: {
  nav: Nav;
  insets: { top: number; bottom: number };
}) {
  return (
    <>
      {/* Hero */}
      <View style={[styles.hero, { paddingTop: insets.top + themeSpacing[8] }]}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '700',
            letterSpacing: 6,
            color: themeColors.accent.amber,
            textTransform: 'uppercase',
          }}
        >
          BOARDING
        </Text>
        <Text
          style={{
            fontSize: 28,
            fontWeight: '300',
            color: '#FFFFFF',
            marginTop: themeSpacing[3],
            lineHeight: 36,
          }}
        >
          Know exactly when{'\n'}to leave for the airport.
        </Text>
      </View>

      <View style={styles.body}>
        {/* Search card */}
        <Pressable
          onPress={() => nav.navigate('TripNew')}
          style={({ pressed }) => [
            styles.searchCard,
            pressed && { transform: [{ scale: 0.985 }] },
          ]}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: themeColors.ink[400],
              textTransform: 'uppercase',
              letterSpacing: 1,
              marginBottom: 6,
            }}
          >
            New Trip
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '500', color: themeColors.ink[300] }}>
            Where are you flying?
          </Text>
          <View style={styles.searchArrow}>
            <Text style={{ fontSize: 20, color: themeColors.brand[500] }}>{'\u2192'}</Text>
          </View>
        </Pressable>

        {/* Popular airports */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            letterSpacing: 1.5,
            color: themeColors.ink[400],
            textTransform: 'uppercase',
            marginTop: themeSpacing[8],
            marginBottom: themeSpacing[3],
            paddingHorizontal: themeSpacing[5],
          }}
        >
          Popular Airports
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: themeSpacing[5],
            gap: themeSpacing[3],
          }}
        >
          {POPULAR_IATAS.map((iata) => {
            const info = getAirportInfo(iata);
            return (
              <Pressable
                key={iata}
                onPress={() => nav.navigate('Airport', { iata })}
                style={({ pressed }) => [
                  styles.airportCard,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                ]}
              >
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: '800',
                    color: themeColors.brand[500],
                    letterSpacing: -0.5,
                  }}
                >
                  {iata}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '500',
                    color: themeColors.ink[600],
                    marginTop: 4,
                  }}
                >
                  {info.city}
                </Text>
                <View style={styles.securityBadge}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '600',
                      color: themeColors.ink[400],
                    }}
                  >
                    ~{info.avgSecurity} min security
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Ride Circles teaser */}
        <View style={styles.circlesTeaser}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                letterSpacing: 1.5,
                color: themeColors.ink[400],
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Ride Circles
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '400',
                color: themeColors.ink[600],
                lineHeight: 22,
              }}
            >
              Share rides to the airport with travelers on similar schedules.
            </Text>
          </View>
          <Pressable
            onPress={() => nav.navigate('Main', { screen: 'Circles' } as any)}
            style={styles.circlesArrow}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: themeColors.brand[500] }}>
              {'\u2192'}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

// ─── State B: Active Trip Dashboard ──────────────────────────────────

function ActiveTripDashboard({
  trip,
  dining,
  nav,
  insets,
}: {
  trip: ActiveTrip;
  dining: Restaurant[];
  nav: Nav;
  insets: { top: number; bottom: number };
}) {
  const departureCountdown = formatCountdown(
    `${trip.departure_date}T${trip.departure_time}`,
  );

  return (
    <>
      {/* Dark header */}
      <View style={[styles.dashboardHeader, { paddingTop: insets.top + themeSpacing[6] }]}>
        <Text
          style={{
            fontSize: 13,
            fontWeight: '700',
            letterSpacing: 4,
            color: themeColors.accent.amber,
            textTransform: 'uppercase',
          }}
        >
          BOARDING
        </Text>
        <Text
          style={{
            fontSize: 22,
            fontWeight: '300',
            color: '#FFFFFF',
            marginTop: themeSpacing[2],
            lineHeight: 30,
          }}
        >
          Your flight departs in{' '}
          <Text style={{ fontWeight: '700', color: themeColors.accent.amber }}>
            {departureCountdown}
          </Text>
        </Text>
      </View>

      {/* Countdown ring */}
      <View style={styles.ringSection}>
        <CountdownRing
          targetTime={trip.leave_by_time}
          totalMinutes={trip.total_minutes}
          label="leave by"
          size={220}
          color={themeColors.accent.amber}
          trackColor={themeColors.ink[100]}
        />
      </View>

      {/* Key times row */}
      <View style={styles.keyTimesRow}>
        <KeyTimeBlock label="Leave" time={formatTime(trip.leave_by_time)} active />
        <KeyTimeDivider />
        <KeyTimeBlock label="Airport" time={formatTime(trip.arrive_airport_time)} />
        <KeyTimeDivider />
        <KeyTimeBlock label="Gate" time={formatTime(trip.at_gate_time)} />
        <KeyTimeDivider />
        <KeyTimeBlock label="Board" time={formatTime(trip.boarding_time)} />
      </View>

      <View style={styles.dashboardBody}>
        {/* Alert card */}
        {trip.status !== 'on_time' && trip.status_message && (
          <View style={{ marginBottom: themeSpacing[4] }}>
            <AlertCard
              type={
                trip.status === 'delayed'
                  ? 'delay'
                  : trip.status === 'cancelled'
                    ? 'cancelled'
                    : 'gate_change'
              }
              title={statusLabel[trip.status]}
              message={trip.status_message}
              timestamp={
                trip.delay_minutes > 0
                  ? `+${trip.delay_minutes} min`
                  : undefined
              }
            />
          </View>
        )}

        {/* Flight status card */}
        <View style={styles.flightCard}>
          <View style={styles.flightCardHeader}>
            <View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '800',
                  color: themeColors.ink[900],
                  letterSpacing: -0.5,
                }}
              >
                {trip.airline_iata} {trip.flight_number}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '500',
                  color: themeColors.ink[500],
                  marginTop: 2,
                }}
              >
                {trip.airline_name}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusDotColor[trip.status] },
                ]}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: statusDotColor[trip.status],
                }}
              >
                {statusLabel[trip.status]}
              </Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <Text style={styles.routeIata}>{trip.airport_iata}</Text>
            <View style={styles.routeLine}>
              <View style={styles.routeDash} />
              <Text style={{ fontSize: 12, color: themeColors.ink[300] }}>{'\u2708'}</Text>
              <View style={styles.routeDash} />
            </View>
            <Text style={styles.routeIata}>{trip.arrival_airport ?? '---'}</Text>
          </View>

          <View style={styles.flightMeta}>
            {trip.terminal && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Terminal</Text>
                <Text style={styles.metaValue}>{trip.terminal}</Text>
              </View>
            )}
            {trip.gate && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Gate</Text>
                <Text style={styles.metaValue}>{trip.gate}</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Departs</Text>
              <Text style={styles.metaValue}>{trip.departure_time}</Text>
            </View>
          </View>
        </View>

        {/* Timeline preview */}
        <View style={styles.timelineSection}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              letterSpacing: 1.5,
              color: themeColors.ink[400],
              textTransform: 'uppercase',
              marginBottom: themeSpacing[4],
            }}
          >
            Your Timeline
          </Text>
          {trip.breakdown.slice(0, 3).map((step, i) => (
            <TimelineStep
              key={step.label}
              label={step.label}
              detail={step.description}
              minutes={step.minutes}
              source={step.source}
              status={i === 0 ? 'active' : 'upcoming'}
              isLast={i === 2 || i === trip.breakdown.length - 1}
            />
          ))}
          {trip.breakdown.length > 3 && (
            <Pressable
              onPress={() => nav.navigate('TripDetail', { id: trip.trip_id })}
              style={({ pressed }) => [
                styles.viewTimeline,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: themeColors.brand[500],
                }}
              >
                View full timeline
              </Text>
              <Text style={{ fontSize: 16, color: themeColors.brand[500], marginLeft: 6 }}>
                {'\u2192'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Near Your Gate dining */}
        {dining.length > 0 && (
          <View style={styles.diningSection}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                letterSpacing: 1.5,
                color: themeColors.ink[400],
                textTransform: 'uppercase',
                marginBottom: themeSpacing[3],
              }}
            >
              Near Your Gate
            </Text>
            {dining.slice(0, 4).map((restaurant, i) => (
              <View
                key={`${restaurant.name}-${i}`}
                style={[
                  styles.diningRow,
                  i < Math.min(dining.length, 4) - 1 && styles.diningRowBorder,
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: '600',
                      color: themeColors.ink[800],
                    }}
                  >
                    {restaurant.name}
                  </Text>
                  {restaurant.cuisine && (
                    <Text
                      style={{
                        fontSize: 12,
                        color: themeColors.ink[400],
                        marginTop: 2,
                      }}
                    >
                      {restaurant.cuisine}
                    </Text>
                  )}
                </View>
                {restaurant.gate_range && (
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: themeColors.ink[300],
                    }}
                  >
                    Gates {restaurant.gate_range}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function KeyTimeBlock({
  label,
  time,
  active,
}: {
  label: string;
  time: string;
  active?: boolean;
}) {
  return (
    <View style={styles.keyTimeBlock}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 1,
          color: active ? themeColors.accent.amber : themeColors.ink[400],
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: 17,
          fontWeight: '700',
          color: active ? themeColors.ink[900] : themeColors.ink[600],
          marginTop: 4,
        }}
      >
        {time}
      </Text>
    </View>
  );
}

function KeyTimeDivider() {
  return (
    <View
      style={{
        width: 1,
        height: 28,
        backgroundColor: themeColors.ink[100],
        alignSelf: 'center',
      }}
    />
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Empty state ──
  hero: {
    backgroundColor: themeColors.surface.dark,
    paddingHorizontal: themeSpacing[5],
    paddingBottom: themeSpacing[8],
    minHeight: 200,
    justifyContent: 'flex-end',
  },
  body: {
    paddingTop: themeSpacing[5],
  },
  searchCard: {
    backgroundColor: themeColors.surface.elevated,
    marginHorizontal: themeSpacing[5],
    borderRadius: themeRadii.lg,
    paddingVertical: themeSpacing[5],
    paddingHorizontal: themeSpacing[5],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 88,
    justifyContent: 'center',
  },
  searchArrow: {
    position: 'absolute',
    right: themeSpacing[5],
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  airportCard: {
    backgroundColor: themeColors.surface.elevated,
    borderRadius: themeRadii.lg,
    paddingVertical: themeSpacing[4],
    paddingHorizontal: themeSpacing[4],
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  securityBadge: {
    marginTop: themeSpacing[2],
    backgroundColor: themeColors.ink[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  circlesTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: themeSpacing[8],
    marginHorizontal: themeSpacing[5],
    paddingVertical: themeSpacing[5],
    borderTopWidth: 1,
    borderTopColor: themeColors.ink[100],
  },
  circlesArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: themeColors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: themeSpacing[4],
  },

  // ── Dashboard ──
  dashboardHeader: {
    backgroundColor: themeColors.surface.dark,
    paddingHorizontal: themeSpacing[5],
    paddingBottom: themeSpacing[6],
  },
  ringSection: {
    backgroundColor: themeColors.surface.secondary,
    paddingVertical: themeSpacing[6],
    alignItems: 'center',
  },
  keyTimesRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: themeColors.surface.elevated,
    marginHorizontal: themeSpacing[5],
    paddingVertical: themeSpacing[4],
    borderRadius: themeRadii.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  keyTimeBlock: {
    alignItems: 'center',
    paddingHorizontal: themeSpacing[2],
  },
  dashboardBody: {
    paddingHorizontal: themeSpacing[5],
    paddingTop: themeSpacing[5],
  },

  // ── Flight card ──
  flightCard: {
    backgroundColor: themeColors.surface.elevated,
    borderRadius: themeRadii.lg,
    padding: themeSpacing[5],
    marginBottom: themeSpacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  flightCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: themeSpacing[5],
    marginBottom: themeSpacing[4],
  },
  routeIata: {
    fontSize: 20,
    fontWeight: '800',
    color: themeColors.ink[800],
    letterSpacing: 1,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: themeSpacing[3],
    gap: 6,
  },
  routeDash: {
    width: 24,
    height: 1,
    backgroundColor: themeColors.ink[200],
  },
  flightMeta: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: themeColors.ink[50],
    paddingTop: themeSpacing[3],
    gap: themeSpacing[5],
  },
  metaItem: {
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: themeColors.ink[400],
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
    color: themeColors.ink[800],
  },

  // ── Timeline ──
  timelineSection: {
    marginBottom: themeSpacing[4],
  },
  viewTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: themeSpacing[3],
    minHeight: 44,
  },

  // ── Dining ──
  diningSection: {
    marginBottom: themeSpacing[4],
  },
  diningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: themeSpacing[3],
    minHeight: 44,
  },
  diningRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: themeColors.ink[50],
  },
});
