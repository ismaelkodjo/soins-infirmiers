-- Fix 1: Staff members - prevent self-approval on insert
DROP POLICY IF EXISTS "Users can register as staff" ON public.staff_members;
CREATE POLICY "Users can register as staff"
  ON public.staff_members
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id AND approved = false);

-- Fix 2: Notifications - restrict insert to authenticated only
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Fix 3: Profiles - restrict SELECT to authenticated users
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);