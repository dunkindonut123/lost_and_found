-- Lost and Found Database Schema
-- Run this script to set up all tables, RLS policies, and triggers

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  student_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- 2. Admins table (separate admin accounts)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin table
CREATE POLICY "admins_select_self" ON public.admins FOR SELECT 
  USING (auth.uid() = user_id);

-- 3. Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_admin" ON public.categories FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
CREATE POLICY "categories_update_admin" ON public.categories FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
CREATE POLICY "categories_delete_admin" ON public.categories FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- 4. Items table
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  location TEXT NOT NULL,
  date_found DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'approved', 'completed')),
  reporter_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Everyone can view active, pending, and approved items
CREATE POLICY "items_select_public" ON public.items FOR SELECT 
  USING (status IN ('active', 'pending', 'approved') OR reporter_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
CREATE POLICY "items_insert_auth" ON public.items FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "items_update_own_or_admin" ON public.items FOR UPDATE 
  USING (reporter_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
CREATE POLICY "items_delete_own_or_admin" ON public.items FOR DELETE 
  USING (reporter_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- 5. Item photos table
CREATE TABLE IF NOT EXISTS public.item_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.item_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "item_photos_select_all" ON public.item_photos FOR SELECT USING (true);
CREATE POLICY "item_photos_insert_auth" ON public.item_photos FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND reporter_id = auth.uid()));
CREATE POLICY "item_photos_delete_own_or_admin" ON public.item_photos FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND (reporter_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()))));

-- 6. Claims table
CREATE TABLE IF NOT EXISTS public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  claimant_id UUID NOT NULL REFERENCES auth.users(id),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Users can view their own claims, admins can view all
CREATE POLICY "claims_select_own_or_admin" ON public.claims FOR SELECT 
  USING (claimant_id = auth.uid() OR EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
CREATE POLICY "claims_insert_auth" ON public.claims FOR INSERT 
  WITH CHECK (auth.uid() = claimant_id);
CREATE POLICY "claims_update_admin" ON public.claims FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));
CREATE POLICY "claims_delete_own" ON public.claims FOR DELETE 
  USING (claimant_id = auth.uid() AND status = 'pending');

-- 7. Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  claim_id UUID REFERENCES public.claims(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT 
  USING (user_id = auth.uid());
CREATE POLICY "notifications_insert_system" ON public.notifications FOR INSERT 
  WITH CHECK (true);
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE 
  USING (user_id = auth.uid());
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE 
  USING (user_id = auth.uid());

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, student_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data ->> 'student_id'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update item updated_at
CREATE OR REPLACE FUNCTION public.update_item_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS items_updated_at ON public.items;
CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_item_timestamp();

-- Trigger to update claim updated_at
DROP TRIGGER IF EXISTS claims_updated_at ON public.claims;
CREATE TRIGGER claims_updated_at
  BEFORE UPDATE ON public.claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_item_timestamp();
