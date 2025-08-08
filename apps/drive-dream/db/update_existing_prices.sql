-- Script to update existing credits_log records with correct prices
-- Run this in your Supabase SQL editor

-- Update prices based on credit amounts (matching your buy page prices)
UPDATE public.credits_log 
SET 
  price_amount = CASE 
    WHEN amount = 1 THEN 0.99
    WHEN amount = 10 THEN 4.75
    WHEN amount = 50 THEN 9.00
    WHEN amount = 100 THEN 21.25
    WHEN amount = 150 THEN 40.00
    WHEN amount = 500 THEN 75.00
    WHEN amount = 1000 THEN 175.00
    WHEN amount = 2500 THEN 600.00
    ELSE NULL
  END,
  price_currency = 'GBP'
WHERE price_amount IS NULL OR price_amount = 0;

-- Show the results
SELECT 
  id,
  user_id,
  amount,
  price_amount,
  price_currency,
  created_at
FROM public.credits_log 
ORDER BY created_at DESC; 