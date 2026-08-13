-- Diagnostic Script - Run this first to see what's wrong
-- This will show you the current state of your database

-- 1. Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('price_alerts', 'manual_trades') THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('price_alerts', 'manual_trades', 'strategy_alerts');

-- 2. Check RLS status
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('price_alerts', 'manual_trades');

-- 3. Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command,
    CASE 
        WHEN cmd = 'SELECT' THEN '✅'
        WHEN cmd = 'INSERT' THEN '✅'
        ELSE ''
    END as status
FROM pg_policies 
WHERE tablename IN ('price_alerts', 'manual_trades')
ORDER BY tablename, cmd;

-- 4. Check if price_alerts table structure matches expected
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'price_alerts'
ORDER BY ordinal_position;

-- 5. Check current user context (for debugging)
SELECT 
    current_user as current_db_user,
    session_user as session_user;
