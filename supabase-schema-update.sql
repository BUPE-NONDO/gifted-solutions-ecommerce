-- Supabase Schema Update for Gifted Solutions
-- Add missing columns to products table

-- Add badge column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS badge TEXT;

-- Add featured column to products table  
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- Add images array column for multiple product images
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[];

-- Add visible column for product visibility
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;

-- Add imageVersion for cache busting
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS imageVersion BIGINT;

-- Update existing products to have default values
UPDATE products 
SET 
  badge = NULL,
  featured = false,
  images = '{}',
  visible = true,
  imageVersion = EXTRACT(epoch FROM NOW()) * 1000
WHERE badge IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_visible ON products(visible);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Verify the schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
