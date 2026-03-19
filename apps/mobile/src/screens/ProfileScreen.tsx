import React, { useEffect, useState } from 'react';
import { View, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text, Button, Card, Input, Divider, themeColors, themeSpacing } from '@boarding/ui-native';
import type { RootStackParamList } from '../navigation';
import * as api from '../services/api';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getProfile()
      .then((res) => setProfile(res.profile))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    try {
      await api.updateProfile({
        display_name: profile.display_name,
        phone: profile.phone,
        has_tsa_precheck: profile.has_tsa_precheck,
        has_clear: profile.has_clear,
        default_risk_profile: profile.default_risk_profile,
        default_ride_mode: profile.default_ride_mode,
      });
    } catch {}
    setSaving(false);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.surface.secondary }}>
        <Text variant="bodySmall" color={themeColors.ink[400]}>Loading...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.surface.secondary, paddingHorizontal: themeSpacing[6] }}>
        <Text variant="h2" style={{ marginBottom: themeSpacing[2] }}>Not signed in</Text>
        <Text variant="bodySmall" color={themeColors.ink[500]} align="center" style={{ marginBottom: themeSpacing[4] }}>
          Sign in to save your preferences and trip history.
        </Text>
        <Button title="Sign In" onPress={() => nav.navigate('Login')} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.surface.secondary }}
      contentContainerStyle={{ paddingTop: insets.top + themeSpacing[4], paddingHorizontal: themeSpacing[4], paddingBottom: themeSpacing[8] }}
    >
      <Text variant="h1" style={{ marginBottom: themeSpacing[4] }}>Profile</Text>

      <Card elevation="raised" style={{ marginBottom: themeSpacing[4] }}>
        <Input
          label="Display Name"
          value={profile.display_name ?? ''}
          onChangeText={(v) => setProfile({ ...profile, display_name: v })}
          style={{ marginBottom: themeSpacing[3] }}
        />
        <Input
          label="Email"
          value={profile.email ?? ''}
          editable={false}
          style={{ opacity: 0.6 }}
        />
      </Card>

      <Card elevation="raised" style={{ marginBottom: themeSpacing[4] }}>
        <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>Travel Defaults</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpacing[3] }}>
          <Text variant="body">TSA PreCheck</Text>
          <Switch
            value={profile.has_tsa_precheck}
            onValueChange={(v) => setProfile({ ...profile, has_tsa_precheck: v })}
            trackColor={{ true: themeColors.brand[500] }}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpacing[3] }}>
          <Text variant="body">CLEAR</Text>
          <Switch
            value={profile.has_clear}
            onValueChange={(v) => setProfile({ ...profile, has_clear: v })}
            trackColor={{ true: themeColors.brand[500] }}
          />
        </View>

        <Divider />

        <Input
          label="Phone"
          value={profile.phone ?? ''}
          onChangeText={(v) => setProfile({ ...profile, phone: v })}
          keyboardType="phone-pad"
        />
      </Card>

      <View style={{ gap: themeSpacing[3] }}>
        <Button title={saving ? 'Saving...' : 'Save Changes'} loading={saving} onPress={handleSave} />
        <Button title="Settings" variant="secondary" onPress={() => nav.navigate('Settings')} />
        <Button
          title="Sign Out"
          variant="ghost"
          onPress={async () => {
            await api.logout();
            setProfile(null);
          }}
        />
      </View>
    </ScrollView>
  );
}
