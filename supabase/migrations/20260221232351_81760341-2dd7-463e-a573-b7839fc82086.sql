
ALTER TABLE public.categories
  DROP CONSTRAINT categories_tab_id_fkey,
  ADD CONSTRAINT categories_tab_id_fkey
    FOREIGN KEY (tab_id) REFERENCES public.tabs(id)
    ON DELETE CASCADE;
