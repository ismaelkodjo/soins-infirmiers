
-- Allow approved staff to insert appointments
CREATE POLICY "Approved staff can insert appointments"
ON public.appointments
FOR INSERT
TO authenticated
WITH CHECK (is_approved_staff(auth.uid()));

-- Allow approved staff to delete appointments
CREATE POLICY "Approved staff can delete appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (is_approved_staff(auth.uid()));

-- Allow approved staff to insert lab results (not just techs)
CREATE POLICY "Approved staff can insert lab results"
ON public.lab_results
FOR INSERT
TO authenticated
WITH CHECK (is_approved_staff(auth.uid()));

-- Allow approved staff to update lab results (not just techs)
CREATE POLICY "Approved staff can update lab results"
ON public.lab_results
FOR UPDATE
TO authenticated
USING (is_approved_staff(auth.uid()));

-- Allow approved staff to delete lab results
CREATE POLICY "Approved staff can delete lab results"
ON public.lab_results
FOR DELETE
TO authenticated
USING (is_approved_staff(auth.uid()));
