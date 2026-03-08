-- Create comments table
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Everyone can read comments
CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Users can insert their own comments" ON public.comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Index for fast lookups by article
CREATE INDEX idx_comments_article_slug ON public.comments(article_slug);