import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Alert, StyleSheet, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Button, Card, Divider, themeColors, themeSpacing, themeRadii } from '@boarding/ui-native';
import type { RootStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// ─── Types ───────────────────────────────────────────────────────────

interface Profile {
  display_name: string;
  email: string;
  has_tsa_precheck: boolean;
  has_clear: boolean;
  default_risk_profile: 'conservative' | 'balanced' | 'aggressive';
  default_ride_mode: 'drive' | 'rideshare' | 'dropoff' | 'transit';
  notifications: {
    leave_reminder: boolean;
    departure_countdown: boolean;
    delays: boolean;
    gate_changes: boolean;
    cancellations: boolean;
    security_wait: boolean;
    boarding_time: boolean;
    match_found: boolean;
    circle_chat: boolean;
  };
}

const DEFAULT_PROFILE: Profile = {
  display_name: 'Traveler',
  email: 'traveler@example.com',
  has_tsa_precheck: false,
  has_clear: false,
  default_risk_profile: 'balanced',
  default_ride_mode: 'rideshare',
  notifications: {
    leave_reminder: true,
    departure_countdown: true,
    delays: true,
    gate_changes: true,
    cancellations: true,
    security_wait: false,
    boarding_time: true,
    match_found: true,
    circle_chat: true,
  },
};

// ─── Constants ───────────────────────────────────────────────────────

const BG = '#FAF8F5';
const NAVY = '#1E3A6E';
const INK_PRIMARY = '#1A1A2E';
const INK_SECONDARY = '#6B6B80';
const INK_MUTED = '#9A9AB0';
const BORDER = '#EDEDF4';
const BRAND = themeColors.brand[500];

const RISK_OPTIONS: { value: Profile['default_risk_profile']; label: string }[] = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'aggressive', label: 'Aggressive' },
];

const MODE_OPTIONS: { value: Profile['default_ride_mode']; label: string }[] = [
  { value: 'drive', label: 'Drive' },
  { value: 'rideshare', label: 'Rideshare' },
  { value: 'dropoff', label: 'Drop-off' },
  { value: 'transit', label: 'Transit' },
];

