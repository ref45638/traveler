-- ============================================
-- Traveler App: Complete Database Schema
-- ============================================
-- For initial project setup, execute this entire script in Supabase SQL Editor.
-- This creates all tables, enables RLS, and sets up policies.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. TABLES
-- ============================================

-- PROFILES (Users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- TRIPS
CREATE TABLE trips (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  location TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- TRIP DAYS
CREATE TABLE trip_days (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  day_index INTEGER NOT NULL,
  date DATE NOT NULL
);

-- TRIP ITEMS (Itinerary)
CREATE TABLE trip_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  day_id UUID REFERENCES trip_days(id) ON DELETE CASCADE NOT NULL,
  type TEXT,
  title TEXT,
  description TEXT,
  time TEXT,
  location TEXT,
  cost NUMERIC,
  image TEXT,
  completed BOOLEAN DEFAULT false,
  order_index INTEGER
);

-- EXPENSES
CREATE TABLE expenses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payer TEXT,
  date DATE,
  category TEXT,
  note TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PAYERS
CREATE TABLE payers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL
);

-- TRIP SHARES (Sharing relationships)
CREATE TABLE trip_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor')),
  shared_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(trip_id, user_id)
);

-- TRIP INVITES (Invite links)
CREATE TABLE trip_invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor')),
  created_by UUID REFERENCES auth.users NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER DEFAULT NULL,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_invites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. RLS POLICIES
-- ============================================

-- PROFILES
CREATE POLICY "Public profiles are viewable by everyone." ON profiles 
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- TRIPS
CREATE POLICY "Users can view own trips" ON trips 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips" ON trips 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips" ON trips 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips" ON trips 
  FOR DELETE USING (auth.uid() = user_id);

-- TRIP DAYS
CREATE POLICY "Users can view days of own trips" ON trip_days 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_days.trip_id AND trips.user_id = auth.uid())
  );

CREATE POLICY "Users can insert days to own trips" ON trip_days 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_days.trip_id AND trips.user_id = auth.uid())
  );

CREATE POLICY "Users can update days of own trips" ON trip_days 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_days.trip_id AND trips.user_id = auth.uid())
  );

CREATE POLICY "Users can delete days of own trips" ON trip_days 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = trip_days.trip_id AND trips.user_id = auth.uid())
  );

-- TRIP ITEMS
CREATE POLICY "Users can view items of own trips" ON trip_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM trip_days 
      JOIN trips ON trip_days.trip_id = trips.id 
      WHERE trip_days.id = trip_items.day_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items to own trips" ON trip_items 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM trip_days 
      JOIN trips ON trip_days.trip_id = trips.id 
      WHERE trip_days.id = trip_items.day_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items of own trips" ON trip_items 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM trip_days 
      JOIN trips ON trip_days.trip_id = trips.id 
      WHERE trip_days.id = trip_items.day_id AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items of own trips" ON trip_items 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM trip_days 
      JOIN trips ON trip_days.trip_id = trips.id 
      WHERE trip_days.id = trip_items.day_id AND trips.user_id = auth.uid()
    )
  );

-- EXPENSES
CREATE POLICY "Users can view expenses of own trips" ON expenses 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid())
  );

CREATE POLICY "Users can insert expenses to own trips" ON expenses 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid())
  );

CREATE POLICY "Users can update expenses of own trips" ON expenses 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid())
  );

CREATE POLICY "Users can delete expenses of own trips" ON expenses 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid())
  );

-- PAYERS
CREATE POLICY "Users can view payers of own trips" ON payers 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = payers.trip_id AND trips.user_id = auth.uid())
  );

CREATE POLICY "Users can insert payers to own trips" ON payers 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = payers.trip_id AND trips.user_id = auth.uid())
  );

CREATE POLICY "Users can update payers of own trips" ON payers 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = payers.trip_id AND trips.user_id = auth.uid())
  );

CREATE POLICY "Users can delete payers of own trips" ON payers 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM trips WHERE trips.id = payers.trip_id AND trips.user_id = auth.uid())
  );

-- TRIP SHARES
CREATE POLICY "Users can view own shares" ON trip_shares 
  FOR SELECT USING (user_id = auth.uid() OR shared_by = auth.uid());

CREATE POLICY "Users can create shares for own trips" ON trip_shares 
  FOR INSERT WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete shares for own trips" ON trip_shares 
  FOR DELETE USING (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

-- TRIP INVITES
CREATE POLICY "Users can view own invites" ON trip_invites 
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create invites for own trips" ON trip_invites 
  FOR INSERT WITH CHECK (
    trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own invites" ON trip_invites 
  FOR DELETE USING (created_by = auth.uid());

CREATE POLICY "Users can update own invites" ON trip_invites 
  FOR UPDATE USING (created_by = auth.uid());

-- ============================================
-- 4. INDEXES
-- ============================================

CREATE INDEX idx_trip_shares_trip_id ON trip_shares(trip_id);
CREATE INDEX idx_trip_shares_user_id ON trip_shares(user_id);
CREATE INDEX idx_trip_invites_trip_id ON trip_invites(trip_id);
CREATE INDEX idx_trip_invites_invite_code ON trip_invites(invite_code);

-- ============================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to delete user account
CREATE OR REPLACE FUNCTION delete_user()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- ============================================
-- Setup Complete!
-- ============================================
