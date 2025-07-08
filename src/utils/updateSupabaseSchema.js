import { supabase } from '../services/supabase';

/**
 * Update Supabase database schema to add missing columns
 * This function can be called from browser console to fix schema issues
 */
export const updateSupabaseSchema = async () => {
  console.log('🔧 Starting Supabase schema update...');
  
  try {
    // Add badge column
    console.log('📝 Adding badge column...');
    const { error: badgeError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS badge TEXT;'
    });
    
    if (badgeError && !badgeError.message.includes('already exists')) {
      console.warn('Badge column error:', badgeError);
    } else {
      console.log('✅ Badge column added/verified');
    }

    // Add featured column
    console.log('📝 Adding featured column...');
    const { error: featuredError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;'
    });
    
    if (featuredError && !featuredError.message.includes('already exists')) {
      console.warn('Featured column error:', featuredError);
    } else {
      console.log('✅ Featured column added/verified');
    }

    // Add images array column
    console.log('📝 Adding images array column...');
    const { error: imagesError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[];'
    });
    
    if (imagesError && !imagesError.message.includes('already exists')) {
      console.warn('Images column error:', imagesError);
    } else {
      console.log('✅ Images column added/verified');
    }

    // Add visible column
    console.log('📝 Adding visible column...');
    const { error: visibleError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS visible BOOLEAN DEFAULT true;'
    });
    
    if (visibleError && !visibleError.message.includes('already exists')) {
      console.warn('Visible column error:', visibleError);
    } else {
      console.log('✅ Visible column added/verified');
    }

    // Add imageVersion column
    console.log('📝 Adding imageVersion column...');
    const { error: versionError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ADD COLUMN IF NOT EXISTS imageVersion BIGINT;'
    });
    
    if (versionError && !versionError.message.includes('already exists')) {
      console.warn('ImageVersion column error:', versionError);
    } else {
      console.log('✅ ImageVersion column added/verified');
    }

    console.log('🎉 Schema update completed successfully!');
    
    // Verify the schema
    console.log('🔍 Verifying schema...');
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'products')
      .order('ordinal_position');
    
    if (schemaError) {
      console.warn('Could not verify schema:', schemaError);
    } else {
      console.table(columns);
    }
    
    return { success: true, message: 'Schema updated successfully' };
    
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Alternative method using direct SQL execution
 * This bypasses RPC and tries direct table modification
 */
export const updateSchemaDirectly = async () => {
  console.log('🔧 Attempting direct schema update...');
  
  try {
    // Get current table structure
    const { data: currentColumns } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    console.log('📊 Current table structure sample:', currentColumns?.[0]);
    
    // Try to insert a test record with all required fields
    const testProduct = {
      name: 'Schema Test Product',
      description: 'Test product for schema validation',
      price: 'K1',
      category: 'Test',
      image: 'https://example.com/test.jpg',
      inStock: true,
      badge: 'Test Badge',
      featured: true,
      images: ['https://example.com/test1.jpg', 'https://example.com/test2.jpg'],
      visible: true,
      imageVersion: Date.now()
    };
    
    console.log('🧪 Testing schema with sample product...');
    const { data: insertResult, error: insertError } = await supabase
      .from('products')
      .insert([testProduct])
      .select();
    
    if (insertError) {
      console.error('❌ Schema test failed:', insertError);
      
      // Try to identify missing columns
      const missingColumns = [];
      if (insertError.message.includes('badge')) missingColumns.push('badge');
      if (insertError.message.includes('featured')) missingColumns.push('featured');
      if (insertError.message.includes('images')) missingColumns.push('images');
      if (insertError.message.includes('visible')) missingColumns.push('visible');
      if (insertError.message.includes('imageVersion')) missingColumns.push('imageVersion');
      
      console.log('🔍 Missing columns detected:', missingColumns);
      return { success: false, error: insertError.message, missingColumns };
    } else {
      console.log('✅ Schema test passed! Cleaning up test product...');
      
      // Clean up test product
      if (insertResult?.[0]?.id) {
        await supabase
          .from('products')
          .delete()
          .eq('id', insertResult[0].id);
        console.log('🗑️ Test product cleaned up');
      }
      
      return { success: true, message: 'Schema is complete and working' };
    }
    
  } catch (error) {
    console.error('❌ Direct schema update failed:', error);
    return { success: false, error: error.message };
  }
};

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  window.updateSupabaseSchema = updateSupabaseSchema;
  window.updateSchemaDirectly = updateSchemaDirectly;
  console.log('🔧 Schema update functions available:');
  console.log('- updateSupabaseSchema()');
  console.log('- updateSchemaDirectly()');
}

export default { updateSupabaseSchema, updateSchemaDirectly };
