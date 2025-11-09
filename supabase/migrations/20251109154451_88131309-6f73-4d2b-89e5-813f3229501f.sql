-- Add DELETE policy for user_settings so users can delete their own settings
CREATE POLICY "Users can delete their own settings"
ON public.user_settings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);