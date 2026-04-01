-- Add resume_url and portfolio_link columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS resume_url text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_link text DEFAULT '';

-- Create storage bucket for resume PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('resume-documents', 'resume-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resume-documents
CREATE POLICY "Resume documents are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'resume-documents');

CREATE POLICY "Users can upload their own resume"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'resume-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
