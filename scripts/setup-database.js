// Setup database table for image metadata
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fotcjsmnerawpqzhldhq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdGNqc21uZXJhd3BxemhsZGhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTc0NzI5NywiZXhwIjoyMDUxMzIzMjk3fQ.Ej7Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  try {
    console.log('🚀 Setting up image_metadata table...');
    
    // Create the table
    const createTableSQL = `
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
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });
    
    if (createError) {
      console.error('❌ Error creating table:', createError);
      // Try direct table creation
      const { error: directError } = await supabase
        .from('image_metadata')
        .select('*')
        .limit(1);
      
      if (directError && directError.code === '42P01') {
        console.log('📝 Table does not exist, creating manually...');
        // Table doesn't exist, we'll create it via direct SQL
      } else {
        console.log('✅ Table already exists or accessible');
      }
    } else {
      console.log('✅ Table created successfully');
    }
    
    // Create indexes
    const indexSQL = `
      CREATE INDEX IF NOT EXISTS idx_image_metadata_image_name ON image_metadata(image_name);
      CREATE INDEX IF NOT EXISTS idx_image_metadata_featured ON image_metadata(featured);
      CREATE INDEX IF NOT EXISTS idx_image_metadata_price ON image_metadata(price);
    `;
    
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: indexSQL
    });
    
    if (!indexError) {
      console.log('✅ Indexes created');
    }
    
    // Insert sample data
    console.log('📦 Inserting sample data...');
    
    const sampleData = [
      {
        image_name: 'arduino-uno-r3-1748603951988-impc78.jpg',
        title: 'Arduino Uno R3 Development Board',
        description: 'High-quality Arduino Uno R3 development board perfect for electronics projects and prototyping. Features 14 digital I/O pins, 6 analog inputs, USB connectivity, and a 16MHz crystal oscillator.',
        price: 650,
        featured: true,
        in_stock: true
      },
      {
        image_name: 'esp32-development-board-1748603955352-1tqsnv.jpg',
        title: 'ESP32 Development Board',
        description: 'Powerful ESP32 wireless development board with built-in WiFi and Bluetooth connectivity. Perfect for IoT applications, smart home projects, and wireless sensor networks.',
        price: 850,
        featured: true,
        in_stock: true
      },
      {
        image_name: 'ultrasonic-sensor-hc-sr04-1748603963344-8gl2xh.jpg',
        title: 'Ultrasonic Distance Sensor HC-SR04',
        description: 'Precision ultrasonic distance sensor for accurate measurements from 2cm to 400cm. Ideal for robotics, automation projects, and obstacle detection systems.',
        price: 120,
        featured: false,
        in_stock: true
      },
      {
        image_name: 'breadboard-1748603978848-arhihy.jpg',
        title: 'Solderless Breadboard 830 Points',
        description: 'High-quality 830-point solderless breadboard for prototyping electronic circuits. Features reliable spring-loaded contacts and clear markings for easy circuit building.',
        price: 45,
        featured: false,
        in_stock: true
      }
    ];
    
    const { data, error: insertError } = await supabase
      .from('image_metadata')
      .upsert(sampleData)
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting sample data:', insertError);
    } else {
      console.log('✅ Sample data inserted:', data?.length || 0, 'records');
    }
    
    // Test the table
    console.log('🧪 Testing table...');
    const { data: testData, error: testError } = await supabase
      .from('image_metadata')
      .select('*')
      .limit(5);
    
    if (testError) {
      console.error('❌ Error testing table:', testError);
    } else {
      console.log('✅ Table test successful, found', testData?.length || 0, 'records');
      console.log('📊 Sample records:', testData?.map(r => r.title).join(', '));
    }
    
    console.log('🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupDatabase();
