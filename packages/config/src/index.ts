export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    enabled: process.env.NEXT_PUBLIC_USE_SUPABASE === 'true',
  },
  features: {
    phoneVerification: process.env.NEXT_PUBLIC_FEATURE_PHONE_VERIFICATION === 'true',
    idVerification: false,
    liveTraffic: process.env.FEATURE_LIVE_TRAFFIC === 'true',
    liveFlight: process.env.FEATURE_LIVE_FLIGHT === 'true',
    liveWaitTimes: process.env.FEATURE_LIVE_WAIT_TIMES === 'true',
    myTsa: process.env.FEATURE_MY_TSA === 'true',
    autoCheckIn: process.env.FEATURE_AUTO_CHECKIN === 'true',
    boardingPassScan: process.env.FEATURE_BOARDING_PASS_SCAN === 'true',
    walletIntegration: process.env.FEATURE_WALLET_INTEGRATION === 'true',
    airportDining: process.env.FEATURE_AIRPORT_DINING === 'true',
    crowdsourcedWaitTimes: process.env.FEATURE_CROWDSOURCED_WAIT === 'true',
    pushNotifications: process.env.FEATURE_PUSH_NOTIFICATIONS === 'true',
    travelManagement: process.env.FEATURE_TRAVEL_MANAGEMENT === 'true',
  },
  providers: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
    flightAwareApiKey: process.env.FLIGHTAWARE_API_KEY ?? '',
    tsaApiKey: process.env.TSA_API_KEY ?? '',
    claudeApiKey: process.env.CLAUDE_API_KEY ?? '',
  },
  app: {
    name: 'Boarding',
    tagline: 'never miss a flight again',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  },
} as const;
