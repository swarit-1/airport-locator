import React, { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Button, Card, Input, Badge, Divider, themeColors, themeSpacing, themeRadii } from '@boarding/ui-native';
import { airlineSeeds, airlinePolicySeeds, airportSeeds, airportProfileSeeds } from '@boarding/db';
import type { RootStackParamList } from '../navigation';
import * as api from '../services/api';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Step = 'flight' | 'origin' | 'preferences' | 'computing' | 'result';

interface TripForm {
  airline_iata: string;
  airline_name: string;
  flight_number: string;
  departure_date: string;
  departure_time: string;
  airport_iata: string;
  flight_type: 'domestic' | 'international';
  terminal: string | null;
  gate: string | null;
  origin_label: string;
  origin_lat: number;
  origin_lng: number;
  has_checked_bags: boolean;
  bag_count: number;
  party_size: number;
  has_tsa_precheck: boolean;
  has_clear: boolean;
  traveling_with_kids: boolean;
  accessibility_needs: boolean;
  ride_mode: string;
  risk_profile: string;
}

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

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

const defaultForm: TripForm = {
  airline_iata: '',
  airline_name: '',
  flight_number: '',
  departure_date: '',
  departure_time: '',
  airport_iata: '',
  flight_type: 'domestic',
  terminal: null,
  gate: null,
  origin_label: '',
  origin_lat: 0,
  origin_lng: 0,
  has_checked_bags: false,
  bag_count: 0,
  party_size: 1,
  has_tsa_precheck: false,
  has_clear: false,
  traveling_with_kids: false,
  accessibility_needs: false,
  ride_mode: 'rideshare',
  risk_profile: 'balanced',
};

