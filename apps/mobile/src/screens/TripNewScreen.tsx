import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
  Share,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Text,
  Button,
  Card,
  Input,
  Badge,
  Divider,
  themeColors,
  themeSpacing,
  themeRadii,
} from '@boarding/ui-native';
import {
  airlineSeeds,
  airlinePolicySeeds,
  airportSeeds,
  airportProfileSeeds,
} from '@boarding/db';
import type { RootStackParamList } from '../navigation';
import * as api from '../services/api';

// ─── Types ──────────────────────────────────────────────────────────────

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Step = 1 | 2 | 3;

interface TripForm {
  airline_iata: string;
  airline_name: string;
  flight_number: string;
  departure_date: string;
  departure_time: string;
  airport_iata: string;
  airport_name: string;
  flight_type: 'domestic' | 'international';
  terminal: string | null;
  gate: string | null;
  origin_label: string;
  origin_lat: number;
  origin_lng: number;
  bag_count: number;
  has_tsa_precheck: boolean;
  has_clear: boolean;
  traveling_with_kids: boolean;
  ride_mode: string;
  risk_profile: string;
}

// ─── Validation Helpers ─────────────────────────────────────────────────

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T00:00:00').getTime());
}

function isValidTime(s: string): boolean {
  if (!/^\d{1,2}:\d{2}$/.test(s)) return false;
  const [h, m] = s.split(':').map(Number);
  return h! >= 0 && h! <= 23 && m! >= 0 && m! <= 59;
}

