-- Create video_generations table
CREATE TABLE IF NOT EXISTS video_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    prompt TEXT NOT NULL,
    video_url TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_video_generations_user_id ON video_generations(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_video_generations_created_at ON video_generations(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE video_generations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own video generations
CREATE POLICY "Users can view their own video generations" ON video_generations
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own video generations
CREATE POLICY "Users can insert their own video generations" ON video_generations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own video generations
CREATE POLICY "Users can update their own video generations" ON video_generations
    FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_video_generations_updated_at
    BEFORE UPDATE ON video_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 