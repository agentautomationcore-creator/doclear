-- DocLear Migration v2: Usage tracking + Anonymous Auth support
-- Run in Supabase SQL Editor AFTER enabling Anonymous Sign-ins

-- 1. Usage table — tracks scan count per user per month
CREATE TABLE IF NOT EXISTS usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scan_count INTEGER DEFAULT 0,
  period_start DATE DEFAULT date_trunc('month', CURRENT_DATE)::date,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- 2. RLS
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON usage
  FOR SELECT USING (auth.uid() = user_id);

-- Only service role can INSERT/UPDATE (prevents client-side manipulation)
CREATE POLICY "Service role can manage usage" ON usage
  FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to read their own usage
CREATE POLICY "Users can read own usage" ON usage
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Function: get or create usage for current month
CREATE OR REPLACE FUNCTION get_usage(p_user_id UUID)
RETURNS TABLE(scan_count INTEGER, is_anonymous BOOLEAN, period_start DATE) AS $$
DECLARE
  v_period DATE := date_trunc('month', CURRENT_DATE)::date;
  v_is_anon BOOLEAN;
BEGIN
  -- Check if user is anonymous
  SELECT (raw_app_meta_data->>'provider' = 'anonymous') INTO v_is_anon
  FROM auth.users WHERE id = p_user_id;

  -- Get or create usage record for current month
  INSERT INTO usage (user_id, scan_count, period_start)
  VALUES (p_user_id, 0, v_period)
  ON CONFLICT (user_id, period_start) DO NOTHING;

  RETURN QUERY
  SELECT u.scan_count, COALESCE(v_is_anon, false), u.period_start
  FROM usage u
  WHERE u.user_id = p_user_id AND u.period_start = v_period;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function: increment scan count (atomic, prevents race conditions)
CREATE OR REPLACE FUNCTION increment_scan(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_period DATE := date_trunc('month', CURRENT_DATE)::date;
  v_new_count INTEGER;
BEGIN
  INSERT INTO usage (user_id, scan_count, period_start)
  VALUES (p_user_id, 1, v_period)
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET scan_count = usage.scan_count + 1, updated_at = NOW()
  RETURNING scan_count INTO v_new_count;

  RETURN v_new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function: check if user can scan
CREATE OR REPLACE FUNCTION can_scan(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_period DATE := date_trunc('month', CURRENT_DATE)::date;
  v_count INTEGER;
  v_is_anon BOOLEAN;
  v_plan TEXT;
  v_limit INTEGER;
BEGIN
  -- Get user info
  SELECT
    (raw_app_meta_data->>'provider' = 'anonymous'),
    COALESCE((SELECT plan FROM profiles WHERE id = p_user_id), 'free')
  INTO v_is_anon, v_plan
  FROM auth.users WHERE id = p_user_id;

  -- Pro users: unlimited
  IF v_plan = 'pro' THEN RETURN TRUE; END IF;

  -- Get current month scan count
  SELECT COALESCE(u.scan_count, 0) INTO v_count
  FROM usage u
  WHERE u.user_id = p_user_id AND u.period_start = v_period;

  IF v_count IS NULL THEN v_count := 0; END IF;

  -- Set limit based on user type
  IF v_is_anon THEN
    v_limit := 3;  -- Anonymous: 3 scans total
  ELSE
    v_limit := 5;  -- Registered free: 5 scans/month
  END IF;

  RETURN v_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Index
CREATE INDEX IF NOT EXISTS idx_usage_user_period ON usage(user_id, period_start);

-- 7. Update handle_new_user to also create usage record
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO usage (user_id, scan_count, period_start)
  VALUES (NEW.id, 0, date_trunc('month', CURRENT_DATE)::date)
  ON CONFLICT (user_id, period_start) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
