-- DocLear Migration v4: Document AI Pivot
-- New columns for health_score, risk_flags, key_facts, page_texts, file storage

-- 1. New columns in documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS raw_text TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS page_texts JSONB;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS page_count INTEGER DEFAULT 1;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_type VARCHAR(20);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS doc_type VARCHAR(50);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS doc_type_label TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS health_score INTEGER;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS health_score_explanation TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS risk_flags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS positive_points JSONB DEFAULT '[]'::jsonb;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS key_facts JSONB DEFAULT '[]'::jsonb;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS suggested_questions JSONB DEFAULT '[]'::jsonb;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS entities JSONB;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS specialist_type VARCHAR(50);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS specialist_recommendation TEXT;

-- 2. Add plan types for Stripe
-- profiles.plan can be: 'free', 'starter', 'pro'
-- Add stripe fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- 3. Update can_scan → can_upload with new limits
CREATE OR REPLACE FUNCTION can_upload(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_total_docs INTEGER;
  v_monthly_docs INTEGER;
  v_is_anon BOOLEAN;
BEGIN
  -- Get user info
  SELECT
    COALESCE((SELECT plan FROM profiles WHERE id = p_user_id), 'free'),
    (raw_app_meta_data->>'provider' = 'anonymous')
  INTO v_plan, v_is_anon
  FROM auth.users WHERE id = p_user_id;

  -- Pro users: unlimited
  IF v_plan = 'pro' THEN RETURN TRUE; END IF;

  -- Starter: 20 docs/month
  IF v_plan = 'starter' THEN
    SELECT COUNT(*) INTO v_monthly_docs FROM documents
    WHERE user_id = p_user_id AND created_at >= date_trunc('month', now());
    RETURN v_monthly_docs < 20;
  END IF;

  -- Free / Anonymous: 2 docs total
  SELECT COUNT(*) INTO v_total_docs FROM documents WHERE user_id = p_user_id;
  RETURN v_total_docs < 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Index for new columns
CREATE INDEX IF NOT EXISTS idx_documents_doc_type ON documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_documents_health_score ON documents(health_score);
