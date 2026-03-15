# Mobile Roadmap

## Strategy
Build an Expo/React Native iOS app that shares domain logic, types, and design tokens with the web app.

## Shared Packages

The following packages are platform-agnostic and can be consumed directly:

| Package | What it provides | iOS usage |
|---------|-----------------|-----------|
| `@boarding/domain` | Zod schemas, TypeScript types | Import directly |
| `@boarding/tokens` | Colors, spacing, radii, motion values | Map to React Native StyleSheet |
| `@boarding/providers` | Provider interfaces and mocks | Import directly |
| `@boarding/config` | Feature flags, env config | Adapt for mobile env |

## What Needs Native Implementation

| Web | iOS Equivalent |
|-----|---------------|
| Tailwind CSS | React Native StyleSheet + tokens |
| Framer Motion | React Native Reanimated |
| Next.js routing | React Navigation |
| Supabase SSR client | Supabase React Native client |
| HTML forms | React Native TextInput |

## Recommended Setup

```
apps/
  web/          ← existing
  ios/          ← new Expo app
packages/
  tokens/       ← shared
  domain/       ← shared
  providers/    ← shared
  config/       ← shared
  ui/           ← web-only (create ui-native for RN)
  ui-native/    ← new: React Native components using tokens
```

## Token Mapping

```typescript
// packages/tokens → React Native
import { colors, spacing } from '@boarding/tokens';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface.primary,
    padding: parseInt(spacing[4]),  // '1rem' → 16
  },
  heading: {
    color: colors.ink[900],
    fontWeight: '700',
  },
});
```

## Steps to Add iOS

1. `npx create-expo-app apps/ios --template tabs`
2. Add workspace dependency on shared packages
3. Create `packages/ui-native` with token-mapped components
4. Implement React Navigation routes matching web flow
5. Use Supabase React Native client for auth
6. Map motion tokens to Reanimated animations
7. Add iOS-specific features (push notifications, haptics)

## API Contracts

The web app uses Server Actions and Route Handlers. For mobile:
- Extract shared API contracts from domain types
- Create a thin REST/RPC layer that both web and mobile can consume
- Or use Supabase client directly from mobile
