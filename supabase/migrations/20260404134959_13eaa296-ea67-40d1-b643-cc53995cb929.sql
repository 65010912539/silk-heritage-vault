
-- Add avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text DEFAULT '';

-- Add 'suspended' to pattern_status enum
ALTER TYPE public.pattern_status ADD VALUE IF NOT EXISTS 'suspended';

-- Create pattern_reports table
CREATE TABLE public.pattern_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_id uuid NOT NULL,
  reporter_id uuid NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_response text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.pattern_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view reports" ON public.pattern_reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users and professors can create reports" ON public.pattern_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can manage reports" ON public.pattern_reports FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
