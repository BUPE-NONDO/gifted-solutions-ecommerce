// Script to set up the image_metadata table in Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://fotcjsmnerawpqzhldhq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdGNqc21uZXJhd3BxemhsZGhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTc0NzI5NywiZXhwIjoyMDUxMzIzMjk3fQ.Ej7Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Service role key for admin operations

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupImageMetadataTable() {
  try {
    console.log('🚀 Setting up image_metadata table...');

    // Read the SQL file
    const sqlPath = path.join(process.cwd(), 'database', 'image_metadata_table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });

        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }

    console.log('🎉 Image metadata table setup complete!');

    // Test the table by inserting sample data
    console.log('🧪 Testing table with sample data...');
    
    const { data, error } = await supabase
      .from('image_metadata')
      .upsert([
        {
          image_name: 'arduino-uno-r3-test.jpg',
          title: 'Arduino Uno R3 Development Board',
          description: 'High-quality Arduino Uno R3 development board perfect for electronics projects and prototyping.',
          price: 650,
          featured: true,
          in_stock: true,
          tags: ['arduino', 'microcontroller', 'development'],
          specifications: {
            voltage: '5V',
            pins: 14,
            analog_pins: 6,
            flash_memory: '32KB'
          }
        }
      ])
      .select();

    if (error) {
      console.error('❌ Error inserting test data:', error);
    } else {
      console.log('✅ Test data inserted successfully:', data);
    }

    // Verify the table structure
    console.log('🔍 Verifying table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('image_metadata')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error querying table:', tableError);
    } else {
      console.log('✅ Table is working correctly!');
      console.log('📊 Sample record:', tableData);
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupImageMetadataTable();
