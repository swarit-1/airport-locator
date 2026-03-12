export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
  features: {
    phoneVerification: process.env.NEXT_PUBLIC_FEATURE_PHONE_VERIFICATION === 'true',
    idVerification: false,
    liveTraffic: process.env.FEATURE_LIVE_TRAFFIC === 'true',
    liveFlight: process.env.FEATURE_LIVE_FLIGHT === 'true',
    liveWaitTimes: process.env.FEATURE_LIVE_WAIT_TIMES === 'true',
    myTsa: process.env.FEATURE_MY_TSA === 'true',
  },
  providers: {
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
    flightAwareApiKey: process.env.FLIGHTAWARE_API_KEY ?? '',
  },
  app: {
    name: 'GateShare',
    tagline: "Let's move",
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  },
} as const;
