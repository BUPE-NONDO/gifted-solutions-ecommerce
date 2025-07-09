import { supabase, createBucket, STORAGE_BUCKET } from '../lib/supabase';

// Setup Supabase storage bucket and policies
export const setupSupabaseStorage = async () => {
  console.log('🚀 Setting up Supabase storage...');
  
  try {
    // Step 1: Create storage bucket
    console.log('📦 Creating storage bucket...');
    const bucketResult = await createBucket();
    
    if (bucketResult.success) {
      console.log('✅ Storage bucket created successfully');
    } else {
      console.log('ℹ️ Storage bucket already exists or creation failed:', bucketResult.error);
    }

    // Step 2: Set up storage policies (requires admin access)
    console.log('🔐 Setting up storage policies...');
    
    // Note: These policies need to be set up in Supabase dashboard or via admin API
    const policies = [
      {
        name: 'Public read access',
        definition: 'Allow public read access to all files',
        sql: `
          CREATE POLICY "Public read access" ON storage.objects
          FOR SELECT USING (bucket_id = '${STORAGE_BUCKET}');
        `
      },
      {
        name: 'Authenticated upload access',
        definition: 'Allow authenticated users to upload files',
        sql: `
          CREATE POLICY "Authenticated upload access" ON storage.objects
          FOR INSERT WITH CHECK (bucket_id = '${STORAGE_BUCKET}' AND auth.role() = 'authenticated');
        `
      },
      {
        name: 'Authenticated delete access',
        definition: 'Allow authenticated users to delete files',
        sql: `
          CREATE POLICY "Authenticated delete access" ON storage.objects
          FOR DELETE USING (bucket_id = '${STORAGE_BUCKET}' AND auth.role() = 'authenticated');
        `
      }
    ];

    console.log('📋 Required storage policies:');
    policies.forEach(policy => {
      console.log(`- ${policy.name}: ${policy.definition}`);
    });

    // Step 3: Test storage access
    console.log('🧪 Testing storage access...');
    
    // Test listing files
    const { data: files, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', { limit: 1 });

    if (listError) {
      console.error('❌ Storage list test failed:', listError.message);
      return {
        success: false,
        error: 'Storage access test failed: ' + listError.message,
        setupRequired: true
      };
    }

    console.log('✅ Storage access test passed');

    // Step 4: Create folder structure
    console.log('📁 Creating folder structure...');
    const folders = ['products', 'categories', 'banners', 'temp'];
    
    for (const folder of folders) {
      try {
        // Create a placeholder file to establish folder structure
        const placeholderContent = new Blob(['# Placeholder file for folder structure'], { type: 'text/plain' });
        
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(`${folder}/.gitkeep`, placeholderContent, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError && !uploadError.message.includes('already exists')) {
          console.warn(`⚠️ Could not create folder ${folder}:`, uploadError.message);
        } else {
          console.log(`✅ Folder ${folder} ready`);
        }
      } catch (error) {
        console.warn(`⚠️ Folder creation warning for ${folder}:`, error.message);
      }
    }

    console.log('🎉 Supabase storage setup completed successfully!');
    
    return {
      success: true,
      message: 'Supabase storage setup completed',
      bucket: STORAGE_BUCKET,
      folders: folders
    };

  } catch (error) {
    console.error('❌ Supabase setup failed:', error);
    return {
      success: false,
      error: error.message,
      setupRequired: true
    };
  }
};

// Test storage connection
export const testStorageConnection = async () => {
  try {
    console.log('🔍 Testing Supabase storage connection...');
    
    // Test basic connection
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      throw new Error('Connection failed: ' + error.message);
    }

    const bucketExists = data.some(bucket => bucket.name === STORAGE_BUCKET);
    
    console.log('📊 Connection test results:');
    console.log(`- Supabase URL: ${supabase.supabaseUrl}`);
    console.log(`- Storage bucket: ${STORAGE_BUCKET}`);
    console.log(`- Bucket exists: ${bucketExists ? '✅' : '❌'}`);
    console.log(`- Available buckets: ${data.map(b => b.name).join(', ')}`);

    return {
      success: true,
      connected: true,
      bucketExists,
      buckets: data.map(b => b.name)
    };

  } catch (error) {
    console.error('❌ Storage connection test failed:', error);
    return {
      success: false,
      connected: false,
      error: error.message
    };
  }
};

// Generate storage setup commands for manual execution
export const generateSetupCommands = () => {
  const commands = {
    sql: [
      `-- Create storage bucket policies for ${STORAGE_BUCKET}`,
      '',
      '-- Enable public read access',
      `CREATE POLICY "Public read access" ON storage.objects`,
      `FOR SELECT USING (bucket_id = '${STORAGE_BUCKET}');`,
      '',
      '-- Enable authenticated upload access',
      `CREATE POLICY "Authenticated upload access" ON storage.objects`,
      `FOR INSERT WITH CHECK (bucket_id = '${STORAGE_BUCKET}' AND auth.role() = 'authenticated');`,
      '',
      '-- Enable authenticated delete access',
      `CREATE POLICY "Authenticated delete access" ON storage.objects`,
      `FOR DELETE USING (bucket_id = '${STORAGE_BUCKET}' AND auth.role() = 'authenticated');`,
      '',
      '-- Enable authenticated update access',
      `CREATE POLICY "Authenticated update access" ON storage.objects`,
      `FOR UPDATE USING (bucket_id = '${STORAGE_BUCKET}' AND auth.role() = 'authenticated');`
    ].join('\n'),
    
    dashboard: [
      '1. Go to Supabase Dashboard → Storage',
      '2. Create bucket: ' + STORAGE_BUCKET,
      '3. Set bucket to Public',
      '4. Go to Storage → Policies',
      '5. Add the SQL policies above',
      '6. Test upload functionality'
    ]
  };

  return commands;
};

// Main setup function
export const runSupabaseSetup = async () => {
  console.log('🎯 Starting Supabase storage setup...');
  
  // Test connection first
  const connectionTest = await testStorageConnection();
  if (!connectionTest.success) {
    return connectionTest;
  }

  // Run setup
  const setupResult = await setupSupabaseStorage();
  
  if (!setupResult.success && setupResult.setupRequired) {
    const commands = generateSetupCommands();
    console.log('\n📋 Manual setup required:');
    console.log('\n🔧 SQL Commands:');
    console.log(commands.sql);
    console.log('\n📱 Dashboard Steps:');
    commands.dashboard.forEach(step => console.log(step));
  }

  return setupResult;
};

export default {
  setupSupabaseStorage,
  testStorageConnection,
  generateSetupCommands,
  runSupabaseSetup
};
