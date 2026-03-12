-- GateShare Initial Schema
-- Requires PostGIS extension

CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ─────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  completed_trips_count INTEGER DEFAULT 0,
  default_risk_profile TEXT DEFAULT 'balanced' CHECK (default_risk_profile IN ('conservative', 'balanced', 'aggressive')),
  default_ride_mode TEXT DEFAULT 'rideshare' CHECK (default_ride_mode IN ('rideshare', 'friend_dropoff', 'self_drive', 'transit')),
  has_tsa_precheck BOOLEAN DEFAULT FALSE,
  has_clear BOOLEAN DEFAULT FALSE,
  id_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Communities ──────────────────────────────────────────────────────
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('general', 'campus')),
  description TEXT,
  email_domain TEXT,
  location GEOGRAPHY(POINT, 4326),
  logo_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE community_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

-- ─── Saved Locations ──────────────────────────────────────────────────
CREATE TABLE saved_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  address TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Airports ─────────────────────────────────────────────────────────
CREATE TABLE airports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  iata_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  location GEOGRAPHY(POINT, 4326) NOT NULL,
  timezone TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE airport_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airport_id UUID NOT NULL REFERENCES airports(id) ON DELETE CASCADE,
  flight_type TEXT NOT NULL CHECK (flight_type IN ('domestic', 'international')),
  curb_to_bag_drop_minutes INTEGER DEFAULT 10,
  bag_drop_to_security_minutes INTEGER DEFAULT 5,
  security_to_gate_minutes INTEGER DEFAULT 15,
  avg_security_wait_minutes INTEGER DEFAULT 20,
  peak_security_wait_minutes INTEGER DEFAULT 45,
  min_arrival_before_departure INTEGER DEFAULT 60,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(airport_id, flight_type)
);

-- ─── Airlines ─────────────────────────────────────────────────────────
CREATE TABLE airlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  iata_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE airline_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airline_id UUID NOT NULL REFERENCES airlines(id) ON DELETE CASCADE,
  flight_type TEXT NOT NULL CHECK (flight_type IN ('domestic', 'international')),
  bag_drop_cutoff_minutes INTEGER DEFAULT 45,
  boarding_begins_minutes INTEGER DEFAULT 30,
  gate_close_minutes INTEGER DEFAULT 15,
  recommended_checkin_minutes INTEGER DEFAULT 120,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(airline_id, flight_type)
);

-- ─── Trips ────────────────────────────────────────────────────────────
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  airline_id UUID NOT NULL REFERENCES airlines(id),
  flight_number TEXT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TIME NOT NULL,
  airport_id UUID NOT NULL REFERENCES airports(id),
  terminal TEXT,
  gate TEXT,
  flight_type TEXT NOT NULL CHECK (flight_type IN ('domestic', 'international')),
  origin_location GEOGRAPHY(POINT, 4326) NOT NULL,
  origin_label TEXT NOT NULL,
  has_checked_bags BOOLEAN DEFAULT FALSE,
  bag_count INTEGER DEFAULT 0,
  party_size INTEGER DEFAULT 1,
  has_tsa_precheck BOOLEAN DEFAULT FALSE,
  has_clear BOOLEAN DEFAULT FALSE,
  traveling_with_kids BOOLEAN DEFAULT FALSE,
  accessibility_needs BOOLEAN DEFAULT FALSE,
  ride_mode TEXT DEFAULT 'rideshare' CHECK (ride_mode IN ('rideshare', 'friend_dropoff', 'self_drive', 'transit')),
  risk_profile TEXT DEFAULT 'balanced' CHECK (risk_profile IN ('conservative', 'balanced', 'aggressive')),
  community_id UUID REFERENCES communities(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Snapshots ────────────────────────────────────────────────────────
CREATE TABLE flight_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  terminal TEXT,
  gate TEXT,
  delay_minutes INTEGER DEFAULT 0,
  source TEXT NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE traffic_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  duration_in_traffic_minutes INTEGER NOT NULL,
  distance_km REAL NOT NULL,
  source TEXT NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE wait_time_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  airport_id UUID NOT NULL REFERENCES airports(id),
  value_minutes INTEGER NOT NULL,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  freshness_timestamp TIMESTAMPTZ NOT NULL,
  confidence_level TEXT NOT NULL CHECK (confidence_level IN ('high', 'medium', 'low')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Recommendations ──────────────────────────────────────────────────
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  recommended_leave_time TIMESTAMPTZ NOT NULL,
  leave_window_start TIMESTAMPTZ NOT NULL,
  leave_window_end TIMESTAMPTZ NOT NULL,
  recommended_curb_arrival TIMESTAMPTZ NOT NULL,
  latest_safe_bag_drop TIMESTAMPTZ,
  latest_safe_security_entry TIMESTAMPTZ NOT NULL,
  latest_safe_gate_arrival TIMESTAMPTZ NOT NULL,
  confidence TEXT NOT NULL CHECK (confidence IN ('high', 'medium', 'low')),
  confidence_score INTEGER NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '[]',
  total_minutes INTEGER NOT NULL,
  summary TEXT NOT NULL,
  warnings JSONB DEFAULT '[]',
  computed_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Ride Circles ─────────────────────────────────────────────────────
CREATE TABLE ride_circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES profiles(id),
  airport_id UUID NOT NULL REFERENCES airports(id),
  circle_type TEXT NOT NULL CHECK (circle_type IN ('scheduled', 'leaving_now')),
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private', 'community')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'departed', 'expired', 'cancelled')),
  target_leave_time TIMESTAMPTZ NOT NULL,
  leave_window_start TIMESTAMPTZ NOT NULL,
  leave_window_end TIMESTAMPTZ NOT NULL,
  max_members INTEGER DEFAULT 4,
  max_detour_minutes INTEGER DEFAULT 15,
  approximate_origin GEOGRAPHY(POINT, 4326) NOT NULL,
  proximity_radius_km REAL DEFAULT 10,
  community_id UUID REFERENCES communities(id),
  estimated_savings_cents INTEGER DEFAULT 0,
  estimated_extra_minutes INTEGER DEFAULT 0,
  invite_code TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ride_circle_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES ride_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  trip_id UUID REFERENCES trips(id),
  role TEXT NOT NULL CHECK (role IN ('creator', 'member')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'declined', 'left')),
  pickup_mode TEXT DEFAULT 'hidden' CHECK (pickup_mode IN ('exact_address', 'landmark', 'hidden')),
  pickup_location GEOGRAPHY(POINT, 4326),
  pickup_landmark TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(circle_id, user_id)
);

