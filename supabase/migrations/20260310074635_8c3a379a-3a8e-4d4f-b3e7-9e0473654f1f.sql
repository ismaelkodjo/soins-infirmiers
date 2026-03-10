
-- Drop the restrictive insert policy that excludes techniciens
DROP POLICY "Medical staff can insert ordonnances" ON public.ordonnances;

-- Allow ALL approved staff to insert ordonnances
CREATE POLICY "Approved staff can insert ordonnances"
ON public.ordonnances
FOR INSERT
TO authenticated
WITH CHECK (is_approved_staff(auth.uid()));

-- Allow all approved staff to delete ordonnances
CREATE POLICY "Approved staff can delete ordonnances"
ON public.ordonnances
FOR DELETE
TO authenticated
USING (is_approved_staff(auth.uid()));
