-- ============================================
-- Austin Summer Camp Finder - Database Schema
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE camp_category AS ENUM (
  'academic_stem',
  'arts_music',
  'performing_arts',
  'sports',
  'nature_outdoor',
  'faith_vbs',
  'overnight',
  'academic_writing',
  'special_needs',
  'specialty',
  'multi_activity'
);

CREATE TYPE camp_region AS ENUM (
  'austin_metro',
  'austin_church_vbs',
  'north_suburbs',
  'south_suburbs',
  'hill_country'
);

CREATE TYPE camp_type AS ENUM (
  'day',
  'overnight',
  'both'
);

CREATE TYPE schedule_type AS ENUM (
  'full_day',
  'half_day_am',
  'half_day_pm',
  'flexible'
);

CREATE TYPE registration_status AS ENUM (
  'open',
  'opens_soon',
  'closed',
  'waitlist',
  'unknown'
);

CREATE TYPE alert_status AS ENUM (
  'pending',
  'sent',
  'clicked'
);

-- ============================================
-- CAMPS TABLE
-- ============================================

CREATE TABLE camps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category camp_category NOT NULL,
  description TEXT,
  ages_min INTEGER NOT NULL DEFAULT 4,
  ages_max INTEGER NOT NULL DEFAULT 17,
  duration TEXT, -- e.g., "1 week", "2 weeks", "full summer"
  days_of_week TEXT[], -- e.g., ['Mon','Tue','Wed','Thu','Fri']
  location_name TEXT,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'TX',
  zip TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  price_min NUMERIC(8,2) DEFAULT 0,
  price_max NUMERIC(8,2),
  price_note TEXT, -- e.g., "per week", "per session", "sliding scale"
  camp_type camp_type NOT NULL DEFAULT 'day',
  schedule_type schedule_type NOT NULL DEFAULT 'full_day',
  region camp_region NOT NULL,
  website TEXT,
  phone TEXT,
  email TEXT,
  registration_url TEXT,
  registration_status registration_status DEFAULT 'unknown',
  registration_opens_date DATE,
  fills_fast BOOLEAN DEFAULT FALSE,
  notes TEXT,
  tags TEXT[], -- additional searchable tags
  logo_url TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAMP SESSIONS TABLE
-- Each weekly session as a separate row
-- ============================================

CREATE TABLE camp_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  session_name TEXT, -- e.g., "Week 1", "Session A"
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_of_week TEXT[], -- override camp-level days if different
  start_time TIME,
  end_time TIME,
  price NUMERIC(8,2),
  spots_total INTEGER,
  spots_remaining INTEGER,
  is_sold_out BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USERS TABLE (Parents)
-- Extends Supabase auth.users
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT DEFAULT 'TX',
  zip TEXT,
  stripe_customer_id TEXT,
  notification_preferences JSONB DEFAULT '{"email_alerts": true, "sms_alerts": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHILDREN TABLE
-- ============================================

CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  date_of_birth DATE NOT NULL,
  age_computed INTEGER GENERATED ALWAYS AS (
    EXTRACT(YEAR FROM AGE(date_of_birth))::INTEGER
  ) STORED,
  allergies TEXT,
  medical_notes TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  tshirt_size TEXT,
  swim_ability TEXT, -- 'none', 'beginner', 'intermediate', 'advanced'
  interests TEXT[], -- e.g., ['STEM', 'Sports', 'Art']
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SAVED CALENDARS TABLE
-- A user's planned summer schedule
-- ============================================

CREATE TABLE saved_calendars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  name TEXT DEFAULT 'My Summer Plan',
  year INTEGER NOT NULL DEFAULT 2026,
  is_active BOOLEAN DEFAULT TRUE,
  share_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  total_cost NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CALENDAR ENTRIES TABLE
-- Individual camps on a calendar
-- ============================================

CREATE TABLE calendar_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calendar_id UUID NOT NULL REFERENCES saved_calendars(id) ON DELETE CASCADE,
  camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  session_id UUID REFERENCES camp_sessions(id) ON DELETE SET NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  position INTEGER DEFAULT 0, -- for ordering within a week
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REGISTRATION ALERTS TABLE
-- ============================================

CREATE TABLE registration_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status alert_status DEFAULT 'pending',
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EMAIL SUBSCRIBERS TABLE
-- For Beehiiv sync
-- ============================================

CREATE TABLE email_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'website', -- 'modal', 'giveaway', 'checklist', 'alert'
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  synced_to_beehiiv BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMPTZ,
  unsubscribed BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- SAVED CAMPS (Favorites)
-- ============================================

