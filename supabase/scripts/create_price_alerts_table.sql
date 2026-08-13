-- Create price_alerts table - Run this in Supabase SQL Editor
-- This will create the table if it doesn't exist

CREATE TABLE IF NOT EXISTS public.price_alerts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Enable RLS
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'price_alerts') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.price_alerts';
    END LOOP;
END $$;

-- Create RLS policies for authenticated users
CREATE POLICY "price_alerts_select_policy"
    ON public.price_alerts FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "price_alerts_insert_policy"
    ON public.price_alerts FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "price_alerts_update_policy"
    ON public.price_alerts FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "price_alerts_delete_policy"
    ON public.price_alerts FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_status ON public.price_alerts(status);
CREATE INDEX IF NOT EXISTS idx_price_alerts_created_at ON public.price_alerts(created_at DESC);

-- Verify table was created
SELECT 
    'price_alerts table created successfully!' as status,
    COUNT(*) as row_count
FROM public.price_alerts;
