-- Migration v9: Add consent tracking columns (GDPR Art. 7)
-- E3: Store consent in DB, not just localStorage

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_consent_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS analytics_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS analytics_consent_at TIMESTAMPTZ;
