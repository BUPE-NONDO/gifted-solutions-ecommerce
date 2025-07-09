-- Create image_metadata table for Gifted Solutions
-- Run this in Supabase SQL Editor

-- Create the table
CREATE TABLE IF NOT EXISTS image_metadata (
  id SERIAL PRIMARY KEY,
  image_name VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
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
CREATE INDEX IF NOT EXISTS idx_image_metadata_category ON image_metadata(category);
CREATE INDEX IF NOT EXISTS idx_image_metadata_price ON image_metadata(price);

-- Enable Row Level Security (RLS)
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON image_metadata
  FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update
CREATE POLICY "Allow authenticated insert" ON image_metadata
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON image_metadata
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON image_metadata
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO image_metadata (image_name, title, description, category, price, featured, in_stock) VALUES
('arduino-uno-r3-1748603951988-impc78.jpg', 'Arduino Uno R3 Development Board', 'High-quality Arduino Uno R3 development board perfect for electronics projects and prototyping. Features 14 digital I/O pins, 6 analog inputs, and USB connectivity.', 'Components', 650, true, true),
('esp32-development-board-1748603955352-1tqsnv.jpg', 'ESP32 Development Board', 'Powerful ESP32 wireless module with built-in WiFi and Bluetooth connectivity for IoT applications. Perfect for smart home projects.', 'Components', 850, true, true),
('ultrasonic-sensor-hc-sr04-1748603963344-8gl2xh.jpg', 'Ultrasonic Sensor HC-SR04', 'Precision ultrasonic sensor for accurate distance measurements. Ideal for robotics, automation, and security applications.', 'Sensors', 120, false, true),
('breadboard-830-tie-points-1748603967890-k3m9n2.jpg', 'Breadboard 830 Tie Points', 'High-quality solderless breadboard with 830 tie points for prototyping electronic circuits. Durable and reusable.', 'Components', 85, false, true),
('jumper-wires-male-to-male-1748603972456-p7q8r4.jpg', 'Jumper Wires Male to Male', 'Set of 40 flexible jumper wires for connecting components on breadboards and development boards.', 'Accessories', 45, false, true)
ON CONFLICT (image_name) DO NOTHING;

-- Verify the table was created
SELECT 'Table created successfully!' as status;
SELECT COUNT(*) as sample_records_count FROM image_metadata;
