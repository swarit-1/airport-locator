import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Text, Button, Card, Input, Badge, themeColors, themeSpacing, themeRadii } from '@boarding/ui-native';
import { parseBCBP } from '../utils/boarding-pass-parser';
import type { RootStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const COLORS = {
  navy: '#1E3A6E',
  dark: '#1A1A2E',
  amber: '#D4A035',
  warm: '#FAF8F5',
  green: '#3A8B6C',
};

export function BoardingPassScreen() {
  const nav = useNavigation<Nav>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [manualEntry, setManualEntry] = useState('');
  const [parsed, setParsed] = useState<ReturnType<typeof parseBCBP> | null>(null);
  const [error, setError] = useState('');
  const scannedRef = useRef(false);

  function handleParse(data: string) {
    if (!data.trim()) {
      setError('Enter barcode data');
      return;
    }
    setError('');
    try {
      const result = parseBCBP(data.trim());
      setParsed(result);
      setScanning(false);
    } catch (e: any) {
      setError(e.message ?? 'Failed to parse boarding pass');
    }
  }

  function handleBarcodeScan(result: { data: string }) {
    if (scannedRef.current) return;
    scannedRef.current = true;
    handleParse(result.data);
    // Reset after a short delay to allow re-scanning
    setTimeout(() => { scannedRef.current = false; }, 2000);
  }

  // ─── Camera Scanner ──────────────────────────────────────────────

  if (scanning) {
    if (!permission?.granted) {
      return (
        <View style={styles.centered}>
          <Text variant="h3" color={COLORS.dark} align="center">Camera access needed</Text>
          <Text variant="bodySmall" color={themeColors.ink[500]} align="center" style={{ marginTop: 8, paddingHorizontal: 32 }}>
            We need camera access to scan your boarding pass barcode
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <Button title="Grant Access" onPress={requestPermission} />
            <Button title="Cancel" variant="ghost" onPress={() => setScanning(false)} />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['pdf417', 'aztec', 'qr'] }}
          onBarcodeScanned={handleBarcodeScan}
        />
        {/* Overlay */}
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerTopBar}>
            <Pressable onPress={() => setScanning(false)} style={styles.closeButton}>
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: '600' }}>Close</Text>
            </Pressable>
          </View>
          <View style={styles.scannerFrame}>
            <View style={styles.scannerTarget} />
          </View>
          <View style={styles.scannerBottomBar}>
            <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '500', textAlign: 'center' }}>
              Point your camera at the barcode on your boarding pass
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // ─── Main Screen ─────────────────────────────────────────────────

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.warm }}
      contentContainerStyle={{ padding: themeSpacing[4], gap: themeSpacing[4] }}
    >
      <Text variant="h2" color={COLORS.dark}>Scan Boarding Pass</Text>
      <Text variant="bodySmall" color={themeColors.ink[500]}>
        Scan the barcode on your boarding pass to auto-fill your flight details.
      </Text>

      {/* Camera Scan CTA */}
      <Pressable
        onPress={() => setScanning(true)}
        style={({ pressed }) => [styles.scanCard, pressed && { opacity: 0.9 }]}
      >
        <View style={styles.scanCardIcon}>
          <Text style={{ fontSize: 32 }}>📷</Text>
        </View>
        <Text variant="h3" color="#FFF" style={{ marginTop: 12 }}>Scan with Camera</Text>
        <Text variant="caption" color="rgba(255,255,255,0.7)" style={{ marginTop: 4 }}>
          Point at the PDF417 or QR barcode
        </Text>
      </Pressable>

      {/* Manual Entry */}
      <Card elevation="raised">
        <Text variant="h3" color={COLORS.dark} style={{ marginBottom: themeSpacing[2] }}>Manual Entry</Text>
        <Text variant="caption" color={themeColors.ink[400]} style={{ marginBottom: themeSpacing[2] }}>
          Paste the BCBP barcode string from your boarding pass
        </Text>
        <Input
          placeholder="M1DOE/JOHN            E..."
          value={manualEntry}
          onChangeText={setManualEntry}
          multiline
          style={{ height: 80, textAlignVertical: 'top' }}
        />
        {error ? <Text variant="caption" color={themeColors.error[500]} style={{ marginTop: 4 }}>{error}</Text> : null}
        <Button title="Parse" onPress={() => handleParse(manualEntry)} style={{ marginTop: themeSpacing[3] }} />
      </Card>

      {/* Parsed Result */}
      {parsed && (
        <Card elevation="raised" style={{ borderLeftWidth: 4, borderLeftColor: COLORS.green }}>
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
    </ScrollView>
  );
}

function ParsedRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
      <Text variant="bodySmall" color={themeColors.ink[500]}>{label}</Text>
      <Text variant="bodySmall" weight="semibold" color={COLORS.dark}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.warm,
    padding: 24,
  },
  scanCard: {
    backgroundColor: COLORS.navy,
    borderRadius: themeRadii.xl,
    padding: 24,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  scanCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  scannerTopBar: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minHeight: 44,
    justifyContent: 'center',
  },
  scannerFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerTarget: {
    width: 280,
    height: 180,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
  },
  scannerBottomBar: {
    paddingBottom: 60,
    paddingHorizontal: 32,
  },
});
