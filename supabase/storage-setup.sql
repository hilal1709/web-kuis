-- Setup storage bucket for quiz cover images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('quiz-covers', 'quiz-covers', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy: Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'quiz-covers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Allow public read
CREATE POLICY "Public can read quiz covers" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'quiz-covers');

-- Policy: Allow owner to delete
CREATE POLICY "Owner can delete own covers" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'quiz-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
