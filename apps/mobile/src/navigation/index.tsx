import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { themeColors } from '@boarding/ui-native';

import { HomeScreen } from '../screens/HomeScreen';
import { TripsScreen } from '../screens/TripsScreen';
import { CirclesScreen } from '../screens/CirclesScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TripNewScreen } from '../screens/TripNewScreen';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import { CircleDetailScreen } from '../screens/CircleDetailScreen';
import { AirportScreen } from '../screens/AirportScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { BoardingPassScreen } from '../screens/BoardingPassScreen';
import { LoginScreen } from '../screens/LoginScreen';

// ─── Param types ─────────────────────────────────────────────────────

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  TripNew: undefined;
  TripDetail: { id: string };
  CircleDetail: { id: string };
  Airport: { iata: string };
  Settings: undefined;
  BoardingPass: undefined;
};

export type TabParamList = {
  Home: undefined;
  Trips: undefined;
  Circles: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ─── Tab Navigator ───────────────────────────────────────────────────

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeColors.brand[600],
        tabBarInactiveTintColor: themeColors.ink[400],
        tabBarStyle: {
          borderTopColor: themeColors.ink[100],
          backgroundColor: themeColors.surface.primary,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Trips" component={TripsScreen} options={{ tabBarLabel: 'Trips' }} />
      <Tab.Screen name="Circles" component={CirclesScreen} options={{ tabBarLabel: 'Circles' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

// ─── Root Stack ──────────────────────────────────────────────────────

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: themeColors.surface.primary },
          headerTintColor: themeColors.ink[900],
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: themeColors.surface.secondary },
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="TripNew" component={TripNewScreen} options={{ title: 'New Trip' }} />
        <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: 'Trip' }} />
        <Stack.Screen name="CircleDetail" component={CircleDetailScreen} options={{ title: 'Circle' }} />
        <Stack.Screen name="Airport" component={AirportScreen} options={{ title: 'Airport' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Stack.Screen name="BoardingPass" component={BoardingPassScreen} options={{ title: 'Scan Boarding Pass' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
