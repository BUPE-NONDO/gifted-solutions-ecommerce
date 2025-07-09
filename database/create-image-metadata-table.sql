-- Simple SQL to create image_metadata table
-- Run this in Supabase SQL Editor

-- Create the table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_image_metadata_image_name ON image_metadata(image_name);
CREATE INDEX IF NOT EXISTS idx_image_metadata_featured ON image_metadata(featured);
CREATE INDEX IF NOT EXISTS idx_image_metadata_price ON image_metadata(price);

-- Enable RLS
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for everyone" ON image_metadata FOR SELECT USING (true);
CREATE POLICY "Allow all operations for authenticated users" ON image_metadata FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO image_metadata (image_name, title, description, price, featured, in_stock) VALUES
('arduino-uno-r3-1748603951988-impc78.jpg', 'Arduino Uno R3 Development Board', 'High-quality Arduino Uno R3 development board perfect for electronics projects and prototyping. Features 14 digital I/O pins, 6 analog inputs, and USB connectivity.', 650, true, true),
('esp32-development-board-1748603955352-1tqsnv.jpg', 'ESP32 Development Board', 'Powerful ESP32 wireless module with built-in WiFi and Bluetooth connectivity for IoT applications. Perfect for smart home projects.', 850, true, true),
('ultrasonic-sensor-hc-sr04-1748603963344-8gl2xh.jpg', 'Ultrasonic Sensor HC-SR04', 'Precision ultrasonic distance sensor for accurate measurements up to 4 meters. Ideal for robotics and automation projects.', 120, false, true),
('breadboard-1748603978848-arhihy.jpg', 'Solderless Breadboard', 'Essential 830-point solderless breadboard for prototyping electronic circuits. High-quality contacts ensure reliable connections.', 45, false, true)
ON CONFLICT (image_name) DO NOTHING;
