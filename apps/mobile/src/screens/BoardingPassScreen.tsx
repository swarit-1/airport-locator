import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Button, Card, Input, Badge, themeColors, themeSpacing } from '@boarding/ui-native';
import { parseBCBP } from '../utils/boarding-pass-parser';
import type { RootStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function BoardingPassScreen() {
  const nav = useNavigation<Nav>();
  const [manualEntry, setManualEntry] = useState('');
  const [parsed, setParsed] = useState<ReturnType<typeof parseBCBP> | null>(null);
  const [error, setError] = useState('');

  function handleParse() {
    if (!manualEntry.trim()) {
      setError('Enter barcode data');
      return;
    }
    setError('');
    try {
      const result = parseBCBP(manualEntry.trim());
      setParsed(result);
    } catch (e: any) {
      setError(e.message ?? 'Failed to parse boarding pass');
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.surface.secondary }}
      contentContainerStyle={{ padding: themeSpacing[4], gap: themeSpacing[4] }}
    >
      <Text variant="h2">Boarding Pass Scanner</Text>
      <Text variant="bodySmall" color={themeColors.ink[500]}>
        Scan your boarding pass barcode to auto-create a trip. Camera scanning requires the Expo development build.
      </Text>

      {/* Manual Entry (works without camera) */}
      <Card elevation="raised">
        <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>Manual Barcode Entry</Text>
        <Text variant="caption" color={themeColors.ink[400]} style={{ marginBottom: themeSpacing[2] }}>
          Enter the BCBP barcode string from your boarding pass (the long string of characters in the 2D barcode).
        </Text>
        <Input
          placeholder="M1DOE/JOHN            E..."
          value={manualEntry}
          onChangeText={setManualEntry}
          multiline
          style={{ height: 80, textAlignVertical: 'top' }}
        />
        {error ? <Text variant="caption" color={themeColors.error[500]} style={{ marginTop: themeSpacing[1] }}>{error}</Text> : null}
        <Button title="Parse" onPress={handleParse} style={{ marginTop: themeSpacing[3] }} />
      </Card>

      {/* Parsed Result */}
      {parsed && (
        <Card elevation="floating">
          <Badge label="Parsed Successfully" variant="success" />
          <View style={{ marginTop: themeSpacing[3], gap: themeSpacing[2] }}>
            <ParsedRow label="Passenger" value={parsed.passengerName} />
            <ParsedRow label="Flight" value={`${parsed.airlineCode}${parsed.flightNumber}`} />
            <ParsedRow label="Date" value={parsed.flightDate} />
            <ParsedRow label="From" value={parsed.fromAirport} />
            <ParsedRow label="To" value={parsed.toAirport} />
            {parsed.seatNumber && <ParsedRow label="Seat" value={parsed.seatNumber} />}
            {parsed.bookingReference && <ParsedRow label="Booking Ref" value={parsed.bookingReference} />}
            {parsed.sequenceNumber && <ParsedRow label="Sequence" value={parsed.sequenceNumber} />}
          </View>
          <Button
            title="Create Trip from This"
            style={{ marginTop: themeSpacing[4] }}
            onPress={() => nav.navigate('TripNew')}
          />
        </Card>
      )}

      {/* Camera Scanner placeholder */}
      <Card elevation="flat" style={{ alignItems: 'center', paddingVertical: themeSpacing[8], borderWidth: 2, borderStyle: 'dashed', borderColor: themeColors.ink[200] }}>
        <Text variant="h3" color={themeColors.ink[300]}>Camera Scanner</Text>
        <Text variant="bodySmall" color={themeColors.ink[300]} align="center" style={{ marginTop: themeSpacing[2] }}>
          Available in Expo development build with expo-camera and expo-barcode-scanner
        </Text>
      </Card>
    </ScrollView>
  );
}

function ParsedRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text variant="bodySmall" color={themeColors.ink[500]}>{label}</Text>
      <Text variant="bodySmall" weight="semibold">{value}</Text>
    </View>
  );
}
