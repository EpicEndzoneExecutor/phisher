-- Create storage buckets for file management
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('email-attachments', 'email-attachments', false),
  ('template-assets', 'template-assets', true),
  ('reports', 'reports', false),
  ('logos', 'logos', true);

-- Create storage policies for email attachments (private, user-specific)
CREATE POLICY "Users can upload their own attachments" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'email-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own attachments" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'email-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own attachments" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'email-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for template assets (public read, user upload)
CREATE POLICY "Anyone can view template assets" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'template-assets');

CREATE POLICY "Authenticated users can upload template assets" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'template-assets' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own template assets" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'template-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for reports (private, user-specific)
CREATE POLICY "Users can upload their own reports" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own reports" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own reports" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for logos (public read, user upload)
CREATE POLICY "Anyone can view logos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'logos');

CREATE POLICY "Authenticated users can upload logos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'logos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own logos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);