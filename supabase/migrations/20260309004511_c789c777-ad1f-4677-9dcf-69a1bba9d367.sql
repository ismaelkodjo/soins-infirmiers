-- Allow approved staff to view all appointments
CREATE POLICY "Approved staff can view all appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (is_approved_staff(auth.uid()));
