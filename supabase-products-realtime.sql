-- Enable realtime product updates for the admin product stock view.
-- Run this in Supabase SQL Editor if product stock does not refresh live.

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_object THEN NULL;
END;
$$;
