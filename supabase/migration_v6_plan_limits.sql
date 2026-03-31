-- DocLear Migration v6: Plan-based limits for documents and chat questions
-- Free: 3 docs/month, 10 questions/month. Starter: 20 docs/month, unlimited questions. Pro: unlimited.

-- Update can_upload: Free = 3 docs/month (was 2 total)
CREATE OR REPLACE FUNCTION can_upload(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_monthly_docs INTEGER;
BEGIN
  SELECT COALESCE(plan, 'free') INTO v_plan
  FROM profiles WHERE id = p_user_id;

  -- Pro: unlimited
  IF v_plan IN ('pro', 'year', 'lifetime') THEN RETURN TRUE; END IF;

  -- Count docs this month
  SELECT COUNT(*) INTO v_monthly_docs
  FROM documents
  WHERE user_id = p_user_id AND created_at >= date_trunc('month', now());

  -- Starter: 20/month
  IF v_plan = 'starter' THEN RETURN v_monthly_docs < 20; END IF;

  -- Free / Anonymous: 3/month
  RETURN v_monthly_docs < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- New: can_ask_question — chat question limits
CREATE OR REPLACE FUNCTION can_ask_question(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan TEXT;
  v_monthly_questions INTEGER;
BEGIN
  SELECT COALESCE(plan, 'free') INTO v_plan
  FROM profiles WHERE id = p_user_id;

  -- Pro/Starter: unlimited questions
  IF v_plan IN ('pro', 'starter', 'year', 'lifetime') THEN RETURN TRUE; END IF;

  -- Free: 10 questions/month
  SELECT COUNT(*) INTO v_monthly_questions
  FROM chat_messages
  WHERE user_id = p_user_id
    AND role = 'user'
    AND created_at >= date_trunc('month', now());

  RETURN v_monthly_questions < 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