// ─── Component ───────────────────────────────────────────────────────

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('profile');
      if (raw) {
        const parsed = JSON.parse(raw);
        setProfile({ ...DEFAULT_PROFILE, ...parsed, notifications: { ...DEFAULT_PROFILE.notifications, ...(parsed.notifications ?? {}) } });
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  // Persist on every change
  const updateProfile = useCallback(async (next: Profile) => {
    setProfile(next);
    try {
      await AsyncStorage.setItem('profile', JSON.stringify(next));
    } catch {
      // silent
    }
  }, []);

  const toggleNotification = (key: keyof Profile['notifications']) => {
    updateProfile({
      ...profile,
      notifications: { ...profile.notifications, [key]: !profile.notifications[key] },
    });
  };

  const initials = (profile.display_name || 'T')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  async function handleClearTrips() {
    Alert.alert(
      'Clear All Trips',
      'This will permanently delete all your trip data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('activeTrip');
            await AsyncStorage.removeItem('trips');
          },
        },
      ],
    );
  }

  async function handleSignOut() {
    await AsyncStorage.removeItem('profile');
    await AsyncStorage.removeItem('activeTrip');
    await AsyncStorage.removeItem('trips');
    setProfile(DEFAULT_PROFILE);
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text variant="bodySmall" color={INK_MUTED}>Loading...</Text>
      </View>
    );
  }

  // ─── Pill selector ───────────────────────────────────────────────

  function PillRow<T extends string>({
    options,
    selected,
    onSelect,
  }: {
    options: { value: T; label: string }[];
    selected: T;
    onSelect: (v: T) => void;
  }) {
    return (
      <View style={styles.pillRow}>
        {options.map((opt) => {
          const active = opt.value === selected;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              style={[
                styles.pill,
                active ? styles.pillActive : styles.pillInactive,
              ]}
              hitSlop={4}
            >
              <Text
                variant="caption"
                style={{
                  color: active ? '#FFF' : INK_SECONDARY,
                  fontWeight: active ? '700' : '500',
                  fontSize: 13,
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // ─── Toggle row ──────────────────────────────────────────────────

  function ToggleRow({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
    return (
      <View style={styles.toggleRow}>
        <Text variant="body" color={INK_PRIMARY} style={{ flex: 1 }}>{label}</Text>
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E0E0E8', true: BRAND }}
          thumbColor="#FFF"
          ios_backgroundColor="#E0E0E8"
        />
      </View>
    );
  }

  // ─── Notification group header ───────────────────────────────────

  function GroupHeader({ label }: { label: string }) {
    return (
      <Text variant="caption" color={INK_MUTED} style={styles.groupHeader}>
        {label}
      </Text>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: insets.bottom + 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Avatar + identity ─────────────────────────────────────── */}
      <View style={styles.identitySection}>
        <View style={styles.avatar}>
          <Text variant="h2" style={{ color: '#FFF', fontSize: 22 }}>{initials}</Text>
        </View>
        <Text variant="h2" color={INK_PRIMARY} style={{ marginTop: 12 }}>
          {profile.display_name}
        </Text>
        <Text variant="bodySmall" color={INK_SECONDARY} style={{ marginTop: 2 }}>
          {profile.email}
        </Text>
      </View>

      {/* ── Travel Preferences ────────────────────────────────────── */}
      <Text variant="caption" color={INK_MUTED} style={styles.sectionLabel}>
        TRAVEL PREFERENCES
      </Text>
      <Card elevation="raised" style={styles.sectionCard}>
        <ToggleRow
          label="TSA PreCheck"
          value={profile.has_tsa_precheck}
          onToggle={() => updateProfile({ ...profile, has_tsa_precheck: !profile.has_tsa_precheck })}
        />
        <View style={styles.separator} />
        <ToggleRow
          label="CLEAR"
          value={profile.has_clear}
          onToggle={() => updateProfile({ ...profile, has_clear: !profile.has_clear })}
        />
        <View style={styles.separator} />

        <Text variant="bodySmall" color={INK_SECONDARY} style={{ marginTop: 4, marginBottom: 8 }}>
          Risk profile
        </Text>
        <PillRow
          options={RISK_OPTIONS}
          selected={profile.default_risk_profile}
          onSelect={(v) => updateProfile({ ...profile, default_risk_profile: v })}
        />

        <Text variant="bodySmall" color={INK_SECONDARY} style={{ marginTop: 16, marginBottom: 8 }}>
          Preferred travel mode
        </Text>
        <PillRow
          options={MODE_OPTIONS}
          selected={profile.default_ride_mode}
          onSelect={(v) => updateProfile({ ...profile, default_ride_mode: v })}
        />
      </Card>

      {/* ── Notification Settings ─────────────────────────────────── */}
      <Text variant="caption" color={INK_MUTED} style={styles.sectionLabel}>
        NOTIFICATIONS
      </Text>
      <Card elevation="raised" style={styles.sectionCard}>
        <GroupHeader label="Departure Alerts" />
        <ToggleRow label="Leave time reminder" value={profile.notifications.leave_reminder} onToggle={() => toggleNotification('leave_reminder')} />
        <View style={styles.separator} />
        <ToggleRow label="Departure countdown" value={profile.notifications.departure_countdown} onToggle={() => toggleNotification('departure_countdown')} />

        <View style={styles.groupDivider} />

        <GroupHeader label="Flight Updates" />
        <ToggleRow label="Delays" value={profile.notifications.delays} onToggle={() => toggleNotification('delays')} />
        <View style={styles.separator} />
        <ToggleRow label="Gate changes" value={profile.notifications.gate_changes} onToggle={() => toggleNotification('gate_changes')} />
        <View style={styles.separator} />
        <ToggleRow label="Cancellations" value={profile.notifications.cancellations} onToggle={() => toggleNotification('cancellations')} />

        <View style={styles.groupDivider} />

        <GroupHeader label="At Airport" />
        <ToggleRow label="Security wait times" value={profile.notifications.security_wait} onToggle={() => toggleNotification('security_wait')} />
        <View style={styles.separator} />
        <ToggleRow label="Boarding time" value={profile.notifications.boarding_time} onToggle={() => toggleNotification('boarding_time')} />

        <View style={styles.groupDivider} />

        <GroupHeader label="Ride Circles" />
        <ToggleRow label="Match found" value={profile.notifications.match_found} onToggle={() => toggleNotification('match_found')} />
        <View style={styles.separator} />
        <ToggleRow label="Circle chat" value={profile.notifications.circle_chat} onToggle={() => toggleNotification('circle_chat')} />
      </Card>

      {/* ── Data ──────────────────────────────────────────────────── */}
      <Text variant="caption" color={INK_MUTED} style={styles.sectionLabel}>
        DATA
      </Text>
      <Card elevation="raised" style={styles.sectionCard}>
        <Pressable
          onPress={handleClearTrips}
          style={({ pressed }) => [styles.destructiveRow, pressed && { opacity: 0.7 }]}
        >
          <Text variant="body" style={{ color: '#E8655A' }}>Clear all trips</Text>
        </Pressable>
      </Card>

      {/* ── Sign out ──────────────────────────────────────────────── */}
      <Pressable
        onPress={handleSignOut}
        style={({ pressed }) => [styles.signOutButton, pressed && { opacity: 0.6 }]}
      >
        <Text variant="body" color={INK_MUTED}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  identitySection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: NAVY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#EDEDF4',
  },
  groupHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
    marginTop: 4,
  },
  groupDivider: {
    height: 1,
    backgroundColor: '#EDEDF4',
    marginVertical: 12,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: BRAND,
  },
  pillInactive: {
    backgroundColor: '#F0EDE8',
  },
  destructiveRow: {
    minHeight: 44,
    justifyContent: 'center',
  },
  signOutButton: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});
