-- Seed categories for Lost and Found app

INSERT INTO public.categories (name) VALUES 
  ('Electronics'),
  ('Clothing'),
  ('Books'),
  ('Accessories'),
  ('Documents'),
  ('Other')
ON CONFLICT (name) DO NOTHING;
