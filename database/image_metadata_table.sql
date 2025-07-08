-- Create image_metadata table for storing image details
-- This table stores metadata for images in the gallery

CREATE TABLE IF NOT EXISTS image_metadata (
  id SERIAL PRIMARY KEY,
  image_name VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  tags TEXT[],
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_image_metadata_image_name ON image_metadata(image_name);
CREATE INDEX IF NOT EXISTS idx_image_metadata_featured ON image_metadata(featured);
CREATE INDEX IF NOT EXISTS idx_image_metadata_in_stock ON image_metadata(in_stock);
CREATE INDEX IF NOT EXISTS idx_image_metadata_price ON image_metadata(price);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_image_metadata_updated_at 
    BEFORE UPDATE ON image_metadata 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Allow all operations for authenticated users (admins)
CREATE POLICY "Allow all operations for authenticated users" ON image_metadata
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow read access for anonymous users (public gallery)
CREATE POLICY "Allow read access for anonymous users" ON image_metadata
    FOR SELECT USING (true);

-- Insert some sample data (optional)
INSERT INTO image_metadata (image_name, title, description, price, featured, in_stock) VALUES
('arduino-uno-r3-1748603951988-impc78.jpg', 'Arduino Uno R3', 'High-quality Arduino Uno R3 development board for electronics projects and prototyping.', 650, true, true),
('esp32-development-board-1748603955352-1tqsnv.jpg', 'ESP32 Development Board', 'Wireless ESP32 module with built-in connectivity for IoT applications.', 850, true, true),
('ultrasonic-sensor-hc-sr04-1748603963344-8gl2xh.jpg', 'Ultrasonic Sensor HC-SR04', 'Precision ultrasonic sensor for accurate measurements and data collection.', 120, false, true),
('breadboard-1748603978848-arhihy.jpg', 'Breadboard', 'Essential breadboard component for electronic circuits and projects.', 45, false, true)
ON CONFLICT (image_name) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON image_metadata TO authenticated;
GRANT SELECT ON image_metadata TO anon;
GRANT USAGE, SELECT ON SEQUENCE image_metadata_id_seq TO authenticated;

-- Comments for documentation
COMMENT ON TABLE image_metadata IS 'Stores metadata for images in the gallery including titles, descriptions, prices, and other attributes';
COMMENT ON COLUMN image_metadata.image_name IS 'Unique filename of the image in Supabase storage';
COMMENT ON COLUMN image_metadata.title IS 'Display title for the image';
COMMENT ON COLUMN image_metadata.description IS 'Detailed description of the image/product';
COMMENT ON COLUMN image_metadata.price IS 'Price in local currency (K)';
COMMENT ON COLUMN image_metadata.in_stock IS 'Whether the item is currently in stock';
COMMENT ON COLUMN image_metadata.featured IS 'Whether the item should be featured prominently';
COMMENT ON COLUMN image_metadata.tags IS 'Array of tags for categorization and search';
COMMENT ON COLUMN image_metadata.specifications IS 'JSON object containing technical specifications';
