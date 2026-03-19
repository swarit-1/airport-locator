import React, { useState } from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Text, Button, Input, themeColors, themeSpacing } from '@boarding/ui-native';
import * as api from '../services/api';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email.includes('@')) {
      setError('Enter a valid email');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.login(email);
      nav.goBack();
    } catch (e: any) {
      setError(e.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: themeColors.surface.primary }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: themeSpacing[6], paddingTop: insets.top }}>
        <Text variant="overline" color={themeColors.brand[600]} weight="bold" style={{ marginBottom: themeSpacing[2] }}>
          BOARDING
        </Text>
        <Text variant="h1" style={{ marginBottom: themeSpacing[1] }}>
          Sign in
        </Text>
        <Text variant="bodySmall" color={themeColors.ink[500]} style={{ marginBottom: themeSpacing[6] }}>
          Enter your email to get started. No password needed in demo mode.
        </Text>

        <Input
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          error={error}
        />

        <View style={{ marginTop: themeSpacing[4], gap: themeSpacing[3] }}>
          <Button title="Continue" loading={loading} onPress={handleLogin} />
          <Button title="Skip for now" variant="ghost" onPress={() => nav.goBack()} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
