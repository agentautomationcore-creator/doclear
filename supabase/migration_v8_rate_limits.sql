-- Migration v8: Persistent rate limiting via Supabase RPC
-- Replaces in-memory Map() which is useless on Vercel serverless

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (key)
);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits (window_start);

-- RPC function: returns TRUE if request is allowed, FALSE if rate limited
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_max_count INTEGER,
  p_window_seconds INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_entry RECORD;
  v_now TIMESTAMPTZ := now();
BEGIN
  -- Try to get existing entry
  SELECT count, window_start INTO v_entry
  FROM rate_limits
  WHERE key = p_key
  FOR UPDATE;

  IF NOT FOUND THEN
    -- First request: create entry
    INSERT INTO rate_limits (key, count, window_start)
    VALUES (p_key, 1, v_now)
    ON CONFLICT (key) DO UPDATE
      SET count = 1, window_start = v_now;
    RETURN TRUE;
  END IF;

  -- Check if window has expired
  IF v_now > v_entry.window_start + (p_window_seconds || ' seconds')::INTERVAL THEN
    -- Reset window
    UPDATE rate_limits
    SET count = 1, window_start = v_now
    WHERE key = p_key;
    RETURN TRUE;
  END IF;

  -- Within window: check limit
  IF v_entry.count >= p_max_count THEN
    RETURN FALSE;
  END IF;

  -- Increment counter
  UPDATE rate_limits
  SET count = count + 1
  WHERE key = p_key;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup old entries (run periodically via pg_cron or manually)
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < now() - INTERVAL '2 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stripe webhook deduplication table (SEC-6 / STRIPE-6)
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-cleanup old events (keep 7 days)
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed ON stripe_webhook_events (processed_at);

-- MIG-6: Atomic anonymous user migration (transaction)
CREATE OR REPLACE FUNCTION migrate_anonymous_user(
  p_old_user_id UUID,
  p_new_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_docs_count INTEGER;
  v_msgs_count INTEGER;
  v_old_profile RECORD;
  v_new_scan_count INTEGER;
BEGIN
  -- Transfer documents
  UPDATE documents SET user_id = p_new_user_id WHERE user_id = p_old_user_id;
  GET DIAGNOSTICS v_docs_count = ROW_COUNT;

  -- Transfer chat messages
  UPDATE chat_messages SET user_id = p_new_user_id WHERE user_id = p_old_user_id;
  GET DIAGNOSTICS v_msgs_count = ROW_COUNT;

  -- Merge profile data
  SELECT scan_count, language, country, status INTO v_old_profile
  FROM profiles WHERE id = p_old_user_id;

  IF FOUND THEN
    SELECT scan_count INTO v_new_scan_count FROM profiles WHERE id = p_new_user_id;

    UPDATE profiles SET
      scan_count = COALESCE(v_new_scan_count, 0) + COALESCE(v_old_profile.scan_count, 0),
      language = COALESCE(v_old_profile.language, language),
      country = COALESCE(v_old_profile.country, country),
      status = COALESCE(v_old_profile.status, status),
      updated_at = now()
    WHERE id = p_new_user_id;

    -- Delete old profile
    DELETE FROM profiles WHERE id = p_old_user_id;
  END IF;

  RETURN jsonb_build_object('docs_count', v_docs_count, 'msgs_count', v_msgs_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
