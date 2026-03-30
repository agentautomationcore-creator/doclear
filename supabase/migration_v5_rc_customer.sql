-- DocLear Migration v5: Add rc_customer_id for RevenueCat
-- Required by app/api/revenuecat/webhook/route.ts

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rc_customer_id TEXT;
CREATE INDEX IF NOT EXISTS idx_profiles_rc_customer_id ON profiles(rc_customer_id);
