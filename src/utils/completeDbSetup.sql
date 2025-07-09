-- COMPLETE DATABASE SETUP FOR GIFTED SOLUTIONS
-- Execute this entire script in Supabase SQL Editor to fix all database issues

-- =====================================================
-- 1. CREATE IMAGE_METADATA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS image_metadata (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(255),
  price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'K',
  tags JSONB DEFAULT '[]'::jsonb,
  public_url TEXT,
  file_path TEXT,
  file_size BIGINT,
  content_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for image_metadata
CREATE INDEX IF NOT EXISTS idx_image_metadata_category ON image_metadata(category);
CREATE INDEX IF NOT EXISTS idx_image_metadata_is_visible ON image_metadata(is_visible);
CREATE INDEX IF NOT EXISTS idx_image_metadata_created_at ON image_metadata(created_at);

-- Enable RLS for image_metadata
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for image_metadata
DROP POLICY IF EXISTS "Public can view visible images" ON image_metadata;
CREATE POLICY "Public can view visible images" ON image_metadata
  FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Authenticated users can manage images" ON image_metadata;
CREATE POLICY "Authenticated users can manage images" ON image_metadata
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 2. CREATE PRODUCT_METADATA TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_metadata (
  id BIGSERIAL PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  
  -- Basic Product Information
  name VARCHAR(500) NOT NULL,
  description TEXT,
  short_description VARCHAR(1000),
  category VARCHAR(255),
  subcategory VARCHAR(255),
  brand VARCHAR(255),
  model VARCHAR(255),
  sku VARCHAR(255) UNIQUE,
  
  -- Pricing Information
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'K',
  discount_percentage INTEGER DEFAULT 0,
  
  -- Inventory Management
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  in_stock BOOLEAN DEFAULT true,
  track_inventory BOOLEAN DEFAULT true,
  
  -- Product Status
  status VARCHAR(50) DEFAULT 'active',
  featured BOOLEAN DEFAULT false,
  bestseller BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  on_sale BOOLEAN DEFAULT false,
  
  -- Physical Properties
  weight DECIMAL(8,3),
  dimensions_length DECIMAL(8,2),
  dimensions_width DECIMAL(8,2),
  dimensions_height DECIMAL(8,2),
  color VARCHAR(100),
  size VARCHAR(100),
  
  -- Images and Media
  primary_image_url TEXT,
  image_urls JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  
  -- Technical Specifications
  specifications JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  compatibility JSONB DEFAULT '[]'::jsonb,
  
  -- SEO and Marketing
  meta_title VARCHAR(255),
  meta_description TEXT,
  keywords JSONB DEFAULT '[]'::jsonb,
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Supplier Information
  supplier_name VARCHAR(255),
  supplier_sku VARCHAR(255),
  supplier_price DECIMAL(10,2),
  
  -- Shipping Information
  shipping_weight DECIMAL(8,3),
  shipping_class VARCHAR(100),
  free_shipping BOOLEAN DEFAULT false,
  
  -- Customer Reviews
  average_rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  
  -- Additional Metadata
  warranty_period VARCHAR(100),
  return_policy TEXT,
  care_instructions TEXT,
  
  -- System Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  updated_by UUID,
  
  -- Constraints
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_stock CHECK (stock_quantity >= 0),
  CONSTRAINT valid_rating CHECK (average_rating >= 0 AND average_rating <= 5),
  CONSTRAINT valid_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
);

-- Create indexes for product_metadata
CREATE INDEX IF NOT EXISTS idx_product_metadata_product_id ON product_metadata(product_id);
CREATE INDEX IF NOT EXISTS idx_product_metadata_category ON product_metadata(category);
CREATE INDEX IF NOT EXISTS idx_product_metadata_status ON product_metadata(status);
CREATE INDEX IF NOT EXISTS idx_product_metadata_featured ON product_metadata(featured);
CREATE INDEX IF NOT EXISTS idx_product_metadata_in_stock ON product_metadata(in_stock);
CREATE INDEX IF NOT EXISTS idx_product_metadata_created_at ON product_metadata(created_at);
CREATE INDEX IF NOT EXISTS idx_product_metadata_sku ON product_metadata(sku);

-- Create trigger function for product_metadata
CREATE OR REPLACE FUNCTION update_product_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for product_metadata
DROP TRIGGER IF EXISTS trigger_update_product_metadata_updated_at ON product_metadata;
CREATE TRIGGER trigger_update_product_metadata_updated_at
  BEFORE UPDATE ON product_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_product_metadata_updated_at();

-- Enable RLS for product_metadata
ALTER TABLE product_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for product_metadata
DROP POLICY IF EXISTS "Public can view active products" ON product_metadata;
CREATE POLICY "Public can view active products" ON product_metadata
  FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Authenticated users can view all products" ON product_metadata;
CREATE POLICY "Authenticated users can view all products" ON product_metadata
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage products" ON product_metadata;
CREATE POLICY "Authenticated users can manage products" ON product_metadata
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 3. CREATE PRODUCT_CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id BIGINT REFERENCES product_categories(id),
  image_url TEXT,
  icon VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for product_categories
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_is_active ON product_categories(is_active);

-- Enable RLS for product_categories
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for product_categories
DROP POLICY IF EXISTS "Public can view active categories" ON product_categories;
CREATE POLICY "Public can view active categories" ON product_categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can manage categories" ON product_categories;
CREATE POLICY "Authenticated users can manage categories" ON product_categories
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 4. CREATE PRODUCT_REVIEWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for product_reviews
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON product_reviews(is_approved);

-- Enable RLS for product_reviews
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for product_reviews
DROP POLICY IF EXISTS "Public can view approved reviews" ON product_reviews;
CREATE POLICY "Public can view approved reviews" ON product_reviews
  FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Authenticated users can manage reviews" ON product_reviews;
CREATE POLICY "Authenticated users can manage reviews" ON product_reviews
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 5. CREATE LEGACY SUPPORT TABLES
-- =====================================================

-- Create products table for legacy support
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'K',
  category VARCHAR(255),
  image TEXT,
  featured BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for products
DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- 6. INSERT SAMPLE DATA
-- =====================================================

-- Insert sample categories
INSERT INTO product_categories (name, slug, description, is_active) VALUES
('Microcontrollers', 'microcontrollers', 'Arduino, ESP32, and other microcontroller boards', true),
('Sensors', 'sensors', 'Temperature, humidity, motion, and other sensors', true),
('Displays', 'displays', 'LCD, OLED, LED displays and screens', true),
('Components', 'components', 'Electronic components and parts', true),
('Motors', 'motors', 'Servo motors, stepper motors, and actuators', true),
('Power', 'power', 'Batteries, adapters, and power management', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample products into product_metadata
INSERT INTO product_metadata (
  product_id, name, description, category, price, currency, stock_quantity, 
  in_stock, featured, status, specifications, features
) VALUES
(
  'prod_arduino_uno', 
  'Arduino Uno R3', 
  'The classic Arduino development board with USB cable', 
  'Microcontrollers', 
  650, 
  'K', 
  25, 
  true, 
  true, 
  'active',
  '{"Microcontroller": "ATmega328P", "Operating Voltage": "5V", "Digital I/O Pins": "14"}',
  '["USB connectivity", "Built-in LED", "Reset button"]'
),
(
  'prod_esp32_dev', 
  'ESP32 Development Board', 
  'WiFi and Bluetooth enabled microcontroller', 
  'Microcontrollers', 
  850, 
  'K', 
  15, 
  true, 
  true, 
  'active',
  '{"Processor": "Dual-core", "WiFi": "802.11 b/g/n", "Bluetooth": "v4.2"}',
  '["Built-in WiFi", "Bluetooth connectivity", "Dual-core processor"]'
),
(
  'prod_dht22_sensor', 
  'DHT22 Temperature Sensor', 
  'High precision digital temperature and humidity sensor', 
  'Sensors', 
  120, 
  'K', 
  50, 
  true, 
  false, 
  'active',
  '{"Temperature Range": "-40°C to 80°C", "Humidity Range": "0-100% RH"}',
  '["High accuracy", "Digital output", "Low power consumption"]'
)
ON CONFLICT (product_id) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully! All tables created and sample data inserted.' as result;
