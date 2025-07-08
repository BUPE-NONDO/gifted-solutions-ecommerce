#!/usr/bin/env node

/**
 * Supabase Storage Setup Script
 * 
 * This script sets up Supabase storage for the Gifted Solutions project.
 * It creates the necessary bucket, policies, and folder structure.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const STORAGE_BUCKET = process.env.VITE_STORAGE_BUCKET || 'product-images';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}${colors.bright}🚀 ${msg}${colors.reset}`),
  step: (msg) => console.log(`${colors.magenta}📦 ${msg}${colors.reset}`)
};

// Validate environment variables
function validateEnvironment() {
  log.step('Validating environment variables...');
  
  if (!SUPABASE_URL) {
    log.error('VITE_SUPABASE_URL is not set in .env file');
    return false;
  }
  
  if (!SUPABASE_ANON_KEY) {
    log.error('VITE_SUPABASE_ANON_KEY is not set in .env file');
    return false;
  }
  
  log.success('Environment variables validated');
  log.info(`Supabase URL: ${SUPABASE_URL}`);
  log.info(`Storage Bucket: ${STORAGE_BUCKET}`);
  
  return true;
}

// Create Supabase client
function createSupabaseClient() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    log.success('Supabase client created');
    return supabase;
  } catch (error) {
    log.error(`Failed to create Supabase client: ${error.message}`);
    return null;
  }
}

// Test connection
async function testConnection(supabase) {
  log.step('Testing Supabase connection...');
  
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      log.error(`Connection test failed: ${error.message}`);
      return false;
    }
    
    log.success('Connection test passed');
    log.info(`Found ${data.length} existing buckets: ${data.map(b => b.name).join(', ')}`);
    
    return true;
  } catch (error) {
    log.error(`Connection test failed: ${error.message}`);
    return false;
  }
}

// Create storage bucket
async function createStorageBucket(supabase) {
  log.step(`Creating storage bucket: ${STORAGE_BUCKET}...`);
  
  try {
    const { data, error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error) {
      if (error.message.includes('already exists')) {
        log.warning('Storage bucket already exists');
        return true;
      } else {
        log.error(`Failed to create bucket: ${error.message}`);
        return false;
      }
    }
    
    log.success('Storage bucket created successfully');
    return true;
  } catch (error) {
    log.error(`Failed to create bucket: ${error.message}`);
    return false;
  }
}

// Create folder structure
async function createFolderStructure(supabase) {
  log.step('Creating folder structure...');
  
  const folders = ['products', 'categories', 'banners', 'temp'];
  
  for (const folder of folders) {
    try {
      // Create a placeholder file to establish folder structure
      const placeholderContent = new Blob(['# Placeholder file for folder structure'], { type: 'text/plain' });
      
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(`${folder}/.gitkeep`, placeholderContent, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error && !error.message.includes('already exists')) {
        log.warning(`Could not create folder ${folder}: ${error.message}`);
      } else {
        log.success(`Folder ${folder} ready`);
      }
    } catch (error) {
      log.warning(`Folder creation warning for ${folder}: ${error.message}`);
    }
  }
  
  return true;
}

// Generate SQL policies
function generatePolicies() {
  log.step('Generating storage policies...');
  
  const policies = [
    {
      name: 'Public read access',
      sql: `CREATE POLICY "Public read access" ON storage.objects FOR SELECT USING (bucket_id = '${STORAGE_BUCKET}');`
    },
    {
      name: 'Authenticated upload access',
      sql: `CREATE POLICY "Authenticated upload access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = '${STORAGE_BUCKET}' AND auth.role() = 'authenticated');`
    },
    {
      name: 'Authenticated delete access',
      sql: `CREATE POLICY "Authenticated delete access" ON storage.objects FOR DELETE USING (bucket_id = '${STORAGE_BUCKET}' AND auth.role() = 'authenticated');`
    },
    {
      name: 'Authenticated update access',
      sql: `CREATE POLICY "Authenticated update access" ON storage.objects FOR UPDATE USING (bucket_id = '${STORAGE_BUCKET}' AND auth.role() = 'authenticated');`
    }
  ];
  
  log.info('Required storage policies:');
  console.log('\n' + colors.cyan + '--- SQL POLICIES ---' + colors.reset);
  policies.forEach(policy => {
    console.log(`-- ${policy.name}`);
    console.log(policy.sql);
    console.log('');
  });
  console.log(colors.cyan + '--- END SQL POLICIES ---' + colors.reset + '\n');
  
  log.warning('These policies need to be added manually in the Supabase Dashboard');
  log.info('Go to: Dashboard → Storage → Policies → Add Policy');
  
  return policies;
}

// Main setup function
async function runSetup() {
  log.header('Supabase Storage Setup for Gifted Solutions');
  console.log('');
  
  // Step 1: Validate environment
  if (!validateEnvironment()) {
    process.exit(1);
  }
  
  // Step 2: Create client
  const supabase = createSupabaseClient();
  if (!supabase) {
    process.exit(1);
  }
  
  // Step 3: Test connection
  if (!(await testConnection(supabase))) {
    process.exit(1);
  }
  
  // Step 4: Create bucket
  if (!(await createStorageBucket(supabase))) {
    process.exit(1);
  }
  
  // Step 5: Create folder structure
  if (!(await createFolderStructure(supabase))) {
    process.exit(1);
  }
  
  // Step 6: Generate policies
  const policies = generatePolicies();
  
  // Final summary
  console.log('');
  log.header('Setup Complete!');
  log.success('Supabase storage is ready for image management');
  log.info('Next steps:');
  console.log('  1. Add the SQL policies shown above to your Supabase dashboard');
  console.log('  2. Visit /supabase-storage-setup in your app to test the setup');
  console.log('  3. Use /admin-image-manager-new to upload and manage images');
  console.log('');
  log.info('Useful URLs:');
  console.log(`  • Supabase Dashboard: https://supabase.com/dashboard`);
  console.log(`  • Setup Test: ${process.env.VITE_APP_URL || 'http://localhost:5173'}/supabase-storage-setup`);
  console.log(`  • Image Manager: ${process.env.VITE_APP_URL || 'http://localhost:5173'}/admin-image-manager-new`);
}

// Run the setup
runSetup().catch(error => {
  log.error(`Setup failed: ${error.message}`);
  process.exit(1);
});
