-- Add product categories to the database

-- First, create a product_categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the three main categories
INSERT INTO public.product_categories (name) VALUES 
  ('coffee'),
  ('pastry'),
  ('bar')
ON CONFLICT (name) DO NOTHING;

-- Add a category_id column to the products table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.products ADD COLUMN category_id INTEGER REFERENCES public.product_categories(id);
  END IF;
END $$;

-- Create a products table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url TEXT,
  category_id INTEGER REFERENCES public.product_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add a category_id column to the order_items table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'order_items' 
    AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.order_items ADD COLUMN category_id INTEGER REFERENCES public.product_categories(id);
  END IF;
END $$;

-- Add security policies for the products table if they don't exist already
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy to allow all authenticated users to view products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_view_policy'
  ) THEN
    EXECUTE 'CREATE POLICY products_view_policy ON public.products
      FOR SELECT USING (auth.role() = ''authenticated'');';
  END IF;
END $$;

-- Policy to allow only admins to modify products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_modify_policy'
  ) THEN
    EXECUTE 'CREATE POLICY products_modify_policy ON public.products
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.users
          WHERE users.id = auth.uid() AND users.role = ''admin''
        )
      );';
  END IF;
END $$;
