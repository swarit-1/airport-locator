import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Button, Card, Badge, Divider, themeColors, themeSpacing } from '@boarding/ui-native';
import type { RootStackParamList } from '../navigation';
import * as api from '../services/api';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function TripsScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStore()
      .then((store) => setTrips(store.trips ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.surface.secondary }}
      contentContainerStyle={{ paddingTop: insets.top + themeSpacing[4], paddingHorizontal: themeSpacing[4], paddingBottom: themeSpacing[8] }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpacing[4] }}>
        <Text variant="h1">Trips</Text>
        <Button title="+ New" size="sm" onPress={() => nav.navigate('TripNew')} />
      </View>

      {loading ? (
        <Text variant="bodySmall" color={themeColors.ink[400]}>Loading...</Text>
      ) : trips.length === 0 ? (
        <Card elevation="flat" style={{ alignItems: 'center', paddingVertical: themeSpacing[8] }}>
          <Text variant="h3" color={themeColors.ink[400]} style={{ marginBottom: themeSpacing[2] }}>
            No trips yet
          </Text>
          <Text variant="bodySmall" color={themeColors.ink[400]} align="center" style={{ marginBottom: themeSpacing[4] }}>
            Plan your first trip and get a personalized departure recommendation.
          </Text>
          <Button title="Plan a Trip" onPress={() => nav.navigate('TripNew')} />
        </Card>
      ) : (
        <View style={{ gap: themeSpacing[3] }}>
          {trips.map(([id, trip]: [string, any]) => (
            <Pressable key={id} onPress={() => nav.navigate('TripDetail', { id })}>
              <Card elevation="raised">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text variant="body" weight="semibold">{trip.flight_number}</Text>
                    <Text variant="caption" color={themeColors.ink[500]}>
                      {trip.airport_iata} — {trip.departure_date}
                    </Text>
                  </View>
                  <Badge label={trip.flight_type ?? 'domestic'} variant="brand" />
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
