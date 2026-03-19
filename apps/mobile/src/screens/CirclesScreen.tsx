import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Card, Badge, themeColors, themeSpacing } from '@boarding/ui-native';
import type { RootStackParamList } from '../navigation';
import * as api from '../services/api';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CirclesScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const [circles, setCircles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStore()
      .then((store) => setCircles(store.circles ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.surface.secondary }}
      contentContainerStyle={{ paddingTop: insets.top + themeSpacing[4], paddingHorizontal: themeSpacing[4], paddingBottom: themeSpacing[8] }}
    >
      <Text variant="h1" style={{ marginBottom: themeSpacing[4] }}>Ride Circles</Text>

      {loading ? (
        <Text variant="bodySmall" color={themeColors.ink[400]}>Loading...</Text>
      ) : circles.length === 0 ? (
        <Card elevation="flat" style={{ alignItems: 'center', paddingVertical: themeSpacing[8] }}>
          <Text variant="h3" color={themeColors.ink[400]}>No circles yet</Text>
          <Text variant="bodySmall" color={themeColors.ink[400]} align="center" style={{ marginTop: themeSpacing[2] }}>
            Circles let you share rides to the airport with travelers on similar schedules.
          </Text>
        </Card>
      ) : (
        <View style={{ gap: themeSpacing[3] }}>
          {circles.map(([id, circle]: [string, any]) => (
            <Pressable key={id} onPress={() => nav.navigate('CircleDetail', { id })}>
              <Card elevation="raised">
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpacing[2] }}>
                  <Text variant="body" weight="semibold">{circle.airport_name ?? circle.airport_iata}</Text>
                  <Badge
                    label={circle.status}
                    variant={circle.status === 'open' ? 'success' : circle.status === 'full' ? 'warning' : 'neutral'}
                  />
                </View>
                <Text variant="bodySmall" color={themeColors.ink[500]}>
                  {circle.creator_name} — {circle.neighborhood ?? 'Nearby'}
                </Text>
                <View style={{ flexDirection: 'row', gap: themeSpacing[4], marginTop: themeSpacing[2] }}>
                  <Text variant="caption" color={themeColors.success[500]}>
                    Save ~${((circle.estimated_savings_cents ?? 0) / 100).toFixed(0)}
                  </Text>
                  <Text variant="caption" color={themeColors.ink[400]}>
                    {circle.current_members}/{circle.max_members} riders
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
