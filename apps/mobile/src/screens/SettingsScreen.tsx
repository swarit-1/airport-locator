import React, { useState } from 'react';
import { View, ScrollView, Switch, Linking } from 'react-native';
import { Text, Card, Divider, themeColors, themeSpacing } from '@boarding/ui-native';

export function SettingsScreen() {
  const [prefs, setPrefs] = useState({
    leaveTimeAlert: true,
    flightDelayAlert: true,
    gateChangeAlert: true,
    boardingAlert: true,
    checkinReminder: true,
    securityUpdate: false,
    circleMatch: true,
    circleMemberJoined: true,
    marketingEmails: false,
  });

  function toggle(key: keyof typeof prefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: themeColors.surface.secondary }}
      contentContainerStyle={{ padding: themeSpacing[4], gap: themeSpacing[4] }}
    >
      {/* Notification Preferences */}
      <Card elevation="raised">
        <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>Push Notifications</Text>

        <SettingRow label="Leave time alert" description="When it's time to head to the airport" value={prefs.leaveTimeAlert} onToggle={() => toggle('leaveTimeAlert')} />
        <SettingRow label="Flight delay" description="When your flight is delayed" value={prefs.flightDelayAlert} onToggle={() => toggle('flightDelayAlert')} />
        <SettingRow label="Gate change" description="When your gate changes" value={prefs.gateChangeAlert} onToggle={() => toggle('gateChangeAlert')} />
        <SettingRow label="Boarding started" description="When boarding begins" value={prefs.boardingAlert} onToggle={() => toggle('boardingAlert')} />
        <SettingRow label="Check-in reminder" description="24 hours before departure" value={prefs.checkinReminder} onToggle={() => toggle('checkinReminder')} />
        <SettingRow label="Security wait update" description="Significant changes in wait times" value={prefs.securityUpdate} onToggle={() => toggle('securityUpdate')} />
      </Card>

      <Card elevation="raised">
        <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>Circle Notifications</Text>

        <SettingRow label="Circle match found" description="When a compatible circle is found" value={prefs.circleMatch} onToggle={() => toggle('circleMatch')} />
        <SettingRow label="Member joined" description="When someone joins your circle" value={prefs.circleMemberJoined} onToggle={() => toggle('circleMemberJoined')} />
      </Card>

      <Card elevation="raised">
        <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>Privacy</Text>

        <SettingRow label="Marketing emails" description="Product updates and tips" value={prefs.marketingEmails} onToggle={() => toggle('marketingEmails')} />

        <Divider />
        <Text variant="caption" color={themeColors.ink[400]}>
          Boarding stores your data locally on device. Trip data is only synced to the server when you explicitly share or join circles.
        </Text>
      </Card>

      <Card elevation="raised">
        <Text variant="h3" style={{ marginBottom: themeSpacing[3] }}>About</Text>
        <Text variant="bodySmall" color={themeColors.ink[500]}>Boarding v1.0.0</Text>
        <Text variant="bodySmall" color={themeColors.ink[500]}>Never miss a flight again.</Text>
      </Card>
    </ScrollView>
  );
}

function SettingRow({ label, description, value, onToggle }: { label: string; description: string; value: boolean; onToggle: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: themeSpacing[2] }}>
      <View style={{ flex: 1, marginRight: themeSpacing[3] }}>
        <Text variant="body" weight="medium">{label}</Text>
        <Text variant="caption" color={themeColors.ink[400]}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onToggle} trackColor={{ true: themeColors.brand[500] }} />
    </View>
  );
}
