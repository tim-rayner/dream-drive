-- Add weather column to generations table
ALTER TABLE public.generations 
ADD COLUMN weather text CHECK (weather IN ('clear', 'cloudy', 'rainy', 'snowy', 'foggy', 'thunderstorm'));

-- Add comment to the column
COMMENT ON COLUMN public.generations.weather IS 'Weather condition for the generation (optional)'; 