export function TripNewScreen() {
  const nav = useNavigation<Nav>();
  const [step, setStep] = useState<Step>('flight');
  const [form, setForm] = useState<TripForm>(defaultForm);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [error, setError] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<string | null>(null);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const [flightInput, setFlightInput] = useState('');

  // ─── Flight Lookup ─────────────────────────────────────────────────

  async function handleFlightLookup() {
    const cleaned = flightInput.trim().toUpperCase().replace(/\s+/g, '');
    if (cleaned.length < 3) {
      setError('Enter a flight number (e.g., AA1234)');
      return;
    }

    setLookupLoading(true);
    setError('');
    setLookupResult(null);

    try {
      const res = await api.lookupFlight(cleaned);
      if (res.found && res.flight) {
        const f = res.flight;
        // Find matching airline from seeds
        const airline = airlineSeeds.find((a) => a.iata_code === f.airline_iata);

        setForm({
          ...form,
          airline_iata: f.airline_iata,
          airline_name: airline?.name ?? f.airline_iata,
          flight_number: f.flight_number,
          departure_date: f.departure_date,
          departure_time: f.departure_time,
          airport_iata: f.airport_iata,
          terminal: f.terminal ?? null,
          gate: f.gate ?? null,
          flight_type: f.flight_type ?? 'domestic',
        });
        setLookupResult(`Found: ${f.airline_iata}${f.flight_number} departing ${f.airport_iata} at ${f.departure_time} on ${f.departure_date}${f.terminal ? ` (Terminal ${f.terminal}${f.gate ? `, Gate ${f.gate}` : ''})` : ''}`);
      } else {
        setLookupResult(null);
        setError('Flight not found. Enter details manually below.');
        // Pre-fill what we can parse from the input
        const match = cleaned.match(/^([A-Z]{2})(\d+)$/);
        if (match) {
          const airline = airlineSeeds.find((a) => a.iata_code === match[1]);
          setForm({
            ...form,
            airline_iata: match[1]!,
            airline_name: airline?.name ?? match[1]!,
            flight_number: match[2]!,
            departure_date: form.departure_date || getTomorrow(),
            departure_time: form.departure_time || '14:00',
          });
        }
      }
    } catch (e: any) {
      setError(e.message ?? 'Lookup failed. Enter details manually.');
      const match = cleaned.match(/^([A-Z]{2})(\d+)$/);
      if (match) {
        const airline = airlineSeeds.find((a) => a.iata_code === match[1]);
        setForm({
          ...form,
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

  function handleFlightNext() {
    if (!form.airline_iata) {
      setError('Please look up a flight or select an airline');
      return;
    }
    if (!form.flight_number) {
      setError('Please enter a flight number');
      return;
    }
    if (!form.departure_date || !form.departure_time) {
      setError('Departure date and time are required');
      return;
    }
    if (!isValidDate(form.departure_date)) {
      setError('Date must be in YYYY-MM-DD format (e.g. 2026-03-25)');
      return;
    }
    if (isDateInPast(form.departure_date)) {
      setError('Departure date cannot be in the past');
      return;
    }
    if (!isValidTime(form.departure_time)) {
      setError('Time must be in HH:MM format (e.g. 14:30)');
      return;
    }
    if (!form.airport_iata) {
      setError('Please select a departure airport');
      return;
    }
    setError('');
    setStep('origin');
  }

  // ─── Origin Geocoding ──────────────────────────────────────────────

  async function handleOriginNext() {
    if (!form.origin_label) {
      setError('Please enter your pickup location');
      return;
    }

    // Geocode the address to get real coordinates
    if (form.origin_lat === 0 && form.origin_lng === 0) {
      setGeocodeLoading(true);
      setError('');
      try {
        const res = await api.resolveLocation({
          mode: 'typed_address',
          query: form.origin_label,
          airport_iata: form.airport_iata,
        });
        if (res.location) {
          setForm({
            ...form,
            origin_label: res.location.label || form.origin_label,
            origin_lat: res.location.point.lat,
            origin_lng: res.location.point.lng,
          });
        }
      } catch {
        // Non-fatal: we'll use fallback coordinates during computation
      } finally {
        setGeocodeLoading(false);
      }
    }

    setError('');
    setStep('preferences');
  }

  // ─── Compute Recommendation ────────────────────────────────────────

  async function handleCompute() {
    setStep('computing');
    setError('');

    const airport = airportSeeds.find((a) => a.iata_code === form.airport_iata);
    const airportProfile = airportProfileSeeds.find(
      (p) => p.iata_code === form.airport_iata && p.flight_type === form.flight_type,
    );
    const airlinePolicy = airlinePolicySeeds.find(
      (p) => p.iata_code === form.airline_iata && p.flight_type === form.flight_type,
    );

    if (!airport || !airportProfile || !airlinePolicy) {
      setError('Airport or airline data not found');
      setStep('preferences');
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
        has_checked_bags: form.has_checked_bags,
        bag_count: form.bag_count,
        party_size: form.party_size,
        has_tsa_precheck: form.has_tsa_precheck,
        has_clear: form.has_clear,
        traveling_with_kids: form.traveling_with_kids,
        accessibility_needs: form.accessibility_needs,
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
      setStep('result');
    } catch (e: any) {
      const msg = e.message ?? 'Computation failed';
      setError(msg);
      if (/invalid|date|time/i.test(msg)) {
        setStep('flight');
      } else {
        setStep('preferences');
      }
    }
  }

  // ─── Step: Flight (combined lookup + manual entry) ─────────────────

  if (step === 'flight') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, backgroundColor: themeColors.surface.secondary }} contentContainerStyle={{ padding: themeSpacing[4], gap: themeSpacing[4] }}>
          <Text variant="h2">Enter your flight</Text>

          {/* Flight lookup */}
          <Card elevation="raised">
            <Text variant="h3" style={{ marginBottom: themeSpacing[2] }}>Look Up Flight</Text>
            <Text variant="caption" color={themeColors.ink[400]} style={{ marginBottom: themeSpacing[3] }}>
              Enter your flight number and we'll auto-fill everything
            </Text>
            <View style={{ flexDirection: 'row', gap: themeSpacing[2], alignItems: 'flex-end' }}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="AA1234"
                  value={flightInput}
                  onChangeText={setFlightInput}
                  autoCapitalize="characters"
                />
              </View>
              <Button
                title={lookupLoading ? '...' : 'Look Up'}
                onPress={handleFlightLookup}
                style={{ minWidth: 100 }}
              />
            </View>
            {lookupLoading && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: themeSpacing[2], marginTop: themeSpacing[2] }}>
                <ActivityIndicator size="small" color={themeColors.brand[500]} />
                <Text variant="caption" color={themeColors.ink[400]}>Looking up flight...</Text>
              </View>
            )}
            {lookupResult && (
              <View style={{ marginTop: themeSpacing[2], backgroundColor: themeColors.success[50], padding: themeSpacing[3], borderRadius: themeRadii.md }}>
                <Text variant="bodySmall" color={themeColors.success[700]}>{lookupResult}</Text>
              </View>
            )}
          </Card>

          <Divider />

          {/* Manual entry / edit fields */}
          <Text variant="h3" color={themeColors.ink[500]}>Flight Details {form.airline_name ? `— ${form.airline_name}` : ''}</Text>

          <View style={{ flexDirection: 'row', gap: themeSpacing[2] }}>
            <View style={{ flex: 1 }}>
              <Input
                label="Airline Code"
                placeholder="AA"
                value={form.airline_iata}
                onChangeText={(v) => {
                  const upper = v.toUpperCase();
                  const airline = airlineSeeds.find((a) => a.iata_code === upper);
                  setForm({ ...form, airline_iata: upper, airline_name: airline?.name ?? upper });
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
                onChangeText={(v) => setForm({ ...form, flight_number: v })}
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
                onChangeText={(v) => setForm({ ...form, departure_date: v })}
              />
              <Text variant="caption" color={themeColors.ink[400]} style={{ marginTop: 2 }}>YYYY-MM-DD</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Time (local)"
                placeholder="14:30"
                value={form.departure_time}
                onChangeText={(v) => setForm({ ...form, departure_time: v })}
              />
              <Text variant="caption" color={themeColors.ink[400]} style={{ marginTop: 2 }}>HH:MM 24h</Text>
            </View>
          </View>

          <Text variant="caption" weight="semibold" color={themeColors.ink[600]}>
            Departure Airport
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: themeSpacing[2] }}>
            {airportSeeds.map((a) => (
              <Pressable
                key={a.iata_code}
                onPress={() => setForm({ ...form, airport_iata: a.iata_code })}
                style={{
                  backgroundColor: form.airport_iata === a.iata_code ? themeColors.brand[600] : themeColors.surface.elevated,
                  paddingHorizontal: themeSpacing[3],
                  paddingVertical: themeSpacing[2],
                  borderRadius: themeRadii.lg,
                  borderWidth: 1,
                  borderColor: form.airport_iata === a.iata_code ? themeColors.brand[600] : themeColors.ink[200],
                }}
              >
                <Text
                  variant="bodySmall"
                  weight="semibold"
                  color={form.airport_iata === a.iata_code ? '#FFFFFF' : themeColors.ink[700]}
                >
                  {a.iata_code}
                </Text>
              </Pressable>
            ))}
          </View>

          {form.terminal && (
            <View style={{ flexDirection: 'row', gap: themeSpacing[3] }}>
              {form.terminal && <Badge label={`Terminal ${form.terminal}`} variant="info" />}
              {form.gate && <Badge label={`Gate ${form.gate}`} variant="info" />}
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: themeSpacing[2] }}>
            {(['domestic', 'international'] as const).map((ft) => (
              <Pressable
                key={ft}
                onPress={() => setForm({ ...form, flight_type: ft })}
                style={{
                  flex: 1,
                  backgroundColor: form.flight_type === ft ? themeColors.brand[600] : themeColors.surface.elevated,
                  padding: themeSpacing[3],
                  borderRadius: themeRadii.lg,
                  alignItems: 'center' as const,
                  borderWidth: 1,
                  borderColor: form.flight_type === ft ? themeColors.brand[600] : themeColors.ink[200],
                }}
              >
                <Text variant="bodySmall" weight="semibold" color={form.flight_type === ft ? '#FFFFFF' : themeColors.ink[700]}>
                  {ft.charAt(0).toUpperCase() + ft.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          {error ? <Text variant="caption" color={themeColors.error[500]}>{error}</Text> : null}

          <Button title="Next" onPress={handleFlightNext} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── Step: Origin ───────────────────────────────────────────────────

  if (step === 'origin') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, backgroundColor: themeColors.surface.secondary }} contentContainerStyle={{ padding: themeSpacing[4], gap: themeSpacing[4] }}>
          <Text variant="h2">Where are you leaving from?</Text>
          <Input
            label="Pickup Address"
            placeholder="123 Main St, Seattle, WA"
            value={form.origin_label}
            onChangeText={(v) => setForm({ ...form, origin_label: v, origin_lat: 0, origin_lng: 0 })}
          />
          <Text variant="caption" color={themeColors.ink[400]}>
            Enter your full address for accurate drive time via Google Maps
          </Text>

          {geocodeLoading && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: themeSpacing[2] }}>
              <ActivityIndicator size="small" color={themeColors.brand[500]} />
              <Text variant="caption" color={themeColors.ink[400]}>Geocoding address...</Text>
            </View>
          )}

          {error ? <Text variant="caption" color={themeColors.error[500]}>{error}</Text> : null}

          <View style={{ flexDirection: 'row', gap: themeSpacing[3] }}>
            <Button title="Back" variant="ghost" onPress={() => setStep('flight')} style={{ flex: 1 }} />
            <Button title="Next" onPress={handleOriginNext} style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── Step: Preferences ──────────────────────────────────────────────

  if (step === 'preferences') {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: themeColors.surface.secondary }} contentContainerStyle={{ padding: themeSpacing[4], gap: themeSpacing[4] }}>
        <Text variant="h2">Travel preferences</Text>

        <Card elevation="raised">
          <ToggleRow label="Checked bags" value={form.has_checked_bags} onChange={(v) => setForm({ ...form, has_checked_bags: v, bag_count: v ? 1 : 0 })} />
          {form.has_checked_bags && (
            <Input
              label="Number of bags"
              value={String(form.bag_count)}
              onChangeText={(v) => setForm({ ...form, bag_count: parseInt(v) || 0 })}
              keyboardType="number-pad"
              style={{ marginTop: themeSpacing[2] }}
            />
          )}
          <Divider />
          <Input
            label="Party size"
            value={String(form.party_size)}
            onChangeText={(v) => setForm({ ...form, party_size: parseInt(v) || 1 })}
            keyboardType="number-pad"
          />
          <Divider />
          <ToggleRow label="TSA PreCheck" value={form.has_tsa_precheck} onChange={(v) => setForm({ ...form, has_tsa_precheck: v })} />
          <ToggleRow label="CLEAR" value={form.has_clear} onChange={(v) => setForm({ ...form, has_clear: v })} />
          <ToggleRow label="Traveling with kids" value={form.traveling_with_kids} onChange={(v) => setForm({ ...form, traveling_with_kids: v })} />
          <ToggleRow label="Accessibility needs" value={form.accessibility_needs} onChange={(v) => setForm({ ...form, accessibility_needs: v })} />
        </Card>

        <Card elevation="raised">
          <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>Risk Profile</Text>
          <View style={{ flexDirection: 'row', gap: themeSpacing[2] }}>
            {(['conservative', 'balanced', 'aggressive'] as const).map((rp) => (
              <Pressable
                key={rp}
                onPress={() => setForm({ ...form, risk_profile: rp })}
                style={{
                  flex: 1,
                  backgroundColor: form.risk_profile === rp ? themeColors.brand[600] : themeColors.surface.elevated,
                  padding: themeSpacing[2],
                  borderRadius: themeRadii.lg,
                  alignItems: 'center' as const,
                  borderWidth: 1,
                  borderColor: form.risk_profile === rp ? themeColors.brand[600] : themeColors.ink[200],
                }}
              >
                <Text variant="caption" weight="semibold" color={form.risk_profile === rp ? '#FFFFFF' : themeColors.ink[700]}>
                  {rp.charAt(0).toUpperCase() + rp.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {error ? <Text variant="caption" color={themeColors.error[500]}>{error}</Text> : null}

        <View style={{ flexDirection: 'row', gap: themeSpacing[3] }}>
          <Button title="Back" variant="ghost" onPress={() => setStep('origin')} style={{ flex: 1 }} />
          <Button title="Get My Time" onPress={handleCompute} style={{ flex: 1 }} />
        </View>
      </ScrollView>
    );
  }

  // ─── Step: Computing ────────────────────────────────────────────────

  if (step === 'computing') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.surface.secondary }}>
        <ActivityIndicator size="large" color={themeColors.brand[500]} style={{ marginBottom: themeSpacing[4] }} />
        <Text variant="h2" style={{ marginBottom: themeSpacing[2] }}>Computing...</Text>
        <Text variant="bodySmall" color={themeColors.ink[400]}>Getting real-time traffic from Google Maps</Text>
        <Text variant="bodySmall" color={themeColors.ink[400]}>Analyzing security wait times and airline rules</Text>
      </View>
    );
  }

  // ─── Step: Result ───────────────────────────────────────────────────

  return (
    <ScrollView style={{ flex: 1, backgroundColor: themeColors.surface.secondary }} contentContainerStyle={{ padding: themeSpacing[4], gap: themeSpacing[4] }}>
      <Card elevation="floating" style={{ alignItems: 'center', paddingVertical: themeSpacing[6] }}>
        <Text variant="overline" color={themeColors.brand[600]} weight="bold">LEAVE BY</Text>
        <Text variant="hero" color={themeColors.brand[700]}>
          {recommendation ? new Date(recommendation.recommended_leave_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '--:--'}
        </Text>
        <Badge
          label={recommendation?.confidence ?? 'medium'}
          variant={recommendation?.confidence === 'high' ? 'success' : recommendation?.confidence === 'low' ? 'warning' : 'info'}
        />
      </Card>

      {recommendation?.breakdown && (
        <Card elevation="raised">
          <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>Breakdown</Text>
          {recommendation.breakdown.map((item: any, i: number) => (
            <View key={i}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: themeSpacing[2] }}>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="medium">{item.label}</Text>
                  <Text variant="caption" color={themeColors.ink[400]}>{item.description}</Text>
                  {item.source && (
                    <Text variant="caption" color={themeColors.ink[300]} style={{ fontSize: 10 }}>
                      Source: {item.source}
                    </Text>
                  )}
                </View>
                <Text variant="body" weight="bold" color={themeColors.brand[600]}>{item.minutes} min</Text>
              </View>
              {i < recommendation.breakdown.length - 1 && <Divider spacing={0} />}
            </View>
          ))}
          <Divider />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="body" weight="bold">Total</Text>
            <Text variant="body" weight="bold" color={themeColors.brand[600]}>{recommendation.total_minutes} min</Text>
          </View>
        </Card>
      )}

      {recommendation?.warnings?.length > 0 && (
        <Card elevation="raised" style={{ backgroundColor: themeColors.warning[50] }}>
          <Text variant="h3" color={themeColors.warning[500]} style={{ marginBottom: themeSpacing[2] }}>Warnings</Text>
          {recommendation.warnings.map((w: string, i: number) => (
            <Text key={i} variant="bodySmall" color={themeColors.ink[700]}>
              {w}
            </Text>
          ))}
        </Card>
      )}

      <View style={{ gap: themeSpacing[3] }}>
        <Button title="View Trip Details" onPress={() => recommendation && nav.navigate('TripDetail', { id: recommendation.trip_id })} />
        <Button title="Plan Another Trip" variant="secondary" onPress={() => { setStep('flight'); setForm(defaultForm); setRecommendation(null); setFlightInput(''); setLookupResult(null); }} />
      </View>
    </ScrollView>
  );
}

// ─── Helper Components ────────────────────────────────────────────────

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const Switch = require('react-native').Switch;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: themeSpacing[1] }}>
      <Text variant="body">{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: themeColors.brand[500] }} />
    </View>
  );
}
