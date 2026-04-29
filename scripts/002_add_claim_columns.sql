-- Add missing columns to claims table
ALTER TABLE public.claims
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
