-- Migration: Add price information to credits_log table
-- Run this in your Supabase SQL editor

-- Add price_amount column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credits_log' 
        AND column_name = 'price_amount'
    ) THEN
        ALTER TABLE public.credits_log ADD COLUMN price_amount decimal(10,2);
        RAISE NOTICE 'Added price_amount column to credits_log table';
    ELSE
        RAISE NOTICE 'price_amount column already exists';
    END IF;
END $$;

-- Add price_currency column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'credits_log' 
        AND column_name = 'price_currency'
    ) THEN
        ALTER TABLE public.credits_log ADD COLUMN price_currency text DEFAULT 'GBP';
        RAISE NOTICE 'Added price_currency column to credits_log table';
    ELSE
        RAISE NOTICE 'price_currency column already exists';
    END IF;
END $$; 