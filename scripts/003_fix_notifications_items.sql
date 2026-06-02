-- Migration: add notification columns and allow 'claimed' item status
-- Run this in your Supabase SQL editor or via psql against the project's database.

-- 1) Add `type` and `item_id` to notifications; make `title` nullable so inserts without a title succeed
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS item_id uuid REFERENCES public.items(id) ON DELETE SET NULL;

-- Allow title to be nullable (existing rows remain)
ALTER TABLE public.notifications
  ALTER COLUMN title DROP NOT NULL;

-- 2) Update items status check constraint to include 'claimed'
-- Drop the existing constraint if it exists (name may vary depending on how it was created)
ALTER TABLE public.items
  DROP CONSTRAINT IF EXISTS items_status_check;

-- Add a new named check constraint that includes 'claimed'
ALTER TABLE public.items
  ADD CONSTRAINT items_status_check CHECK (status IN ('active', 'pending', 'approved', 'completed', 'claimed'));

-- 3) (Optional) Ensure claims table has admin_notes and reviewed_at (no-op if already present)
ALTER TABLE public.claims
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

-- Notes:
-- - Run this migration only once. If you are using Supabase CLI or a migration tool, integrate it there.
-- - After applying, test approving/rejecting claims in the admin UI and verify notifications are created.
