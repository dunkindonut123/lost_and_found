-- Template: add an admin and useful indexes
-- Replace <your-user-id> with the auth.users.id value of the admin user.

-- 1) Add an admin user (only run if you want to grant admin rights)
-- INSERT INTO public.admins (user_id) VALUES ('<your-user-id>');

-- 2) Add indexes to speed up common queries (no-op if already exist)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_claims_status_created_at ON public.claims (status, created_at DESC);

-- 3) Ensure items.status constraint exists and includes 'claimed'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'items' AND c.conname = 'items_status_check'
  ) THEN
    ALTER TABLE public.items
      DROP CONSTRAINT IF EXISTS items_status_check;
    ALTER TABLE public.items
      ADD CONSTRAINT items_status_check CHECK (status IN ('active', 'pending', 'approved', 'completed', 'claimed'));
  END IF;
END$$;

-- Notes:
-- - Run the admin INSERT only with the correct user id.
-- - These indexes are safe in most dev/staging environments. On very large tables, add them carefully.
