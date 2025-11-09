-- Add policy to prevent deletion of admin@admin.local profile
CREATE POLICY "Prevent admin@admin.local profile deletion"
  ON public.profiles
  FOR DELETE
  USING (
    email != 'admin@admin.local' 
    AND public.has_role(auth.uid(), 'admin')
  );