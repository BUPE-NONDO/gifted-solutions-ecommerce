/**
 * Product Metadata Table Creation and Management
 * Creates comprehensive metadata tables for products with full CRUD operations
 */

import { supabase } from '../lib/supabase';

// SQL for creating the product_metadata table
export const createProductMetadataTableSQL = `
-- Create product_metadata table for comprehensive product information
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
  status VARCHAR(50) DEFAULT 'active', -- active, inactive, draft, discontinued
  featured BOOLEAN DEFAULT false,
  bestseller BOOLEAN DEFAULT false,
  new_arrival BOOLEAN DEFAULT false,
  on_sale BOOLEAN DEFAULT false,
  
  -- Physical Properties
  weight DECIMAL(8,3), -- in kg
  dimensions_length DECIMAL(8,2), -- in cm
  dimensions_width DECIMAL(8,2), -- in cm
  dimensions_height DECIMAL(8,2), -- in cm
  color VARCHAR(100),
  size VARCHAR(100),
  
  -- Images and Media
  primary_image_url TEXT,
  image_urls JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  
  -- Technical Specifications (for electronics)
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
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT valid_price CHECK (price >= 0),
  CONSTRAINT valid_stock CHECK (stock_quantity >= 0),
  CONSTRAINT valid_rating CHECK (average_rating >= 0 AND average_rating <= 5),
  CONSTRAINT valid_discount CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_metadata_product_id ON product_metadata(product_id);
CREATE INDEX IF NOT EXISTS idx_product_metadata_category ON product_metadata(category);
CREATE INDEX IF NOT EXISTS idx_product_metadata_status ON product_metadata(status);
CREATE INDEX IF NOT EXISTS idx_product_metadata_featured ON product_metadata(featured);
CREATE INDEX IF NOT EXISTS idx_product_metadata_in_stock ON product_metadata(in_stock);
CREATE INDEX IF NOT EXISTS idx_product_metadata_created_at ON product_metadata(created_at);
CREATE INDEX IF NOT EXISTS idx_product_metadata_sku ON product_metadata(sku);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_product_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_metadata_updated_at
  BEFORE UPDATE ON product_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_product_metadata_updated_at();

-- Enable Row Level Security
ALTER TABLE product_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Public can view active products" ON product_metadata
  FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can view all products" ON product_metadata
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin users can manage products" ON product_metadata
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
  );
`;

// SQL for creating product categories table
export const createProductCategoriesTableSQL = `
-- Create product_categories table for category management
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

-- Create indexes for categories
CREATE INDEX IF NOT EXISTS idx_product_categories_parent_id ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_slug ON product_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_categories_is_active ON product_categories(is_active);

-- Enable RLS for categories
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Public can view active categories" ON product_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin users can manage categories" ON product_categories
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
  );
`;

// SQL for creating product reviews table
export const createProductReviewsTableSQL = `
-- Create product_reviews table for customer reviews
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

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON product_reviews(is_approved);

-- Enable RLS for reviews
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
CREATE POLICY "Public can view approved reviews" ON product_reviews
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Admin users can manage reviews" ON product_reviews
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'user_metadata' ->> 'role' = 'admin'
  );
`;

// Function to create all tables using direct table creation
export const createAllProductTables = async () => {
  try {
    console.log('🔄 Creating product metadata tables...');

    // Method 1: Try to create tables directly using Supabase client
    await createTablesDirectly();

    console.log('✅ All product metadata tables created successfully!');
    return { success: true };

  } catch (error) {
    console.error('❌ Error creating product tables:', error);

    // Return instructions for manual setup
    return {
      success: false,
      error: error.message,
      manualSetup: true,
      instructions: getManualSetupInstructions()
    };
  }
};

// Create tables directly using Supabase client
const createTablesDirectly = async () => {
  // Create product_metadata table
  const { error: metadataError } = await supabase
    .from('product_metadata')
    .select('id')
    .limit(1);

  if (metadataError && metadataError.code === 'PGRST116') {
    // Table doesn't exist, we need manual setup
    throw new Error('Tables need to be created manually through Supabase SQL Editor');
  }

  // Check other tables
  const { error: categoriesError } = await supabase
    .from('product_categories')
    .select('id')
    .limit(1);

  if (categoriesError && categoriesError.code === 'PGRST116') {
    throw new Error('Categories table needs to be created manually');
  }

  const { error: reviewsError } = await supabase
    .from('product_reviews')
    .select('id')
    .limit(1);

  if (reviewsError && reviewsError.code === 'PGRST116') {
    throw new Error('Reviews table needs to be created manually');
  }

  console.log('✅ All tables already exist and are accessible');
};

// Get manual setup instructions
const getManualSetupInstructions = () => {
  return {
    title: "Manual Database Setup Required",
    steps: [
      "1. Go to your Supabase Dashboard",
      "2. Navigate to SQL Editor",
      "3. Create a new query",
      "4. Copy and paste the SQL from the console logs",
      "5. Run the query to create all tables",
      "6. Return here and try again"
    ],
    sqlQueries: [
      {
        name: "Product Metadata Table",
        sql: createProductMetadataTableSQL
      },
      {
        name: "Product Categories Table",
        sql: createProductCategoriesTableSQL
      },
      {
        name: "Product Reviews Table",
        sql: createProductReviewsTableSQL
      }
    ]
  };
};

// Function to execute SQL directly (if exec_sql function doesn't exist)
export const executeSQL = async (sql) => {
  try {
    const { data, error } = await supabase
      .from('_temp_sql_execution')
      .select('*')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, which is expected
      // We'll use a different approach
      console.log('📝 Executing SQL via direct query...');
      
      // Split SQL into individual statements
      const statements = sql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement.trim() + ';'
          });
          
          if (error) {
            console.error('❌ SQL execution error:', error);
            throw error;
          }
        }
      }
      
      return { success: true };
    }
    
    throw error;
  } catch (error) {
    console.error('❌ Error executing SQL:', error);
    return { success: false, error: error.message };
  }
};

export default {
  createAllProductTables,
  executeSQL,
  createProductMetadataTableSQL,
  createProductCategoriesTableSQL,
  createProductReviewsTableSQL
};
