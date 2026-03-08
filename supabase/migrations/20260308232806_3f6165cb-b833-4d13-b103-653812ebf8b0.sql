
-- Table for patient documents (results & prescriptions)
CREATE TABLE public.patient_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('result', 'prescription')),
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;

-- Patients can view their own documents
CREATE POLICY "Patients can view their own documents"
ON public.patient_documents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can insert documents
CREATE POLICY "Admins can insert documents"
ON public.patient_documents FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can delete documents
CREATE POLICY "Admins can delete documents"
ON public.patient_documents FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
ON public.patient_documents FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to insert appointments for patients
CREATE POLICY "Admins can insert appointments"
ON public.appointments FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow admins to view all appointments
CREATE POLICY "Admins can view all appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to update appointments
CREATE POLICY "Admins can update appointments"
ON public.appointments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for patient documents
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-documents', 'patient-documents', false);

-- Storage policies for patient-documents bucket
CREATE POLICY "Admins can upload patient documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'patient-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-documents' AND (public.has_role(auth.uid(), 'admin') OR auth.uid()::text = (storage.foldername(name))[1]));

CREATE POLICY "Admins can delete patient documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'patient-documents' AND public.has_role(auth.uid(), 'admin'));