function isDateInPast(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function formatTime(isoOrTime: string): string {
  try {
    const d = new Date(isoOrTime);
    if (!isNaN(d.getTime())) {
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
  } catch {
    // fall through
  }
  // HH:MM string
  const [h, m] = isoOrTime.split(':').map(Number);
  const ampm = h! >= 12 ? 'PM' : 'AM';
  const h12 = h! % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function subtractMinutes(timeStr: string, minutes: number): string {
  // Handles ISO or HH:MM
  const d = new Date(timeStr);
  if (!isNaN(d.getTime())) {
    return new Date(d.getTime() - minutes * 60000).toISOString();
  }
  return timeStr;
}

// ─── Constants ──────────────────────────────────────────────────────────

const COLORS = {
  bg: '#FAF8F5',
  navy: '#1E3A6E',
  amber: '#D4A035',
  amberDark: '#B8872A',
  white: '#FFFFFF',
};

const RIDE_MODES = [
  { key: 'driving_self', label: 'Driving self', icon: '🚗' },
  { key: 'rideshare', label: 'Rideshare', icon: '🚙' },
  { key: 'dropped_off', label: 'Dropped off', icon: '👋' },
  { key: 'transit', label: 'Transit', icon: '🚇' },
] as const;

const RISK_PROFILES = [
  { key: 'conservative', label: 'Conservative', desc: 'Extra buffer time' },
  { key: 'balanced', label: 'Balanced', desc: 'Recommended' },
  { key: 'aggressive', label: 'Aggressive', desc: 'Cut it close' },
] as const;

const defaultForm: TripForm = {
  airline_iata: '',
  airline_name: '',
  flight_number: '',
  departure_date: '',
  departure_time: '',
  airport_iata: '',
  airport_name: '',
  flight_type: 'domestic',
  terminal: null,
  gate: null,
  origin_label: '',
  origin_lat: 0,
  origin_lng: 0,
  bag_count: 0,
  has_tsa_precheck: false,
  has_clear: false,
  traveling_with_kids: false,
  ride_mode: 'rideshare',
  risk_profile: 'balanced',
};

// ─── Main Component ─────────────────────────────────────────────────────

export function TripNewScreen() {
  const nav = useNavigation<Nav>();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<TripForm>(defaultForm);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [error, setError] = useState('');

  // Step 1 state
  const [flightInput, setFlightInput] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [flightResolved, setFlightResolved] = useState(false);
  const [lookupFailed, setLookupFailed] = useState(false);

  // Step 2 state
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [geocoded, setGeocoded] = useState(false);
  const [computing, setComputing] = useState(false);

  // Step 3 state
  const [expandedBreakdown, setExpandedBreakdown] = useState(false);
  const [saving, setSaving] = useState(false);

  const patch = useCallback(
    (updates: Partial<TripForm>) => setForm((prev) => ({ ...prev, ...updates })),
    [],
  );

  // ─── Step 1: Flight Lookup ──────────────────────────────────────────

  async function handleFlightLookup() {
    const cleaned = flightInput.trim().toUpperCase().replace(/\s+/g, '');
    if (cleaned.length < 3) {
      setError('Enter a flight number (e.g. AA1234)');
      return;
    }

    setLookupLoading(true);
    setError('');
    setFlightResolved(false);
    setLookupFailed(false);

    try {
      const res = await api.lookupFlight(cleaned);
      if (res.found && res.flight) {
        const f = res.flight;
        const airline = airlineSeeds.find((a) => a.iata_code === f.airline_iata);
        const airport = airportSeeds.find((a) => a.iata_code === f.airport_iata);
        patch({
          airline_iata: f.airline_iata,
          airline_name: airline?.name ?? f.airline_iata,
          flight_number: f.flight_number,
          departure_date: f.departure_date,
          departure_time: f.departure_time,
          airport_iata: f.airport_iata,
          airport_name: airport?.name ?? f.airport_iata,
          terminal: f.terminal ?? null,
          gate: f.gate ?? null,
          flight_type: f.flight_type ?? 'domestic',
        });
        setFlightResolved(true);
        setLookupFailed(false);
      } else {
        setFlightResolved(false);
        setLookupFailed(true);
        // Pre-fill what we can parse
        const match = cleaned.match(/^([A-Z]{2})(\d+)$/);
        if (match) {
          const airline = airlineSeeds.find((a) => a.iata_code === match[1]);
          patch({
            airline_iata: match[1]!,
            airline_name: airline?.name ?? match[1]!,
            flight_number: match[2]!,
            departure_date: form.departure_date || getTomorrow(),
            departure_time: form.departure_time || '14:00',
          });
        }
      }
    } catch (e: any) {
      setLookupFailed(true);
      const match = cleaned.match(/^([A-Z]{2})(\d+)$/);
      if (match) {
        const airline = airlineSeeds.find((a) => a.iata_code === match[1]);
        patch({
          airline_iata: match[1]!,
          airline_name: airline?.name ?? match[1]!,
          flight_number: match[2]!,
          departure_date: form.departure_date || getTomorrow(),
          departure_time: form.departure_time || '14:00',
        });
      }
    } finally {
      setLookupLoading(false);
    }
  }

  function canAdvanceStep1(): boolean {
    return (
      !!form.airline_iata &&
      !!form.flight_number &&
      !!form.departure_date &&
      isValidDate(form.departure_date) &&
      !isDateInPast(form.departure_date) &&
      !!form.departure_time &&
      isValidTime(form.departure_time) &&
      !!form.airport_iata
    );
  }

  function handleStep1Next() {
    if (!form.airline_iata || !form.flight_number) {
      setError('Please look up a flight or enter details manually');
      return;
    }
    if (!form.departure_date || !isValidDate(form.departure_date)) {
      setError('Enter a valid date (YYYY-MM-DD)');
      return;
    }
    if (isDateInPast(form.departure_date)) {
      setError('Departure date cannot be in the past');
      return;
    }
    if (!form.departure_time || !isValidTime(form.departure_time)) {
      setError('Enter a valid time (HH:MM, 24h)');
      return;
    }
    if (!form.airport_iata) {
      setError('Please select a departure airport');
      return;
    }
    setError('');
    setStep(2);
  }

  // ─── Step 2: Details + Geocode + Compute ────────────────────────────

  async function handleGeocode() {
    if (!form.origin_label.trim()) return;
    setGeocodeLoading(true);
    try {
      const res = await api.resolveLocation({
        mode: 'typed_address',
        query: form.origin_label,
        airport_iata: form.airport_iata,
      });
      if (res.location) {
        patch({
          origin_label: res.location.label || form.origin_label,
          origin_lat: res.location.point.lat,
          origin_lng: res.location.point.lng,
        });
        setGeocoded(true);
      }
    } catch {
      // Non-fatal: will use fallback coordinates
      setGeocoded(false);
    } finally {
      setGeocodeLoading(false);
    }
  }

  async function handleGetLeaveTime() {
    if (!form.origin_label.trim()) {
      setError('Please enter your origin address');
      return;
    }
    setError('');
    setComputing(true);

    // Geocode if not already done
    if (form.origin_lat === 0 && form.origin_lng === 0) {
      try {
        const res = await api.resolveLocation({
          mode: 'typed_address',
          query: form.origin_label,
          airport_iata: form.airport_iata,
        });
        if (res.location) {
          patch({
            origin_label: res.location.label || form.origin_label,
            origin_lat: res.location.point.lat,
            origin_lng: res.location.point.lng,
          });
          // Use resolved coords for the computation below
          form.origin_lat = res.location.point.lat;
          form.origin_lng = res.location.point.lng;
          form.origin_label = res.location.label || form.origin_label;
        }
      } catch {
        // proceed with fallback
      }
    }

    const airport = airportSeeds.find((a) => a.iata_code === form.airport_iata);
    const airportProfile = airportProfileSeeds.find(
      (p) => p.iata_code === form.airport_iata && p.flight_type === form.flight_type,
    );
    const airlinePolicy = airlinePolicySeeds.find(
      (p) => p.iata_code === form.airline_iata && p.flight_type === form.flight_type,
    );

    if (!airport || !airportProfile || !airlinePolicy) {
      setError('Airport or airline data not found. Try a different airport.');
      setComputing(false);
      return;
    }

    try {
      const tripId = `trip-${Date.now()}`;
      const res = await api.computeRecommendation({
        trip_id: tripId,
        airline_iata: form.airline_iata,
        airline_name: form.airline_name,
        flight_number: form.flight_number,
        departure_date: form.departure_date,
        departure_time: form.departure_time,
        airport_iata: form.airport_iata,
        flight_type: form.flight_type,
        origin_label: form.origin_label,
        origin_lat: form.origin_lat || airport.lat,
        origin_lng: form.origin_lng || airport.lng - 0.15,
        has_checked_bags: form.bag_count > 0,
        bag_count: form.bag_count,
        party_size: 1,
        has_tsa_precheck: form.has_tsa_precheck,
        has_clear: form.has_clear,
        traveling_with_kids: form.traveling_with_kids,
        accessibility_needs: false,
        ride_mode: form.ride_mode,
        risk_profile: form.risk_profile,
        airport_rules: {
          curb_to_bag_drop_minutes: airportProfile.curb_to_bag_drop_minutes,
          bag_drop_to_security_minutes: airportProfile.bag_drop_to_security_minutes,
          security_to_gate_minutes: airportProfile.security_to_gate_minutes,
          avg_security_wait_minutes: airportProfile.avg_security_wait_minutes,
          peak_security_wait_minutes: airportProfile.peak_security_wait_minutes,
          min_arrival_before_departure: airportProfile.min_arrival_before_departure,
        },
        airline_rules: {
          bag_drop_cutoff_minutes: airlinePolicy.bag_drop_cutoff_minutes,
          boarding_begins_minutes: airlinePolicy.boarding_begins_minutes,
          gate_close_minutes: airlinePolicy.gate_close_minutes,
        },
      });
      setRecommendation(res.recommendation);
      setStep(3);
    } catch (e: any) {
      setError(e.message ?? 'Computation failed');
    } finally {
      setComputing(false);
    }
  }

  // ─── Step 3: Save Trip ──────────────────────────────────────────────

  async function handleSaveTrip() {
    if (!recommendation) return;
    setSaving(true);

    const airlinePolicy = airlinePolicySeeds.find(
      (p) => p.iata_code === form.airline_iata && p.flight_type === form.flight_type,
    );
    const boardingBeginsMinutes = airlinePolicy?.boarding_begins_minutes ?? 30;

    // Compute boarding time from departure
    const depDateTime = new Date(`${form.departure_date}T${form.departure_time}:00`);
    const boardingTime = new Date(depDateTime.getTime() - boardingBeginsMinutes * 60000).toISOString();

    const activeTrip = {
      id: recommendation.trip_id || `trip-${Date.now()}`,
      trip_id: recommendation.trip_id || `trip-${Date.now()}`,
      airline_iata: form.airline_iata,
      airline_name: form.airline_name,
      flight_number: form.flight_number,
      departure_date: form.departure_date,
      departure_time: form.departure_time,
      airport_iata: form.airport_iata,
      arrival_airport: null,
      flight_type: form.flight_type,
      terminal: form.terminal,
      gate: form.gate,
      origin_label: form.origin_label,
      leave_by_time: recommendation.recommended_leave_time,
      arrive_airport_time: recommendation.recommended_curb_arrival,
      at_gate_time: recommendation.latest_safe_gate_arrival,
      boarding_time: boardingTime,
      total_minutes: recommendation.total_minutes,
      phase: 'planned',
      status: 'on_time',
      delay_minutes: 0,
      status_message: null,
      breakdown: recommendation.breakdown,
      confidence: recommendation.confidence,
    };

    try {
      await AsyncStorage.setItem('activeTrip', JSON.stringify(activeTrip));
      nav.navigate('Main');
    } catch {
      setError('Failed to save trip');
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    if (!recommendation) return;
    const leaveTime = formatTime(recommendation.recommended_leave_time);
    try {
      await Share.share({
        message: `I'm catching ${form.airline_iata}${form.flight_number} from ${form.airport_iata}. Leave by ${leaveTime} — ${recommendation.total_minutes} min total. Planned with Boarding.`,
      });
    } catch {
      // user cancelled
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 1: FLIGHT
  // ═══════════════════════════════════════════════════════════════════════

  if (step === 1) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: COLORS.bg }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Step indicator */}
          <StepIndicator current={1} />

          <Text variant="h2" style={{ color: COLORS.navy, marginBottom: themeSpacing[1] }}>
            Your flight
          </Text>
          <Text variant="bodySmall" color={themeColors.ink[400]} style={{ marginBottom: themeSpacing[4] }}>
            Enter your flight number and we'll fill in the rest
          </Text>

          {/* Flight lookup input */}
          <View style={{ flexDirection: 'row', gap: themeSpacing[2], alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="AA1234"
                value={flightInput}
                onChangeText={(v) => {
                  setFlightInput(v.toUpperCase());
                  // Reset states when input changes
                  if (flightResolved) setFlightResolved(false);
                  if (lookupFailed) setLookupFailed(false);
                  if (error) setError('');
                }}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>
            <Pressable
              onPress={handleFlightLookup}
              disabled={lookupLoading || flightInput.trim().length < 3}
              style={[
                styles.lookupButton,
                {
                  backgroundColor:
                    lookupLoading || flightInput.trim().length < 3
                      ? themeColors.ink[200]
                      : COLORS.amber,
                },
              ]}
            >
              {lookupLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text variant="body" weight="semibold" color={COLORS.white}>
                  Look up
                </Text>
              )}
            </Pressable>
          </View>

          {/* Resolved flight details */}
          {flightResolved && (
            <Card elevation="raised" style={{ marginTop: themeSpacing[3] }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpacing[2] }}>
                <Text variant="h3" style={{ color: COLORS.navy }}>
                  {form.airline_name}
                </Text>
                <Badge label="Found" variant="success" />
              </View>
              <View style={{ gap: themeSpacing[1] }}>
                <DetailRow label="Route" value={`${form.airport_iata} — ${form.airline_iata}${form.flight_number}`} />
                <DetailRow label="Date" value={form.departure_date} />
                <DetailRow label="Departs" value={formatTime(form.departure_time)} />
                <DetailRow label="Airport" value={form.airport_name || form.airport_iata} />
                {form.terminal && (
                  <DetailRow label="Terminal" value={form.terminal} />
                )}
                {form.gate && (
                  <DetailRow label="Gate" value={form.gate} />
                )}
              </View>
            </Card>
          )}

          {/* Manual entry (shown when lookup fails) */}
          {lookupFailed && (
            <View style={{ marginTop: themeSpacing[3], gap: themeSpacing[3] }}>
              <Text variant="bodySmall" color={themeColors.warning[500]}>
                Flight not found. Enter details manually.
              </Text>

              <View style={{ flexDirection: 'row', gap: themeSpacing[2] }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Airline Code"
                    placeholder="AA"
                    value={form.airline_iata}
                    onChangeText={(v) => {
                      const upper = v.toUpperCase();
                      const airline = airlineSeeds.find((a) => a.iata_code === upper);
                      patch({ airline_iata: upper, airline_name: airline?.name ?? upper });
                    }}
                    autoCapitalize="characters"
                    maxLength={2}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Flight #"
                    placeholder="1234"
                    value={form.flight_number}
                    onChangeText={(v) => patch({ flight_number: v })}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: themeSpacing[2] }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Date"
                    placeholder="2026-03-25"
                    value={form.departure_date}
                    onChangeText={(v) => patch({ departure_date: v })}
                  />
                  <Text variant="caption" color={themeColors.ink[400]} style={{ marginTop: 2 }}>
                    YYYY-MM-DD
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Time"
                    placeholder="14:30"
                    value={form.departure_time}
                    onChangeText={(v) => patch({ departure_time: v })}
                  />
                  <Text variant="caption" color={themeColors.ink[400]} style={{ marginTop: 2 }}>
                    HH:MM (24h)
                  </Text>
                </View>
              </View>

              {/* Airport picker */}
              <Text variant="caption" weight="semibold" color={themeColors.ink[600]}>
                Departure Airport
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: themeSpacing[2] }}>
                {airportSeeds.map((a) => (
                  <Pressable
                    key={a.iata_code}
                    onPress={() => patch({ airport_iata: a.iata_code, airport_name: a.name })}
                    style={[
                      styles.chip,
                      {
                        backgroundColor:
                          form.airport_iata === a.iata_code
                            ? COLORS.navy
                            : themeColors.surface.elevated,
                        borderColor:
                          form.airport_iata === a.iata_code
                            ? COLORS.navy
                            : themeColors.ink[200],
                      },
                    ]}
                  >
                    <Text
                      variant="bodySmall"
                      weight="semibold"
                      color={form.airport_iata === a.iata_code ? COLORS.white : themeColors.ink[700]}
                    >
                      {a.iata_code}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Flight type */}
              <View style={{ flexDirection: 'row', gap: themeSpacing[2] }}>
                {(['domestic', 'international'] as const).map((ft) => (
                  <Pressable
                    key={ft}
                    onPress={() => patch({ flight_type: ft })}
                    style={[
                      styles.chip,
                      {
                        flex: 1,
                        alignItems: 'center' as const,
                        backgroundColor:
                          form.flight_type === ft ? COLORS.navy : themeColors.surface.elevated,
                        borderColor:
                          form.flight_type === ft ? COLORS.navy : themeColors.ink[200],
                      },
                    ]}
                  >
                    <Text
                      variant="bodySmall"
                      weight="semibold"
                      color={form.flight_type === ft ? COLORS.white : themeColors.ink[700]}
                    >
                      {ft.charAt(0).toUpperCase() + ft.slice(1)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Boarding pass link */}
          <Pressable
            onPress={() => nav.navigate('BoardingPass')}
            style={{ marginTop: themeSpacing[3], minHeight: 44, justifyContent: 'center' }}
          >
            <Text variant="bodySmall" color={COLORS.navy} style={{ textDecorationLine: 'underline' }}>
              I have a boarding pass
            </Text>
          </Pressable>

          {error ? (
            <Text variant="caption" color={themeColors.error[500]} style={{ marginTop: themeSpacing[2] }}>
              {error}
            </Text>
          ) : null}

          {/* CTA */}
          <View style={{ marginTop: themeSpacing[4] }}>
            <Pressable
              onPress={handleStep1Next}
              disabled={!canAdvanceStep1()}
              style={[
                styles.ctaButton,
                {
                  backgroundColor: canAdvanceStep1() ? COLORS.amber : themeColors.ink[200],
                },
              ]}
            >
              <Text variant="body" weight="bold" color={COLORS.white}>
                Next
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 2: YOUR DETAILS
  // ═══════════════════════════════════════════════════════════════════════

  if (step === 2) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: COLORS.bg }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <StepIndicator current={2} />

          <Text variant="h2" style={{ color: COLORS.navy, marginBottom: themeSpacing[1] }}>
            Your details
          </Text>
          <Text variant="bodySmall" color={themeColors.ink[400]} style={{ marginBottom: themeSpacing[4] }}>
            {form.airline_iata}{form.flight_number} from {form.airport_iata} on {form.departure_date}
          </Text>

          {/* Origin address */}
          <Text variant="caption" weight="semibold" color={themeColors.ink[600]} style={{ marginBottom: themeSpacing[1] }}>
            Where are you leaving from?
          </Text>
          <View style={{ flexDirection: 'row', gap: themeSpacing[2], alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="123 Main St, Seattle, WA"
                value={form.origin_label}
                onChangeText={(v) => {
                  patch({ origin_label: v, origin_lat: 0, origin_lng: 0 });
                  setGeocoded(false);
                }}
              />
            </View>
            <Pressable
              onPress={handleGeocode}
              disabled={geocodeLoading || !form.origin_label.trim()}
              style={[
                styles.lookupButton,
                {
                  backgroundColor:
                    geocodeLoading || !form.origin_label.trim()
                      ? themeColors.ink[200]
                      : geocoded
                        ? themeColors.success[500]
                        : COLORS.navy,
                },
              ]}
            >
              {geocodeLoading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text variant="bodySmall" weight="semibold" color={COLORS.white}>
                  {geocoded ? 'Done' : 'Locate'}
                </Text>
              )}
            </Pressable>
          </View>

          <Divider spacing={themeSpacing[4]} />

          {/* Travel mode chips */}
          <Text variant="caption" weight="semibold" color={themeColors.ink[600]} style={{ marginBottom: themeSpacing[2] }}>
            How are you getting to the airport?
          </Text>
          <View style={{ flexDirection: 'row', gap: themeSpacing[2], flexWrap: 'wrap' }}>
            {RIDE_MODES.map((rm) => (
              <Pressable
                key={rm.key}
                onPress={() => patch({ ride_mode: rm.key })}
                style={[
                  styles.modeChip,
                  {
                    backgroundColor:
                      form.ride_mode === rm.key ? COLORS.navy : themeColors.surface.elevated,
                    borderColor:
                      form.ride_mode === rm.key ? COLORS.navy : themeColors.ink[200],
                  },
                ]}
              >
                <Text
                  variant="bodySmall"
                  color={form.ride_mode === rm.key ? COLORS.white : themeColors.ink[700]}
                >
                  {rm.icon} {rm.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Divider spacing={themeSpacing[4]} />

          {/* Toggles: TSA PreCheck, CLEAR */}
          <View style={styles.toggleRow}>
            <Text variant="body">TSA PreCheck</Text>
            <Switch
              value={form.has_tsa_precheck}
              onValueChange={(v) => patch({ has_tsa_precheck: v })}
              trackColor={{ true: themeColors.brand[500], false: themeColors.ink[200] }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text variant="body">CLEAR</Text>
            <Switch
              value={form.has_clear}
              onValueChange={(v) => patch({ has_clear: v })}
              trackColor={{ true: themeColors.brand[500], false: themeColors.ink[200] }}
            />
          </View>

          <Divider spacing={themeSpacing[3]} />

          {/* Bag count stepper */}
          <View style={styles.toggleRow}>
            <Text variant="body">Checked bags</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: themeSpacing[3] }}>
              <Pressable
                onPress={() => patch({ bag_count: Math.max(0, form.bag_count - 1) })}
                style={styles.stepperButton}
              >
                <Text variant="body" weight="bold" color={COLORS.navy}>
                  -
                </Text>
              </Pressable>
              <Text variant="body" weight="semibold" style={{ minWidth: 20, textAlign: 'center' }}>
                {form.bag_count}
              </Text>
              <Pressable
                onPress={() => patch({ bag_count: Math.min(3, form.bag_count + 1) })}
                style={styles.stepperButton}
              >
                <Text variant="body" weight="bold" color={COLORS.navy}>
                  +
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Traveling with kids */}
          <View style={styles.toggleRow}>
            <Text variant="body">Traveling with kids</Text>
            <Switch
              value={form.traveling_with_kids}
              onValueChange={(v) => patch({ traveling_with_kids: v })}
              trackColor={{ true: themeColors.brand[500], false: themeColors.ink[200] }}
            />
          </View>

          <Divider spacing={themeSpacing[4]} />

          {/* Risk profile */}
          <Text variant="caption" weight="semibold" color={themeColors.ink[600]} style={{ marginBottom: themeSpacing[2] }}>
            Risk profile
          </Text>
          <View style={{ gap: themeSpacing[2] }}>
            {RISK_PROFILES.map((rp) => {
              const selected = form.risk_profile === rp.key;
              return (
                <Pressable
                  key={rp.key}
                  onPress={() => patch({ risk_profile: rp.key })}
                  style={[
                    styles.riskCard,
                    {
                      backgroundColor: selected ? COLORS.navy : themeColors.surface.elevated,
                      borderColor: selected ? COLORS.navy : themeColors.ink[200],
                    },
                  ]}
                >
                  <Text
                    variant="body"
                    weight="semibold"
                    color={selected ? COLORS.white : themeColors.ink[800]}
                  >
                    {rp.label}
                  </Text>
                  <Text
                    variant="caption"
                    color={selected ? 'rgba(255,255,255,0.7)' : themeColors.ink[400]}
                  >
                    {rp.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {error ? (
            <Text variant="caption" color={themeColors.error[500]} style={{ marginTop: themeSpacing[2] }}>
              {error}
            </Text>
          ) : null}

          {/* Navigation */}
          <View style={{ flexDirection: 'row', gap: themeSpacing[3], marginTop: themeSpacing[4] }}>
            <Pressable
              onPress={() => { setError(''); setStep(1); }}
              style={[styles.ctaButton, { flex: 1, backgroundColor: 'transparent', borderWidth: 1, borderColor: themeColors.ink[300] }]}
            >
              <Text variant="body" weight="semibold" color={themeColors.ink[600]}>
                Back
              </Text>
            </Pressable>
            <Pressable
              onPress={handleGetLeaveTime}
              disabled={computing}
              style={[styles.ctaButton, { flex: 2, backgroundColor: COLORS.amber }]}
            >
              {computing ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: themeSpacing[2] }}>
                  <ActivityIndicator size="small" color={COLORS.white} />
                  <Text variant="body" weight="bold" color={COLORS.white}>
                    Computing...
                  </Text>
                </View>
              ) : (
                <Text variant="body" weight="bold" color={COLORS.white}>
                  Get my leave time
                </Text>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // STEP 3: RESULT (the money screen)
  // ═══════════════════════════════════════════════════════════════════════

  const leaveTime = recommendation
    ? formatTime(recommendation.recommended_leave_time)
    : '--:--';

  const windowStart = recommendation?.leave_window_start
    ? formatTime(recommendation.leave_window_start)
    : null;
  const windowEnd = recommendation?.leave_window_end
    ? formatTime(recommendation.leave_window_end)
    : null;

  const curbTime = recommendation?.recommended_curb_arrival
    ? formatTime(recommendation.recommended_curb_arrival)
    : null;
  const gateTime = recommendation?.latest_safe_gate_arrival
    ? formatTime(recommendation.latest_safe_gate_arrival)
    : null;
  const boardTime = (() => {
    const policy = airlinePolicySeeds.find(
      (p) => p.iata_code === form.airline_iata && p.flight_type === form.flight_type,
    );
    if (!policy) return formatTime(form.departure_time);
    const dep = new Date(`${form.departure_date}T${form.departure_time}:00`);
    return formatTime(new Date(dep.getTime() - policy.boarding_begins_minutes * 60000).toISOString());
  })();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: themeSpacing[8] }]}
    >
      <StepIndicator current={3} />

      {/* Hero leave-by time */}
      <View style={styles.heroContainer}>
        <Text
          variant="overline"
          weight="bold"
          style={{ color: COLORS.navy, letterSpacing: 2, marginBottom: themeSpacing[1] }}
        >
          LEAVE BY
        </Text>
        <Text
          style={{
            fontSize: 56,
            fontWeight: '700',
            color: COLORS.navy,
            lineHeight: 64,
          }}
        >
          {leaveTime}
        </Text>
        {windowStart && windowEnd && (
          <Text
            variant="bodySmall"
            color={themeColors.ink[400]}
            style={{ marginTop: themeSpacing[1] }}
          >
            Window: {windowStart} — {windowEnd}
          </Text>
        )}
        <View style={{ marginTop: themeSpacing[2] }}>
          <Badge
            label={`${recommendation?.confidence ?? 'medium'} confidence`}
            variant={
              recommendation?.confidence === 'high'
                ? 'success'
                : recommendation?.confidence === 'low'
                  ? 'warning'
                  : 'info'
            }
          />
        </View>
      </View>

      {/* Flight summary */}
      <Text variant="bodySmall" color={themeColors.ink[400]} style={{ textAlign: 'center', marginBottom: themeSpacing[4] }}>
        {form.airline_iata}{form.flight_number} from {form.airport_iata} — {form.departure_date} at {formatTime(form.departure_time)}
      </Text>

      {/* Key milestones row */}
      <View style={styles.milestonesContainer}>
        <MilestoneItem label="Leave" time={leaveTime} isFirst />
        <View style={styles.milestoneLine} />
        <MilestoneItem label="Airport" time={curbTime ?? '--'} />
        <View style={styles.milestoneLine} />
        <MilestoneItem label="Gate" time={gateTime ?? '--'} />
        <View style={styles.milestoneLine} />
        <MilestoneItem label="Board" time={boardTime} />
      </View>

      {/* Warnings */}
      {recommendation?.warnings?.length > 0 && (
        <Card elevation="raised" style={{ backgroundColor: themeColors.warning[50], marginTop: themeSpacing[4] }}>
          {recommendation.warnings.map((w: string, i: number) => (
            <Text key={i} variant="bodySmall" color={themeColors.ink[700]} style={{ marginBottom: i < recommendation.warnings.length - 1 ? themeSpacing[1] : 0 }}>
              {w}
            </Text>
          ))}
        </Card>
      )}

      {/* Expandable breakdown */}
      {recommendation?.breakdown && (
        <View style={{ marginTop: themeSpacing[4] }}>
          <Pressable
            onPress={() => setExpandedBreakdown(!expandedBreakdown)}
            style={[styles.breakdownHeader, { minHeight: 44 }]}
          >
            <Text variant="body" weight="semibold" color={COLORS.navy}>
              Breakdown
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: themeSpacing[2] }}>
              <Text variant="body" weight="bold" color={COLORS.navy}>
                {recommendation.total_minutes} min total
              </Text>
              <Text variant="bodySmall" color={themeColors.ink[400]}>
                {expandedBreakdown ? '▲' : '▼'}
              </Text>
            </View>
          </Pressable>

          {expandedBreakdown && (
            <Card elevation="raised" style={{ marginTop: themeSpacing[1] }}>
              {recommendation.breakdown.map((item: any, i: number) => (
                <View key={i}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      paddingVertical: themeSpacing[2],
                    }}
                  >
                    <View style={{ flex: 1, marginRight: themeSpacing[3] }}>
                      <Text variant="body" weight="medium">
                        {item.label}
                      </Text>
                      {item.description && (
                        <Text variant="caption" color={themeColors.ink[400]}>
                          {item.description}
                        </Text>
                      )}
                    </View>
                    <Text variant="body" weight="bold" color={COLORS.navy}>
                      {item.minutes} min
                    </Text>
                  </View>
                  {i < recommendation.breakdown.length - 1 && <Divider spacing={0} />}
                </View>
              ))}
              <Divider />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="body" weight="bold">
                  Total
                </Text>
                <Text variant="body" weight="bold" color={COLORS.navy}>
                  {recommendation.total_minutes} min
                </Text>
              </View>
            </Card>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={{ gap: themeSpacing[3], marginTop: themeSpacing[6] }}>
        <Pressable
          onPress={handleSaveTrip}
          disabled={saving}
          style={[styles.ctaButton, { backgroundColor: COLORS.amber }]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text variant="body" weight="bold" color={COLORS.white}>
              Save Trip
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={handleShare}
          style={[
            styles.ctaButton,
            {
              backgroundColor: 'transparent',
              borderWidth: 1,
              borderColor: COLORS.navy,
            },
          ]}
        >
          <Text variant="body" weight="semibold" color={COLORS.navy}>
            Share
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const labels = ['Flight', 'Details', 'Result'];
  return (
    <View style={{ flexDirection: 'row', gap: themeSpacing[2], marginBottom: themeSpacing[4] }}>
      {labels.map((label, i) => {
        const stepNum = (i + 1) as 1 | 2 | 3;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <View key={label} style={{ flex: 1, alignItems: 'center' }}>
            <View
              style={{
                height: 3,
                width: '100%',
                borderRadius: 2,
                backgroundColor: isActive
                  ? COLORS.amber
                  : isDone
                    ? COLORS.navy
                    : themeColors.ink[200],
                marginBottom: themeSpacing[1],
              }}
            />
            <Text
              variant="caption"
              weight={isActive ? 'semibold' : 'normal'}
              color={isActive ? COLORS.navy : themeColors.ink[400]}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 }}>
      <Text variant="bodySmall" color={themeColors.ink[400]}>
        {label}
      </Text>
      <Text variant="bodySmall" weight="medium">
        {value}
      </Text>
    </View>
  );
}

function MilestoneItem({
  label,
  time,
  isFirst,
}: {
  label: string;
  time: string;
  isFirst?: boolean;
}) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: isFirst ? COLORS.amber : COLORS.navy,
          marginBottom: themeSpacing[1],
        }}
      />
      <Text variant="caption" weight="semibold" color={COLORS.navy}>
        {time}
      </Text>
      <Text variant="caption" color={themeColors.ink[400]}>
        {label}
      </Text>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrollContent: {
    padding: themeSpacing[4],
    paddingBottom: themeSpacing[6],
  },
  lookupButton: {
    minHeight: 44,
    minWidth: 88,
    borderRadius: themeRadii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: themeSpacing[3],
  },
  chip: {
    paddingHorizontal: themeSpacing[3],
    paddingVertical: themeSpacing[2],
    borderRadius: themeRadii.lg,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  modeChip: {
    paddingHorizontal: themeSpacing[3],
    paddingVertical: themeSpacing[2],
    borderRadius: themeRadii.lg,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: themeSpacing[1],
  },
  stepperButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskCard: {
    padding: themeSpacing[3],
    borderRadius: themeRadii.lg,
    borderWidth: 1,
    minHeight: 44,
  },
  ctaButton: {
    minHeight: 52,
    borderRadius: themeRadii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContainer: {
    alignItems: 'center',
    paddingVertical: themeSpacing[6],
  },
  milestonesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: themeSpacing[2],
    paddingVertical: themeSpacing[3],
    backgroundColor: themeColors.surface.elevated,
    borderRadius: themeRadii.lg,
  },
  milestoneLine: {
    flex: 1,
    height: 2,
    backgroundColor: themeColors.ink[200],
    marginHorizontal: themeSpacing[1],
    marginBottom: themeSpacing[4],
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: themeSpacing[2],
  },
});
