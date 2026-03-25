-- Fix: handle_new_user must accept NULL email (anonymous users)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''))
  ON CONFLICT (id) DO UPDATE SET email = COALESCE(EXCLUDED.email, profiles.email);

  INSERT INTO usage (user_id, scan_count, period_start)
  VALUES (NEW.id, 0, date_trunc('month', CURRENT_DATE)::date)
  ON CONFLICT (user_id, period_start) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also allow anonymous users to insert into usage
CREATE POLICY IF NOT EXISTS "Authenticated can insert own usage" ON usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow authenticated (including anonymous) to update own usage
CREATE POLICY IF NOT EXISTS "Authenticated can update own usage" ON usage
  FOR UPDATE USING (auth.uid() = user_id);
