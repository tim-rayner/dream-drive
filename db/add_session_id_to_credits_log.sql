-- Migration: Add session_id column to credits_log table
-- Run this if you have an existing credits_log table without session_id

-- Add session_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credits_log' 
        AND column_name = 'session_id'
    ) THEN
        ALTER TABLE public.credits_log ADD COLUMN session_id text;
    END IF;
END $$; 