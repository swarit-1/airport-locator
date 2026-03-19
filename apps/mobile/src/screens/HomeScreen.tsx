import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Button, Card, Badge, themeColors, themeSpacing } from '@boarding/ui-native';
import type { RootStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.surface.secondary }}
      contentContainerStyle={{ paddingTop: insets.top + themeSpacing[4], paddingHorizontal: themeSpacing[4], paddingBottom: themeSpacing[8] }}
    >
      {/* Header */}
      <View style={{ marginBottom: themeSpacing[6] }}>
        <Text variant="overline" color={themeColors.brand[600]} weight="bold">
          BOARDING
        </Text>
        <Text variant="h1" style={{ marginTop: themeSpacing[1] }}>
          Never miss{'\n'}a flight again.
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={{ gap: themeSpacing[3], marginBottom: themeSpacing[6] }}>
        <Button title="Plan a Trip" size="lg" onPress={() => nav.navigate('TripNew')} />
        <Button title="Scan Boarding Pass" variant="secondary" size="lg" onPress={() => nav.navigate('BoardingPass')} />
      </View>

      {/* Upcoming Trips Card */}
      <Card elevation="raised" style={{ marginBottom: themeSpacing[4] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpacing[3] }}>
          <Text variant="h3">Upcoming</Text>
          <Badge label="Demo" variant="brand" />
        </View>
        <Text variant="bodySmall" color={themeColors.ink[500]}>
          No upcoming trips yet. Plan your first trip to see your personalized departure time.
        </Text>
      </Card>

      {/* Ride Circles Card */}
      <Card elevation="raised" style={{ marginBottom: themeSpacing[4] }}>
        <Text variant="h3" style={{ marginBottom: themeSpacing[2] }}>Ride Circles</Text>
        <Text variant="bodySmall" color={themeColors.ink[500]}>
          Share rides to the airport with travelers on similar schedules. Save money, reduce emissions.
        </Text>
        <View style={{ marginTop: themeSpacing[3] }}>
          <Button title="Browse Circles" variant="ghost" size="sm" onPress={() => nav.navigate('Main', { screen: 'Circles' } as any)} />
        </View>
      </Card>

      {/* Airport Quick Links */}
      <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>Popular Airports</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: themeSpacing[2] }}>
        {['JFK', 'LAX', 'ORD', 'ATL', 'DEN', 'SFO', 'SEA', 'DFW'].map((iata) => (
          <Pressable
            key={iata}
            onPress={() => nav.navigate('Airport', { iata })}
            style={({ pressed }) => ({
              backgroundColor: pressed ? themeColors.brand[50] : themeColors.surface.elevated,
              paddingHorizontal: themeSpacing[3],
              paddingVertical: themeSpacing[2],
              borderRadius: 12,
              borderWidth: 1,
              borderColor: themeColors.ink[100],
            })}
          >
            <Text variant="body" weight="semibold" color={themeColors.brand[600]}>
              {iata}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
