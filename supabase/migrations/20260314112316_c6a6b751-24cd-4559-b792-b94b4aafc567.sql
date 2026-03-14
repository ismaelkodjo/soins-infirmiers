
CREATE OR REPLACE FUNCTION public.get_email_by_display_name(_display_name text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email
  FROM auth.users u
  JOIN public.profiles p ON p.user_id = u.id
  WHERE lower(p.display_name) = lower(_display_name)
  LIMIT 1
$$;
