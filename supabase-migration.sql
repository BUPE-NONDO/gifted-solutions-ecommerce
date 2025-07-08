-- Gifted Solutions Database Migration
-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  site_name VARCHAR(255) DEFAULT 'Gifted Solutions',
  tagline VARCHAR(255) DEFAULT 'Your Electronics Partner',
  logo TEXT,
  favicon TEXT,
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#10B981',
  accent_color VARCHAR(7) DEFAULT '#F59E0B',
  background_color VARCHAR(7) DEFAULT '#F9FAFB',
  text_color VARCHAR(7) DEFAULT '#111827',
  header_text VARCHAR(255) DEFAULT 'Welcome to Gifted Solutions',
  header_subtext TEXT DEFAULT 'Quality Electronics Components & Solutions',
  show_header_banner BOOLEAN DEFAULT true,
  header_banner_text VARCHAR(255) DEFAULT 'Free Delivery in Lusaka | WhatsApp: 0779421717',
  footer_text TEXT DEFAULT 'Contact: 0779421717 | 0961288156',
  footer_description TEXT DEFAULT 'Your trusted partner for quality electronics components and solutions in Zambia.',
  show_social_links BOOLEAN DEFAULT true,
  phone1 VARCHAR(20) DEFAULT '0779421717',
  phone2 VARCHAR(20) DEFAULT '0961288156',
  email VARCHAR(255) DEFAULT 'giftedsolutions20@gmail.com',
  address TEXT DEFAULT 'Lusaka, Zambia',
  whatsapp_number VARCHAR(20) DEFAULT '260779421717',
  social_links JSONB DEFAULT '{"facebook": "bupelifestyle", "twitter": "giftedsolutionz", "tiktok": "bupelifestyle", "instagram": "", "youtube": "", "linkedin": ""}',
  hero_title VARCHAR(255) DEFAULT 'Quality Electronics Components',
  hero_subtitle TEXT DEFAULT 'Find everything you need for your electronics projects',
  hero_button_text VARCHAR(100) DEFAULT 'Shop Now',
  show_featured_products BOOLEAN DEFAULT true,
  featured_section_title VARCHAR(255) DEFAULT 'Featured Products',
  featured_section_subtitle TEXT DEFAULT 'Discover our most popular electronics components',
  shop_title VARCHAR(255) DEFAULT 'Our Products',
  shop_subtitle TEXT DEFAULT 'Browse our complete catalog of electronics components',
  products_per_page INTEGER DEFAULT 12,
  show_filters BOOLEAN DEFAULT true,
  show_sorting BOOLEAN DEFAULT true,
  currency VARCHAR(10) DEFAULT 'K',
  currency_position VARCHAR(10) DEFAULT 'before',
  show_prices BOOLEAN DEFAULT true,
  show_stock BOOLEAN DEFAULT true,
  show_ratings BOOLEAN DEFAULT false,
  meta_title VARCHAR(255) DEFAULT 'Gifted Solutions - Electronics Components Zambia',
  meta_description TEXT DEFAULT 'Quality electronics components and solutions in Zambia. Arduino, sensors, modules and more.',
  meta_keywords TEXT DEFAULT 'electronics, arduino, sensors, zambia, lusaka, components',
  enable_search BOOLEAN DEFAULT true,
  enable_cart BOOLEAN DEFAULT true,
  enable_wishlist BOOLEAN DEFAULT false,
  enable_reviews BOOLEAN DEFAULT false,
  enable_blog BOOLEAN DEFAULT false,
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT DEFAULT 'We are currently updating our website. Please check back soon.',
  google_analytics_id VARCHAR(255),
  facebook_pixel_id VARCHAR(255),
  custom_css TEXT,
  custom_js TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_content table
CREATE TABLE IF NOT EXISTS page_content (
  id SERIAL PRIMARY KEY,
  page_id VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255),
  content TEXT,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  custom_css TEXT,
  custom_js TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_page_content_updated_at ON page_content;
CREATE TRIGGER update_page_content_updated_at
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default site settings
INSERT INTO site_settings (
  site_name,
  tagline,
  header_text,
  header_subtext,
  footer_text,
  footer_description,
  social_links,
  phone1,
  phone2,
  whatsapp_number,
  hero_title,
  hero_subtitle,
  hero_button_text,
  featured_section_title,
  featured_section_subtitle
) VALUES (
  'Gifted Solutions',
  'Your Electronics Partner',
  'Welcome to Gifted Solutions',
  'Quality Electronics Components & Solutions',
  'Contact: 0779421717 | 0961288156',
  'Your trusted partner for quality electronics components and solutions in Zambia.',
  '{"facebook": "bupelifestyle", "twitter": "giftedsolutionz", "tiktok": "bupelifestyle", "instagram": "", "youtube": "", "linkedin": ""}',
  '0779421717',
  '0961288156',
  '260779421717',
  'Quality Electronics Components',
  'Find everything you need for your electronics projects',
  'Shop Now',
  'Featured Products',
  'Discover our most popular electronics components'
) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Create policies for site_settings (allow read for everyone, write for authenticated users)
CREATE POLICY "Allow read access to site_settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow write access to site_settings for authenticated users" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for page_content (allow read for everyone, write for authenticated users)
CREATE POLICY "Allow read access to page_content" ON page_content
  FOR SELECT USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Allow write access to page_content for authenticated users" ON page_content
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON site_settings TO authenticated;
GRANT SELECT ON site_settings TO anon;
GRANT ALL ON page_content TO authenticated;
GRANT SELECT ON page_content TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_settings_updated_at ON site_settings(updated_at);
CREATE INDEX IF NOT EXISTS idx_page_content_page_id ON page_content(page_id);
CREATE INDEX IF NOT EXISTS idx_page_content_published ON page_content(published);

-- Success message
SELECT 'Database migration completed successfully! You can now use the Super Admin Dashboard.' as message;
