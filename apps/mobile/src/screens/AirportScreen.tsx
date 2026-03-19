import React, { useMemo } from 'react';
import { View, ScrollView, Linking, Pressable } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Text, Card, Badge, Divider, themeColors, themeSpacing } from '@boarding/ui-native';
import { airportSeeds, airportProfileSeeds } from '@boarding/db';
import type { RootStackParamList } from '../navigation';

export function AirportScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Airport'>>();
  const { iata } = route.params;

  const airport = useMemo(() => airportSeeds.find((a) => a.iata_code === iata), [iata]);
  const profiles = useMemo(
    () => airportProfileSeeds.filter((p) => p.iata_code === iata),
    [iata],
  );

  if (!airport) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="h3" color={themeColors.ink[400]}>Airport not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.surface.secondary }}
      contentContainerStyle={{ padding: themeSpacing[4], gap: themeSpacing[4] }}
    >
      {/* Header */}
      <View>
        <Badge label={airport.iata_code} variant="brand" />
        <Text variant="h1" style={{ marginTop: themeSpacing[2] }}>{airport.name}</Text>
        <Text variant="bodySmall" color={themeColors.ink[500]}>
          {airport.city}, {airport.state} — {airport.timezone}
        </Text>
      </View>

      {/* Profiles by flight type */}
      {profiles.map((p) => (
        <Card key={p.flight_type} elevation="raised">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpacing[3] }}>
            <Text variant="h3">{p.flight_type === 'domestic' ? 'Domestic' : 'International'}</Text>
            <Badge label={p.flight_type} variant={p.flight_type === 'domestic' ? 'info' : 'warning'} />
          </View>

          <StatRow label="Curb to bag drop" value={`${p.curb_to_bag_drop_minutes} min`} />
          <StatRow label="Bag drop to security" value={`${p.bag_drop_to_security_minutes} min`} />
          <StatRow label="Security to gate" value={`${p.security_to_gate_minutes} min`} />
          <Divider />
          <StatRow label="Avg security wait" value={`${p.avg_security_wait_minutes} min`} highlight />
          <StatRow label="Peak security wait" value={`${p.peak_security_wait_minutes} min`} warn />
          <Divider />
          <StatRow label="Min arrival before departure" value={`${p.min_arrival_before_departure} min`} />
        </Card>
      ))}

      {/* Quick links */}
      <Card elevation="raised">
        <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>Quick Links</Text>
        <Pressable
          onPress={() => Linking.openURL(`https://www.google.com/maps/search/${airport.name}`)}
          style={{ paddingVertical: themeSpacing[2] }}
        >
          <Text variant="body" color={themeColors.brand[600]}>Open in Maps</Text>
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL(`https://www.google.com/search?q=${airport.iata_code}+airport+food`)}
          style={{ paddingVertical: themeSpacing[2] }}
        >
          <Text variant="body" color={themeColors.brand[600]}>Airport Dining</Text>
        </Pressable>
      </Card>
    </ScrollView>
  );
}

function StatRow({ label, value, highlight, warn }: { label: string; value: string; highlight?: boolean; warn?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: themeSpacing[1] }}>
      <Text variant="bodySmall" color={themeColors.ink[600]}>{label}</Text>
      <Text
        variant="bodySmall"
        weight="semibold"
        color={warn ? themeColors.warning[500] : highlight ? themeColors.brand[600] : themeColors.ink[900]}
      >
        {value}
      </Text>
    </View>
  );
}
