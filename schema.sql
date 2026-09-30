-- Volunteer Connect Complete PostgreSQL Schema for Supabase

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-applying (in correct dependency order)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS event_applications CASCADE;
DROP TABLE IF EXISTS ngo_events CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. PROFILES TABLE
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('volunteer', 'admin', 'ngo', 'sponsor')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  phone TEXT,
  bio TEXT,
  skills TEXT,
  availability TEXT,
  website TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. NGO EVENTS TABLE
CREATE TABLE ngo_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ngo_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  required_skills TEXT NOT NULL,
  volunteer_limit INTEGER NOT NULL DEFAULT 1,
  funding_goal NUMERIC NOT NULL DEFAULT 0,
  accumulated_funds NUMERIC NOT NULL DEFAULT 0,
  funding_active BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. EVENT APPLICATIONS TABLE
CREATE TABLE event_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES ngo_events(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'selected', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_event_volunteer UNIQUE (event_id, volunteer_id)
);

-- 6. DONATIONS TABLE
CREATE TABLE donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES ngo_events(id) ON DELETE CASCADE,
  sponsor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. MESSAGES TABLE
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES ngo_events(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);
CREATE INDEX idx_ngo_events_ngo_id ON ngo_events(ngo_id);
CREATE INDEX idx_ngo_events_funding_active ON ngo_events(funding_active);
CREATE INDEX idx_event_applications_event_id ON event_applications(event_id);
CREATE INDEX idx_event_applications_volunteer_id ON event_applications(volunteer_id);
CREATE INDEX idx_donations_event_id ON donations(event_id);
CREATE INDEX idx_donations_sponsor_id ON donations(sponsor_id);
CREATE INDEX idx_messages_event_id ON messages(event_id);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);

-- 9. AUTOMATIC TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_ngo_events_updated_at BEFORE UPDATE ON ngo_events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_event_applications_updated_at BEFORE UPDATE ON event_applications FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 10. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ngo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin' AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS POLICIES FOR PROFILES
CREATE POLICY "Allow public select for authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update own profile or admin to update any"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR is_admin());

-- RLS POLICIES FOR NGO EVENTS
CREATE POLICY "Allow authenticated users to view active/all events"
  ON ngo_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow NGOs to insert events"
  ON ngo_events FOR INSERT
  TO authenticated
  WITH CHECK (
    ngo_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ngo' AND status = 'approved')
  );

CREATE POLICY "Allow NGOs to update own events or admin to update any"
  ON ngo_events FOR UPDATE
  TO authenticated
  USING (ngo_id = auth.uid() OR is_admin());

CREATE POLICY "Allow NGOs to delete own events or admin to delete any"
  ON ngo_events FOR DELETE
  TO authenticated
  USING (ngo_id = auth.uid() OR is_admin());

-- RLS POLICIES FOR EVENT APPLICATIONS
CREATE POLICY "Allow authenticated users to view applications"
  ON event_applications FOR SELECT
  TO authenticated
  USING (
    volunteer_id = auth.uid()
    OR is_admin()
    OR EXISTS (SELECT 1 FROM ngo_events WHERE id = event_applications.event_id AND ngo_id = auth.uid())
  );

CREATE POLICY "Allow Volunteers to insert applications"
  ON event_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    volunteer_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'volunteer' AND status = 'approved')
  );

CREATE POLICY "Allow NGOs or Admin to update application status"
  ON event_applications FOR UPDATE
  TO authenticated
  USING (
    is_admin() OR
    EXISTS (SELECT 1 FROM ngo_events WHERE id = event_applications.event_id AND ngo_id = auth.uid())
  );

-- RLS POLICIES FOR DONATIONS
CREATE POLICY "Allow authenticated users to view donations"
  ON donations FOR SELECT
  TO authenticated
  USING (
    sponsor_id = auth.uid()
    OR is_admin()
    OR EXISTS (SELECT 1 FROM ngo_events WHERE id = donations.event_id AND ngo_id = auth.uid())
  );

CREATE POLICY "Allow Sponsors to insert donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (
    sponsor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'sponsor' AND status = 'approved')
  );

-- RLS POLICIES FOR MESSAGES
CREATE POLICY "Allow participants or admin to view messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR receiver_id = auth.uid() OR is_admin()
  );

CREATE POLICY "Allow participants to insert messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
  );

-- 11. ENABLE REALTIME ON MESSAGES
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
