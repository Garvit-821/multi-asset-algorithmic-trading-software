-- Migration: Fix P0 Database Security, Enforce RLS Policies, and Add Tenant Isolation
-- Date: 2026-08-13

-- ==============================================================================
-- 1. Ensure Tenant Isolation (user_id Foreign Keys)
-- ==============================================================================

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'manual_trades' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE manual_trades ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'strategy_alerts' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE strategy_alerts ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ai_strategies' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE ai_strategies ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- ==============================================================================
-- 2. Enable RLS on All Tables
-- ==============================================================================

ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_strategies ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. Purge Permissive & Unsafe Anonymous Policies
-- ==============================================================================

DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE tablename IN ('price_alerts', 'manual_trades', 'strategy_alerts', 'ai_strategies')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- ==============================================================================
-- 4. Create Strict, Scoped RLS Policies
-- ==============================================================================

-- A. price_alerts Policies (Per-user private alerts)
CREATE POLICY "price_alerts_select_owner"
    ON price_alerts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "price_alerts_insert_owner"
    ON price_alerts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "price_alerts_update_owner"
    ON price_alerts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "price_alerts_delete_owner"
    ON price_alerts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- B. manual_trades Policies (Public read signal feed, authenticated-only writes)
CREATE POLICY "manual_trades_select_public"
    ON manual_trades FOR SELECT
    USING (true);

CREATE POLICY "manual_trades_insert_authenticated"
    ON manual_trades FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "manual_trades_update_authenticated"
    ON manual_trades FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "manual_trades_delete_authenticated"
    ON manual_trades FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- C. strategy_alerts Policies
CREATE POLICY "strategy_alerts_select_policy"
    ON strategy_alerts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "strategy_alerts_insert_policy"
    ON strategy_alerts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "strategy_alerts_update_policy"
    ON strategy_alerts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "strategy_alerts_delete_policy"
    ON strategy_alerts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- D. ai_strategies Policies (Public read library, authenticated updates)
CREATE POLICY "ai_strategies_select_public"
    ON ai_strategies FOR SELECT
    USING (true);

CREATE POLICY "ai_strategies_insert_authenticated"
    ON ai_strategies FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "ai_strategies_update_authenticated"
    ON ai_strategies FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ==============================================================================
-- 5. Performance Indexes
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_price_alerts_status_symbol ON price_alerts(status, symbol);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_trades_user_id ON manual_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_strategy_alerts_user_id ON strategy_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_strategies_user_id ON ai_strategies(user_id);
