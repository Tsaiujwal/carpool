-- ============================================================
-- CorpPool — Supabase Database Schema
-- Run this entire file in: Supabase Console → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Companies ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS companies (
  id          uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  name        text    NOT NULL UNIQUE,
  created_at  timestamp DEFAULT now()
);

-- ── Users (employees + admins) ────────────────────────────────
-- NOTE: Supabase Auth handles password hashing.
-- We store extra profile data here, linked to auth.users by id.
CREATE TABLE IF NOT EXISTS users (
  id           uuid    PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     text    UNIQUE NOT NULL,
  full_name    text    NOT NULL,
  email        text    UNIQUE NOT NULL,
  phone        text    NOT NULL,
  employee_id  text,
  company_id   uuid    REFERENCES companies(id),
  company_name text,
  role         text    DEFAULT 'employee' CHECK (role IN ('employee', 'admin')),
  total_rides  integer DEFAULT 0,
  co2_saved    numeric DEFAULT 0,
  join_date    date    DEFAULT CURRENT_DATE,
  created_at   timestamp DEFAULT now()
);

-- ── Routes ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS routes (
  id              text PRIMARY KEY,
  company_id      uuid REFERENCES companies(id),
  name            text NOT NULL,
  from_location   text NOT NULL,
  to_location     text NOT NULL,
  distance        numeric,
  duration        integer,
  active_rides    integer DEFAULT 0,
  total_rides     integer DEFAULT 0
);

-- ── Rides ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rides (
  id           text PRIMARY KEY,
  company_id   uuid REFERENCES companies(id),
  date         date,
  time         text,
  driver_id    text,
  driver_name  text,
  passengers   text[]  DEFAULT '{}',
  route_id     text    REFERENCES routes(id),
  route_name   text,
  status       text    DEFAULT 'scheduled' CHECK (status IN ('active','scheduled','completed','cancelled')),
  distance     numeric,
  seats        integer,
  created_at   timestamp DEFAULT now()
);

-- ── Row Level Security ────────────────────────────────────────
-- Users can only read/write their own company's data

ALTER TABLE users  ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides  ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- Users can read and update their own profile
CREATE POLICY "users_own_profile" ON users
  FOR ALL USING (auth.uid() = id);

-- Users can read their company
CREATE POLICY "read_own_company" ON companies
  FOR SELECT USING (
    id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Users can read rides in their company
CREATE POLICY "read_company_rides" ON rides
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Users can read routes in their company
CREATE POLICY "read_company_routes" ON routes
  FOR SELECT USING (
    company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- ── Helper function: get username from email ──────────────────
CREATE OR REPLACE FUNCTION get_email_by_username(uname text)
RETURNS text AS $$
  SELECT email FROM users WHERE username = uname LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ── Helper function: get phone by email ───────────────────────
CREATE OR REPLACE FUNCTION get_phone_by_email(user_email text)
RETURNS text AS $$
  SELECT phone FROM users WHERE email = user_email LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ── Done! ─────────────────────────────────────────────────────
-- Now go to Supabase → Project Settings → API
-- and copy your Project URL and anon public key into js/supabase.js
