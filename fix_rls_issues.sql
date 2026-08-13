-- Complete Security & RLS Fix Script for Supabase SQL Editor
-- Run this script in the Supabase SQL Editor to enforce strict RLS and performance indexes

-- ============================================
-- 1. Ensure Table Schemas & Tenant Columns
-- ============================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'price_alerts'
    ) THEN
        CREATE TABLE price_alerts (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
            symbol TEXT NOT NULL,
            asset_type TEXT NOT NULL CHECK (asset_type IN ('crypto', 'forex', 'stock', 'commodity')),
            exchange TEXT,
            alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'price_cross', 'manual')),
            target_price NUMERIC,
            condition_value NUMERIC,
            message TEXT,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'cancelled')),
            telegram_enabled BOOLEAN DEFAULT false,
            telegram_chat_id TEXT,
            triggered_at timestamptz,
            created_at timestamptz DEFAULT now()
        );
    END IF;

    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'manual_trades' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE manual_trades ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ============================================
-- 2. Enable RLS on Tables
-- ============================================

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_trades ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. Drop Conflicting / Insecure Policies
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE tablename IN ('price_alerts', 'manual_trades')) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- ============================================
-- 4. Create Strict Authenticated Policies
-- ============================================

-- price_alerts Policies (Owner restricted)
CREATE POLICY "price_alerts_select_policy"
    ON price_alerts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "price_alerts_insert_policy"
    ON price_alerts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "price_alerts_update_policy"
    ON price_alerts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "price_alerts_delete_policy"
    ON price_alerts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- manual_trades Policies (Public read signal feed, authenticated write)
CREATE POLICY "manual_trades_select_policy"
    ON manual_trades FOR SELECT
    USING (true);

CREATE POLICY "manual_trades_insert_authenticated_policy"
    ON manual_trades FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "manual_trades_update_authenticated_policy"
    ON manual_trades FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "manual_trades_delete_authenticated_policy"
    ON manual_trades FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================
-- 5. Performance Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_status_symbol ON price_alerts(status, symbol);
CREATE INDEX IF NOT EXISTS idx_price_alerts_created_at ON price_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_manual_trades_user_id ON manual_trades(user_id);

-- ============================================
-- 6. Verification Queries
-- ============================================

SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('price_alerts', 'manual_trades')
ORDER BY tablename, policyname;