CREATE TABLE saved_camps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  camp_id UUID NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, camp_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_camps_category ON camps(category);
CREATE INDEX idx_camps_region ON camps(region);
CREATE INDEX idx_camps_city ON camps(city);
CREATE INDEX idx_camps_ages ON camps(ages_min, ages_max);
CREATE INDEX idx_camps_price ON camps(price_min, price_max);
CREATE INDEX idx_camps_type ON camps(camp_type);
CREATE INDEX idx_camps_slug ON camps(slug);
CREATE INDEX idx_camps_active ON camps(is_active);
CREATE INDEX idx_camps_tags ON camps USING GIN(tags);

CREATE INDEX idx_sessions_camp ON camp_sessions(camp_id);
CREATE INDEX idx_sessions_dates ON camp_sessions(start_date, end_date);
CREATE INDEX idx_sessions_sold_out ON camp_sessions(is_sold_out);

CREATE INDEX idx_children_user ON children(user_id);
CREATE INDEX idx_calendars_user ON saved_calendars(user_id);
CREATE INDEX idx_calendars_share ON saved_calendars(share_token);
CREATE INDEX idx_calendar_entries_calendar ON calendar_entries(calendar_id);
CREATE INDEX idx_calendar_entries_camp ON calendar_entries(camp_id);
CREATE INDEX idx_calendar_entries_dates ON calendar_entries(week_start, week_end);

CREATE INDEX idx_alerts_email ON registration_alerts(email);
CREATE INDEX idx_alerts_camp ON registration_alerts(camp_id);
CREATE INDEX idx_alerts_status ON registration_alerts(status);

CREATE INDEX idx_subscribers_email ON email_subscribers(email);
CREATE INDEX idx_subscribers_synced ON email_subscribers(synced_to_beehiiv);

CREATE INDEX idx_saved_camps_user ON saved_camps(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_camps ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_alerts ENABLE ROW LEVEL SECURITY;

-- Camps are publicly readable
ALTER TABLE camps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Camps are publicly readable" ON camps
  FOR SELECT USING (true);

ALTER TABLE camp_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Camp sessions are publicly readable" ON camp_sessions
  FOR SELECT USING (true);

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Children belong to their parent
CREATE POLICY "Users can view own children" ON children
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own children" ON children
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own children" ON children
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own children" ON children
  FOR DELETE USING (auth.uid() = user_id);

-- Calendars belong to their user (or shareable via token)
CREATE POLICY "Users can view own calendars" ON saved_calendars
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own calendars" ON saved_calendars
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own calendars" ON saved_calendars
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own calendars" ON saved_calendars
  FOR DELETE USING (auth.uid() = user_id);

-- Calendar entries
CREATE POLICY "Users can manage own calendar entries" ON calendar_entries
  FOR ALL USING (
    calendar_id IN (SELECT id FROM saved_calendars WHERE user_id = auth.uid())
  );

-- Saved camps
CREATE POLICY "Users can manage own saved camps" ON saved_camps
  FOR ALL USING (auth.uid() = user_id);

-- Registration alerts - anyone can create (email-based), users can view own
CREATE POLICY "Anyone can create alerts" ON registration_alerts
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own alerts" ON registration_alerts
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Email subscribers - public insert
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON email_subscribers
  FOR INSERT WITH CHECK (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER camps_updated_at
  BEFORE UPDATE ON camps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER calendars_updated_at
  BEFORE UPDATE ON saved_calendars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate camp slug from name
CREATE OR REPLACE FUNCTION generate_camp_slug(camp_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(camp_name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Function to check calendar conflicts
CREATE OR REPLACE FUNCTION check_calendar_conflict(
  p_calendar_id UUID,
  p_week_start DATE,
  p_week_end DATE,
  p_exclude_entry_id UUID DEFAULT NULL
)
RETURNS TABLE(conflicting_camp_name TEXT, conflict_start DATE, conflict_end DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT c.name, ce.week_start, ce.week_end
  FROM calendar_entries ce
  JOIN camps c ON c.id = ce.camp_id
  WHERE ce.calendar_id = p_calendar_id
    AND (p_exclude_entry_id IS NULL OR ce.id != p_exclude_entry_id)
    AND ce.week_start < p_week_end
    AND ce.week_end > p_week_start;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate calendar total cost
CREATE OR REPLACE FUNCTION recalculate_calendar_cost(p_calendar_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  total NUMERIC(10,2);
BEGIN
  SELECT COALESCE(SUM(
    COALESCE(cs.price, c.price_min, 0)
  ), 0)
  INTO total
  FROM calendar_entries ce
  JOIN camps c ON c.id = ce.camp_id
  LEFT JOIN camp_sessions cs ON cs.id = ce.session_id
  WHERE ce.calendar_id = p_calendar_id;

  UPDATE saved_calendars SET total_cost = total WHERE id = p_calendar_id;
  RETURN total;
END;
$$ LANGUAGE plpgsql;
