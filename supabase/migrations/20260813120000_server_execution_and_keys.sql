-- Migration: Server-Side Exchange Key Storage & Algorithmic Order Persistence
-- File: 20260813120000_server_execution_and_keys.sql

-- ============================================================================
-- 1. Table: user_exchange_keys
-- Stores user exchange API keys and secrets (encrypted server-side)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_exchange_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exchange_id TEXT NOT NULL CHECK (exchange_id IN ('binance', 'binance_testnet', 'coinbase', 'kraken')),
    encrypted_api_key TEXT NOT NULL,
    encrypted_api_secret TEXT NOT NULL,
    passphrase TEXT,
    is_testnet BOOLEAN DEFAULT false,
    updated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, exchange_id)
);

ALTER TABLE public.user_exchange_keys ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "user_exchange_keys_owner_select" ON public.user_exchange_keys;
    DROP POLICY IF EXISTS "user_exchange_keys_owner_insert" ON public.user_exchange_keys;
    DROP POLICY IF EXISTS "user_exchange_keys_owner_update" ON public.user_exchange_keys;
    DROP POLICY IF EXISTS "user_exchange_keys_owner_delete" ON public.user_exchange_keys;
END $$;

CREATE POLICY "user_exchange_keys_owner_select"
    ON public.user_exchange_keys FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "user_exchange_keys_owner_insert"
    ON public.user_exchange_keys FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_exchange_keys_owner_update"
    ON public.user_exchange_keys FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_exchange_keys_owner_delete"
    ON public.user_exchange_keys FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_exchange_keys_user_id ON public.user_exchange_keys(user_id);

-- ============================================================================
-- 2. Table: algo_orders
-- Stores institutional algo order state (TWAP, VWAP, Iceberg)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.algo_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    strategy_type TEXT NOT NULL CHECK (strategy_type IN ('TWAP', 'VWAP', 'ICEBERG')),
    symbol TEXT NOT NULL,
    side TEXT NOT NULL CHECK (side IN ('BUY', 'SELL')),
    total_quantity NUMERIC NOT NULL CHECK (total_quantity > 0),
    filled_quantity NUMERIC DEFAULT 0 CHECK (filled_quantity >= 0),
    exchange_id TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'PAUSED', 'COMPLETED', 'CANCELLED', 'FAILED')),
    duration_minutes INT,
    slice_interval_seconds INT,
    randomize_variance_percent NUMERIC,
    display_quantity NUMERIC,
    limit_price NUMERIC,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.algo_orders ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "algo_orders_owner_select" ON public.algo_orders;
    DROP POLICY IF EXISTS "algo_orders_owner_insert" ON public.algo_orders;
    DROP POLICY IF EXISTS "algo_orders_owner_update" ON public.algo_orders;
    DROP POLICY IF EXISTS "algo_orders_owner_delete" ON public.algo_orders;
END $$;

CREATE POLICY "algo_orders_owner_select"
    ON public.algo_orders FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "algo_orders_owner_insert"
    ON public.algo_orders FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "algo_orders_owner_update"
    ON public.algo_orders FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "algo_orders_owner_delete"
    ON public.algo_orders FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_algo_orders_user_id ON public.algo_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_algo_orders_status ON public.algo_orders(status);

-- ============================================================================
-- 3. Table: algo_order_slices
-- Stores per-slice execution logs with idempotency tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.algo_order_slices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    algo_order_id uuid NOT NULL REFERENCES public.algo_orders(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slice_index INT NOT NULL,
    quantity NUMERIC NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('FILLED', 'REJECTED', 'PENDING')),
    exchange_order_id TEXT,
    client_order_id TEXT UNIQUE,
    error_message TEXT,
    executed_at timestamptz DEFAULT now()
);

ALTER TABLE public.algo_order_slices ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "algo_order_slices_owner_select" ON public.algo_order_slices;
    DROP POLICY IF EXISTS "algo_order_slices_owner_insert" ON public.algo_order_slices;
    DROP POLICY IF EXISTS "algo_order_slices_owner_update" ON public.algo_order_slices;
    DROP POLICY IF EXISTS "algo_order_slices_owner_delete" ON public.algo_order_slices;
END $$;

CREATE POLICY "algo_order_slices_owner_select"
    ON public.algo_order_slices FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "algo_order_slices_owner_insert"
    ON public.algo_order_slices FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "algo_order_slices_owner_update"
    ON public.algo_order_slices FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "algo_order_slices_owner_delete"
    ON public.algo_order_slices FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_algo_order_slices_algo_order_id ON public.algo_order_slices(algo_order_id);
CREATE INDEX IF NOT EXISTS idx_algo_order_slices_user_id ON public.algo_order_slices(user_id);
