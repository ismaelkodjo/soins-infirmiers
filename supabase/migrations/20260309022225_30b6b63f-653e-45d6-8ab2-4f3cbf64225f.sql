CREATE POLICY "Approved staff can update appointments"
ON public.appointments
FOR UPDATE
TO authenticated
USING (is_approved_staff(auth.uid()))
WITH CHECK (is_approved_staff(auth.uid()));