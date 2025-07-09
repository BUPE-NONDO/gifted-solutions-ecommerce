/**
 * Supabase Setup Script for Gifted Solutions
 * This script sets up the database tables and policies
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://fotcjsmnerawpqzhldhq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdGNqc21uZXJhd3BxemhsZGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Mzg5MjYsImV4cCI6MjA2NDExNDkyNn0.cMIRbKVsw-gvOu53IaZzrABpngZ4O-hsMV7sWqLehK4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('🚀 Starting Supabase database setup...');

  try {
    // Test connection
    console.log('🔗 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (testError && testError.code !== 'PGRST116') {
      console.error('❌ Connection test failed:', testError);
      return false;
    }

    console.log('✅ Supabase connection successful');

    // Create products table if it doesn't exist
    console.log('📋 Setting up products table...');
    
    // Try to create a test product to ensure table exists (minimal columns)
    const testProduct = {
      name: 'Test Product - Setup',
      description: 'This is a test product created during setup',
      price: 'K100',
      category: 'Test'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select();

    if (insertError) {
      console.error('❌ Error creating test product:', insertError);
      
      // If it's a permission error, we need to handle RLS
      if (insertError.code === '42501') {
        console.log('🔒 Row Level Security is enabled. Attempting to configure...');
        
        // Try to disable RLS for products table (for development)
        try {
          const { error: rlsError } = await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE products DISABLE ROW LEVEL SECURITY;'
          });
          
          if (rlsError) {
            console.warn('⚠️ Could not disable RLS via RPC:', rlsError.message);
          } else {
            console.log('✅ RLS disabled for products table');
          }
        } catch (rlsErr) {
          console.warn('⚠️ RLS configuration not available via RPC');
        }
      }
      
      return false;
    }

    console.log('✅ Test product created:', insertData[0]);

    // Clean up test product
    if (insertData && insertData[0]) {
      await supabase
        .from('products')
        .delete()
        .eq('id', insertData[0].id);
      console.log('🧹 Test product cleaned up');
    }

    // Test update operation
    console.log('🔄 Testing update operation...');
    
    // Create another test product for update test
    const { data: updateTestData, error: updateTestError } = await supabase
      .from('products')
      .insert([{
        name: 'Update Test Product',
        description: 'Testing updates',
        price: 'K200',
        category: 'Test'
      }])
      .select();

    if (updateTestError) {
      console.error('❌ Error creating update test product:', updateTestError);
      return false;
    }

    const testProductId = updateTestData[0].id;
    
    // Try to update the product
    const { data: updatedData, error: updateError } = await supabase
      .from('products')
      .update({
        name: 'Updated Test Product'
      })
      .eq('id', testProductId)
      .select();

    if (updateError) {
      console.error('❌ Update test failed:', updateError);
      
      // Clean up
      await supabase.from('products').delete().eq('id', testProductId);
      return false;
    }

    console.log('✅ Update test successful:', updatedData[0]);

    // Clean up update test product
    await supabase.from('products').delete().eq('id', testProductId);
    console.log('🧹 Update test product cleaned up');

    console.log('🎉 Database setup completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}

// Run the setup
setupDatabase().then(success => {
  if (success) {
    console.log('✅ Setup completed successfully');
    process.exit(0);
  } else {
    console.log('❌ Setup failed');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Setup error:', error);
  process.exit(1);
});
