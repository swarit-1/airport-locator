import React, { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Button, Card, Input, Badge, Divider, themeColors, themeSpacing, themeRadii } from '@boarding/ui-native';
import { airlineSeeds, airlinePolicySeeds, airportSeeds, airportProfileSeeds } from '@boarding/db';
import type { RootStackParamList } from '../navigation';
import * as api from '../services/api';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type Step = 'airline' | 'flight' | 'origin' | 'preferences' | 'computing' | 'result';

interface TripForm {
  airline_iata: string;
  airline_name: string;
  flight_number: string;
  departure_date: string;
  departure_time: string;
  airport_iata: string;
  flight_type: 'domestic' | 'international';
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

const defaultForm: TripForm = {
  airline_iata: '',
  airline_name: '',
  flight_number: '',
  departure_date: '',
  departure_time: '',
  airport_iata: '',
  flight_type: 'domestic',
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
  const [step, setStep] = useState<Step>('airline');
  const [form, setForm] = useState<TripForm>(defaultForm);
  const [airlineSearch, setAirlineSearch] = useState('');
  const [recommendation, setRecommendation] = useState<any>(null);
  const [error, setError] = useState('');

  const filteredAirlines = useMemo(() => {
    if (!airlineSearch) return airlineSeeds;
    const q = airlineSearch.toLowerCase();
    return airlineSeeds.filter(
      (a) => a.name.toLowerCase().includes(q) || a.iata_code.toLowerCase().includes(q),
    );
  }, [airlineSearch]);

  function selectAirline(iata: string, name: string) {
    setForm({ ...form, airline_iata: iata, airline_name: name });
    setStep('flight');
  }

  function handleFlightNext() {
    if (!form.flight_number || !form.departure_date || !form.departure_time || !form.airport_iata) {
      setError('Please fill in all flight details');
      return;
    }
    setError('');
    setStep('origin');
  }

  function handleOriginNext() {
    if (!form.origin_label) {
      setError('Please enter your pickup location');
      return;
    }
    setError('');
    setStep('preferences');
  }

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
      setError(e.message ?? 'Computation failed');
      setStep('preferences');
    }
  }

  // ─── Step: Airline ──────────────────────────────────────────────────

  if (step === 'airline') {
    return (
      <View style={{ flex: 1, backgroundColor: themeColors.surface.secondary }}>
        <View style={{ paddingHorizontal: themeSpacing[4], paddingTop: themeSpacing[4] }}>
          <Text variant="h2" style={{ marginBottom: themeSpacing[3] }}>Choose airline</Text>
          <Input
            placeholder="Search airlines..."
            value={airlineSearch}
            onChangeText={setAirlineSearch}
          />
        </View>
        <FlatList
          data={filteredAirlines}
          keyExtractor={(item) => item.iata_code}
          contentContainerStyle={{ padding: themeSpacing[4], gap: themeSpacing[2] }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => selectAirline(item.iata_code, item.name)}
              style={({ pressed }) => ({
                backgroundColor: pressed ? themeColors.brand[50] : themeColors.surface.elevated,
                padding: themeSpacing[4],
                borderRadius: themeRadii.lg,
                flexDirection: 'row' as const,
                justifyContent: 'space-between' as const,
                alignItems: 'center' as const,
              })}
            >
              <View>
                <Text variant="body" weight="semibold">{item.name}</Text>
                <Text variant="caption" color={themeColors.ink[400]}>{item.iata_code}</Text>
              </View>
              <Badge label={item.iata_code} variant="brand" />
            </Pressable>
          )}
        />
      </View>
    );
  }

  // ─── Step: Flight Details ───────────────────────────────────────────

  if (step === 'flight') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, backgroundColor: themeColors.surface.secondary }} contentContainerStyle={{ padding: themeSpacing[4], gap: themeSpacing[4] }}>
          <Text variant="h2">Flight details</Text>
          <Badge label={form.airline_name} variant="brand" />

          <Input
            label="Flight Number"
            placeholder={`${form.airline_iata}123`}
            value={form.flight_number}
            onChangeText={(v) => setForm({ ...form, flight_number: v })}
            autoCapitalize="characters"
          />

          <Input
            label="Departure Date"
            placeholder="2026-03-25"
            value={form.departure_date}
            onChangeText={(v) => setForm({ ...form, departure_date: v })}
          />

          <Input
            label="Departure Time (airport local)"
            placeholder="14:30"
            value={form.departure_time}
            onChangeText={(v) => setForm({ ...form, departure_time: v })}
          />

          <Text variant="caption" weight="semibold" color={themeColors.ink[600]} style={{ marginTop: themeSpacing[2] }}>
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

          <View style={{ flexDirection: 'row', gap: themeSpacing[2], marginTop: themeSpacing[2] }}>
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

          <View style={{ flexDirection: 'row', gap: themeSpacing[3], marginTop: themeSpacing[2] }}>
            <Button title="Back" variant="ghost" onPress={() => setStep('airline')} style={{ flex: 1 }} />
            <Button title="Next" onPress={handleFlightNext} style={{ flex: 1 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ─── Step: Origin ───────────────────────────────────────────────────

  if (step === 'origin') {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, backgroundColor: themeColors.surface.secondary }} contentContainerStyle={{ padding: themeSpacing[4], gap: themeSpacing[4] }}>
          <Text variant="h2">Where are you coming from?</Text>
          <Input
            label="Pickup Address or Landmark"
            placeholder="123 Main St, Seattle, WA"
            value={form.origin_label}
            onChangeText={(v) => setForm({ ...form, origin_label: v })}
          />
          <Text variant="caption" color={themeColors.ink[400]}>
            Tip: In the full app, you can use your device GPS for automatic location detection.
          </Text>

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
        <Text variant="h2" style={{ marginBottom: themeSpacing[2] }}>Computing...</Text>
        <Text variant="bodySmall" color={themeColors.ink[400]}>Analyzing traffic, security, and airline rules</Text>
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
        <Button title="Plan Another Trip" variant="secondary" onPress={() => { setStep('airline'); setForm(defaultForm); setRecommendation(null); }} />
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
