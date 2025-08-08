-- Manual migration for credits_log table
-- Run this in your Supabase SQL editor

-- Add session_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credits_log' 
        AND column_name = 'session_id'
    ) THEN
        ALTER TABLE public.credits_log ADD COLUMN session_id text;
        RAISE NOTICE 'Added session_id column to credits_log table';
    ELSE
        RAISE NOTICE 'session_id column already exists';
    END IF;
END $$;

-- Add RLS policy for service role to insert logs (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'credits_log' 
        AND policyname = 'Service can insert logs'
    ) THEN
        CREATE POLICY "Service can insert logs"
        ON public.credits_log FOR INSERT
        WITH CHECK (true);
        RAISE NOTICE 'Added service insert policy for credits_log table';
    ELSE
        RAISE NOTICE 'Service insert policy already exists';
    END IF;
END $$; 