-- ─── Messages ─────────────────────────────────────────────────────────
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES ride_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'system', 'join', 'leave')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Reports ──────────────────────────────────────────────────────────
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  reported_user_id UUID REFERENCES profiles(id),
  circle_id UUID REFERENCES ride_circles(id),
  message_id UUID REFERENCES messages(id),
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'safety', 'other')),
  details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Notification Preferences ─────────────────────────────────────────
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  circle_messages BOOLEAN DEFAULT TRUE,
  circle_joins BOOLEAN DEFAULT TRUE,
  recommendation_updates BOOLEAN DEFAULT TRUE,
  marketing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Admin Overrides ──────────────────────────────────────────────────
CREATE TABLE admin_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  field TEXT NOT NULL,
  value JSONB,
  reason TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Audit Logs ───────────────────────────────────────────────────────
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trips_airport_id ON trips(airport_id);
CREATE INDEX idx_trips_departure_date ON trips(departure_date);
CREATE INDEX idx_ride_circles_airport_id ON ride_circles(airport_id);
CREATE INDEX idx_ride_circles_status ON ride_circles(status);
CREATE INDEX idx_ride_circles_target_leave ON ride_circles(target_leave_time);
CREATE INDEX idx_ride_circle_members_circle ON ride_circle_members(circle_id);
CREATE INDEX idx_ride_circle_members_user ON ride_circle_members(user_id);
CREATE INDEX idx_messages_circle_id ON messages(circle_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_recommendations_trip_id ON recommendations(trip_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Spatial indexes
CREATE INDEX idx_ride_circles_origin ON ride_circles USING GIST(approximate_origin);
CREATE INDEX idx_airports_location ON airports USING GIST(location);

-- ─── RLS Policies ─────────────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own, admins can read all
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profile read for circle members" ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM ride_circle_members rcm
      WHERE rcm.user_id = profiles.id
      AND rcm.circle_id IN (
        SELECT circle_id FROM ride_circle_members WHERE user_id = auth.uid()
      )
    )
  );

-- Trips: users see their own
CREATE POLICY "Users can CRUD own trips" ON trips FOR ALL USING (auth.uid() = user_id);

-- Recommendations: users see their own trip recs
CREATE POLICY "Users can read own recs" ON recommendations FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- Ride circles: public circles are readable by all authed users
CREATE POLICY "Read public circles" ON ride_circles FOR SELECT
  USING (visibility = 'public' AND status = 'open');
CREATE POLICY "Read own circles" ON ride_circles FOR SELECT
  USING (creator_id = auth.uid());
CREATE POLICY "Read joined circles" ON ride_circles FOR SELECT
  USING (id IN (SELECT circle_id FROM ride_circle_members WHERE user_id = auth.uid()));
CREATE POLICY "Create circles" ON ride_circles FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Update own circles" ON ride_circles FOR UPDATE USING (creator_id = auth.uid());

-- Circle members
CREATE POLICY "Read circle members" ON ride_circle_members FOR SELECT
  USING (circle_id IN (SELECT circle_id FROM ride_circle_members WHERE user_id = auth.uid()));
CREATE POLICY "Join circles" ON ride_circle_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Update own membership" ON ride_circle_members FOR UPDATE USING (auth.uid() = user_id);

-- Messages: members of the circle can read/write
CREATE POLICY "Read circle messages" ON messages FOR SELECT
  USING (circle_id IN (SELECT circle_id FROM ride_circle_members WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY "Send messages" ON messages FOR INSERT
  WITH CHECK (circle_id IN (SELECT circle_id FROM ride_circle_members WHERE user_id = auth.uid() AND status = 'active'));

-- Reports: users can create, admins can read
CREATE POLICY "Create reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Read own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- Saved locations: own only
CREATE POLICY "Own saved locations" ON saved_locations FOR ALL USING (auth.uid() = user_id);

-- Notification prefs: own only
CREATE POLICY "Own notification prefs" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

-- Public read for airports, airlines (no RLS needed, but we keep them readable)
-- airports and airlines don't have RLS enabled - they're public reference data

-- ─── Trigger for auto-creating profile on signup ──────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
