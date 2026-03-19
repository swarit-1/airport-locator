import React, { useEffect, useState } from 'react';
import { View, ScrollView, Share } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Text, Button, Card, Badge, Divider, themeColors, themeSpacing } from '@boarding/ui-native';
import type { RootStackParamList } from '../navigation';
import * as api from '../services/api';

export function TripDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'TripDetail'>>();
  const { id } = route.params;
  const [trip, setTrip] = useState<any>(null);
  const [rec, setRec] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStore()
      .then((store) => {
        const t = store.trips?.find(([tid]: [string]) => tid === id);
        const r = store.recommendations?.find(([rid]: [string]) => rid === id);
        if (t) setTrip(t[1]);
        if (r) setRec(r[1]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleShare() {
    if (!rec) return;
    try {
      await Share.share({
        message: `My Boarding recommendation: Leave by ${new Date(rec.recommended_leave_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} for flight ${trip?.flight_number ?? ''} at ${trip?.airport_iata ?? ''}`,
      });
    } catch {}
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text variant="bodySmall" color={themeColors.ink[400]}>Loading...</Text>
      </View>
    );
  }

  if (!trip && !rec) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: themeSpacing[6] }}>
        <Text variant="h3" color={themeColors.ink[400]}>Trip not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.surface.secondary }}
      contentContainerStyle={{ padding: themeSpacing[4], gap: themeSpacing[4] }}
    >
      {/* Flight Info */}
      <Card elevation="raised">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text variant="h2">{trip?.flight_number ?? 'Flight'}</Text>
            <Text variant="bodySmall" color={themeColors.ink[500]}>
              {trip?.airport_iata} — {trip?.departure_date} at {trip?.departure_time}
            </Text>
          </View>
          <Badge label={trip?.flight_type ?? 'domestic'} variant="brand" />
        </View>
      </Card>

      {/* Recommendation */}
      {rec && (
        <Card elevation="floating" style={{ alignItems: 'center', paddingVertical: themeSpacing[6] }}>
          <Text variant="overline" color={themeColors.brand[600]} weight="bold">LEAVE BY</Text>
          <Text variant="hero" color={themeColors.brand[700]}>
            {new Date(rec.recommended_leave_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </Text>
          <Text variant="caption" color={themeColors.ink[500]} style={{ marginTop: themeSpacing[1] }}>
            Window: {new Date(rec.leave_window_start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} – {new Date(rec.leave_window_end).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </Text>
          <Badge
            label={`${rec.confidence} confidence`}
            variant={rec.confidence === 'high' ? 'success' : rec.confidence === 'low' ? 'warning' : 'info'}
          />
        </Card>
      )}

      {/* Breakdown */}
      {rec?.breakdown && (
        <Card elevation="raised">
          <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>Timeline Breakdown</Text>
          {rec.breakdown.map((item: any, i: number) => (
            <View key={i}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: themeSpacing[2] }}>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="medium">{item.label}</Text>
                  <Text variant="caption" color={themeColors.ink[400]}>{item.description}</Text>
                  {item.source && (
                    <Badge label={item.source_type ?? item.source} variant="neutral" />
                  )}
                </View>
                <Text variant="body" weight="bold" color={themeColors.brand[600]}>{item.minutes}m</Text>
              </View>
              {i < rec.breakdown.length - 1 && <Divider spacing={4} />}
            </View>
          ))}
        </Card>
      )}

      {/* Key Times */}
      {rec && (
        <Card elevation="raised">
          <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>Key Times</Text>
          <TimeRow label="Arrive at curb" time={rec.recommended_curb_arrival} />
          <TimeRow label="Bag drop cutoff" time={rec.latest_safe_bag_drop} />
          <TimeRow label="Enter security by" time={rec.latest_safe_security_entry} />
          <TimeRow label="At gate by" time={rec.latest_safe_gate_arrival} />
        </Card>
      )}

      <Button title="Share" variant="secondary" onPress={handleShare} />
    </ScrollView>
  );
}

function TimeRow({ label, time }: { label: string; time?: string }) {
  if (!time) return null;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: themeSpacing[1] }}>
      <Text variant="bodySmall" color={themeColors.ink[600]}>{label}</Text>
      <Text variant="bodySmall" weight="semibold">
        {new Date(time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </Text>
    </View>
  );
}
