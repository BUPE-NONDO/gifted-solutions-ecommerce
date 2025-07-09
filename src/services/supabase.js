import { createClient } from '@supabase/supabase-js'
import { vercelBlobService } from './vercelBlobService.js'

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fotcjsmnerawpqzhldhq.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdGNqc21uZXJhd3BxemhsZGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Mzg5MjYsImV4cCI6MjA2NDExNDkyNn0.cMIRbKVsw-gvOu53IaZzrABpngZ4O-hsMV7sWqLehK4'

// Database connection string (for server-side operations)
export const DATABASE_URL = 'postgresql://postgres:[YOUR-PASSWORD]@db.fotcjsmnerawpqzhldhq.supabase.co:5432/postgres'

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-my-custom-header': 'gifted-solutions'
    }
  }
})

// Storage bucket name from environment variables
export const STORAGE_BUCKET = import.meta.env.VITE_STORAGE_BUCKET || 'product-images'

/**
 * Supabase Service for Gifted Solutions
 * Handles both storage and database operations with built-in CORS support
 */
class SupabaseService {
  constructor() {
    this.bucket = STORAGE_BUCKET
  }

  // ==================== HELPER METHODS ====================

  /**
   * Extract numeric value from price string (e.g., "K100" -> 100)
   */
  extractNumericPrice(price) {
    if (typeof price === 'number') {
      return price;
    }

    if (typeof price === 'string') {
      // Remove currency symbols and extract number
      const numericValue = price.replace(/[^\d.]/g, '');
      const parsed = parseFloat(numericValue);
      return isNaN(parsed) ? 0 : parsed;
    }

    return 0;
  }

  /**
   * Format price for display (e.g., 100 -> "K100")
   */
  formatPrice(price) {
    if (typeof price === 'number') {
      return `K${price}`;
    }

    if (typeof price === 'string' && !price.startsWith('K')) {
      const numericValue = this.extractNumericPrice(price);
      return `K${numericValue}`;
    }

    return price || 'K0';
  }

  // ==================== DATABASE METHODS ====================

  /**
   * Get all products from Supabase (alternative to Firebase)
   */
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        // Handle missing column errors gracefully
        if (error.message.includes('badge') || error.message.includes('featured') || error.message.includes('images')) {
          console.warn('⚠️ Database schema missing columns. Attempting basic query...');

          // Try with basic columns only
          const { data: basicData, error: basicError } = await supabase
            .from('products')
            .select('id, name, description, price, category, image, inStock, created_at, updated_at')
            .order('created_at', { ascending: false })

          if (basicError) throw basicError

          // Add default values for missing columns
          return basicData.map(product => ({
            ...product,
            price: this.formatPrice(product.price), // Format price for display
            badge: null,
            featured: false,
            images: [],
            visible: true,
            imageVersion: Date.now()
          }))
        }
        throw error
      }

      // Ensure all products have required fields with defaults
      return data.map(product => ({
        ...product,
        price: this.formatPrice(product.price), // Format price for display
        badge: product.badge || null,
        featured: product.featured || false,
        images: product.images || [],
        visible: product.visible !== undefined ? product.visible : true,
        imageVersion: product.imageVersion || Date.now()
      }))
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  /**
   * Initialize database tables for orders and tracking
   */
  async initializeOrderTables() {
    try {
      console.log('🚀 Initializing order and tracking tables...');

      // Create orders table
      const createOrdersTable = `
        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          order_number VARCHAR(50) UNIQUE NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(50),
          payment_status VARCHAR(50) DEFAULT 'pending',
          payment_reference VARCHAR(255),
          total_amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(10) DEFAULT 'ZMW',
          customer_details JSONB,
          items JSONB NOT NULL,
          shipping_address JSONB,
          tracking_number VARCHAR(100),
          tracking_status VARCHAR(50) DEFAULT 'order_placed',
          tracking_updates JSONB DEFAULT '[]'::jsonb,
          estimated_delivery DATE,
          actual_delivery DATE,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;

      // Create package_tracking table for detailed tracking
      const createTrackingTable = `
        CREATE TABLE IF NOT EXISTS package_tracking (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          tracking_number VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL,
          location VARCHAR(255),
          description TEXT,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_by VARCHAR(255),
          is_public BOOLEAN DEFAULT true
        );
      `;

      // Create indexes for better performance
      const createIndexes = `
        CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
        CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
        CREATE INDEX IF NOT EXISTS idx_tracking_order_id ON package_tracking(order_id);
        CREATE INDEX IF NOT EXISTS idx_tracking_number ON package_tracking(tracking_number);
      `;

      // Execute table creation
      const { error: ordersError } = await supabase.rpc('exec_sql', { sql: createOrdersTable });
      if (ordersError) throw ordersError;

      const { error: trackingError } = await supabase.rpc('exec_sql', { sql: createTrackingTable });
      if (trackingError) throw trackingError;

      const { error: indexError } = await supabase.rpc('exec_sql', { sql: createIndexes });
      if (indexError) throw indexError;

      console.log('✅ Order and tracking tables initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing order tables:', error);
      throw error;
    }
  }

  /**
   * Create a new order
   */
  async createOrder(orderData) {
    try {
      console.log('🚀 Creating new order:', orderData);

      const orderNumber = `GS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const order = {
        user_id: orderData.userId,
        user_email: orderData.userEmail,
        order_number: orderNumber,
        status: 'pending',
        payment_method: orderData.paymentMethod,
        payment_status: orderData.paymentStatus || 'pending',
        payment_reference: orderData.paymentReference,
        total_amount: orderData.totalAmount,
        currency: orderData.currency || 'ZMW',
        customer_details: orderData.customerDetails,
        items: orderData.items,
        shipping_address: orderData.shippingAddress,
        tracking_number: this.generateTrackingNumber(),
        tracking_status: 'order_placed',
        tracking_updates: [{
          status: 'order_placed',
          description: 'Order has been placed and is being processed',
          timestamp: new Date().toISOString(),
          location: 'Lusaka, Zambia'
        }],
        estimated_delivery: this.calculateEstimatedDelivery(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([order])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Order created successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  }

  /**
   * Add product to Supabase database
   */
  async addProduct(product) {
    try {
      console.log('🚀 Adding product to Supabase:', product);

      // Validate required fields
      if (!product.name || !product.price) {
        throw new Error('Product name and price are required');
      }

      // Prepare product with safe defaults - only basic columns
      const safeProduct = {
        name: product.name.trim(),
        description: product.description?.trim() || '',
        price: this.extractNumericPrice(product.price),
        category: product.category?.trim() || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add optional columns only if they exist in the schema
      if (product.image) {
        safeProduct.image = product.image.trim();
      }
      if (product.inStock !== undefined) {
        safeProduct.inStock = product.inStock;
      }

      console.log('📝 Prepared safe product data:', safeProduct);

      // First, try with just the basic required columns
      const { data, error } = await supabase
        .from('products')
        .insert([safeProduct])
        .select();

      if (error) {
        console.error('❌ Supabase insert error:', error);
        throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from insert operation');
      }

      const insertedProduct = data[0];
      console.log('✅ Product successfully added to Supabase:', insertedProduct);

      // Return the product with additional fields for compatibility
      return {
        ...insertedProduct,
        badge: product.badge || null,
        featured: product.featured || false,
        images: product.images || [],
        visible: product.visible !== undefined ? product.visible : true,
        imageVersion: product.imageVersion || Date.now()
      };

    } catch (error) {
      console.error('❌ Error adding product:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        product: product
      });

      // Re-throw with more context
      throw new Error(`Failed to add product: ${error.message}`);
    }
  }

  /**
   * Update product in Supabase database
   */
  async updateProduct(id, updates) {
    try {
      console.log('🔄 Supabase updateProduct called:', { id, updates });

      // Ensure we have a valid ID
      if (!id) {
        throw new Error('Product ID is required for update');
      }

      // Clean the updates object and handle special cases
      const cleanUpdates = {};
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined && updates[key] !== null) {
          // Handle price field specially - convert to numeric
          if (key === 'price') {
            cleanUpdates[key] = this.extractNumericPrice(updates[key]);
          } else {
            cleanUpdates[key] = updates[key];
          }
        }
      });

      // Add updated_at timestamp
      cleanUpdates.updated_at = new Date().toISOString();

      console.log('📝 Clean updates for Supabase:', cleanUpdates);

      // First, check if the product exists
      const { data: existingProduct, error: checkError } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .single();

      if (checkError) {
        console.error('❌ Error checking product existence:', checkError);
        if (checkError.code === 'PGRST116') {
          throw new Error(`Product with ID ${id} not found`);
        }
        throw checkError;
      }

      console.log('✅ Product exists, proceeding with update...');

      // Perform the update
      const { data, error } = await supabase
        .from('products')
        .update(cleanUpdates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Supabase update error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });

        // Handle specific error cases
        if (error.code === '42501') {
          throw new Error('Permission denied. Please check Row Level Security policies.');
        } else if (error.code === '23505') {
          throw new Error('Duplicate value error. Please check unique constraints.');
        } else {
          throw new Error(`Database error: ${error.message}`);
        }
      }

      if (!data || data.length === 0) {
        throw new Error(`Update operation completed but no data returned for ID: ${id}`);
      }

      console.log('✅ Supabase update successful:', data[0]);
      return data[0];
    } catch (error) {
      console.error('❌ Error updating product in Supabase:', {
        message: error.message,
        stack: error.stack,
        id,
        updates
      });
      throw error;
    }
  }

  /**
   * Delete product from Supabase database
   */
  async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  // ==================== SITE SETTINGS METHODS ====================

  /**
   * Get site settings from Supabase
   */
  async getSiteSettings() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
      return data
    } catch (error) {
      console.error('Error getting site settings:', error)
      return null // Return null if no settings found
    }
  }

  /**
   * Update site settings in Supabase
   */
  async updateSiteSettings(settings) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .upsert(settings)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating site settings:', error)
      throw error
    }
  }

  /**
   * Get page content from Supabase
   */
  async getPageContent(pageId) {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_id', pageId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error getting page content:', error)
      return null
    }
  }

  /**
   * Update page content in Supabase
   */
  async updatePageContent(pageId, content) {
    try {
      const { data, error } = await supabase
        .from('page_content')
        .upsert({ page_id: pageId, ...content })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating page content:', error)
      throw error
    }
  }

  /**
   * Initialize database tables if they don't exist
   */
  async initializeTables() {
    try {
      // Check if products table exists and has correct structure
      const { data, error: tableError } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (tableError && tableError.code === 'PGRST116') {
        console.log('📋 Products table does not exist, it will be created automatically on first insert');
      } else if (tableError) {
        console.error('Error checking products table:', tableError);
      } else {
        console.log('✅ Products table exists and is accessible');
      }

      // Create site_settings table
      const { error: settingsError } = await supabase.rpc('create_site_settings_table')
      if (settingsError && !settingsError.message.includes('already exists')) {
        console.error('Error creating site_settings table:', settingsError)
      }

      // Create page_content table
      const { error: contentError } = await supabase.rpc('create_page_content_table')
      if (contentError && !contentError.message.includes('already exists')) {
        console.error('Error creating page_content table:', contentError)
      }

      console.log('✅ Database tables initialized')
      return true
    } catch (error) {
      console.error('Error initializing tables:', error)
      return false
    }
  }

  /**
   * Setup database policies for public access (disable RLS for now)
   */
  async setupDatabasePolicies() {
    try {
      console.log('🔧 Setting up database policies...');

      // For now, we'll disable RLS to allow all operations
      // In production, you should create proper RLS policies
      const { error } = await supabase.rpc('disable_rls_for_products');

      if (error && !error.message.includes('does not exist')) {
        console.warn('⚠️ Could not disable RLS:', error.message);
        // This is expected if the function doesn't exist
      }

      console.log('✅ Database policies configured');
      return true;
    } catch (error) {
      console.warn('⚠️ Error setting up database policies:', error);
      // Don't fail the entire operation for this
      return true;
    }
  }

  /**
   * Create products table with proper structure
   */
  async createProductsTable() {
    try {
      console.log('🔧 Creating products table...');

      // This will create the table automatically when we insert the first product
      // Supabase creates tables automatically based on the data structure
      const testProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 'K100',
        category: 'Test',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('products')
        .insert([testProduct])
        .select();

      if (error) {
        console.error('Error creating products table:', error);
        return false;
      }

      // Delete the test product
      if (data && data[0]) {
        await supabase
          .from('products')
          .delete()
          .eq('id', data[0].id);
      }

      console.log('✅ Products table created successfully');
      return true;
    } catch (error) {
      console.error('Error creating products table:', error);
      return false;
    }
  }

  // ==================== STORAGE METHODS ====================

  /**
   * Upload image to Vercel Blob Storage
   */
  async uploadImage(file, path) {
    try {
      return await vercelBlobService.uploadImage(file, path);
    } catch (error) {
      console.error('Error uploading image to Vercel Blob:', error)
      throw error
    }
  }

  /**
   * Get public URL for image (Vercel Blob URLs are already public)
   */
  getPublicUrl(path) {
    return vercelBlobService.getPublicUrl(path);
  }

  /**
   * Delete image from Vercel Blob storage
   */
  async deleteImage(path) {
    try {
      return await vercelBlobService.deleteImage(path);
    } catch (error) {
      console.error('Error deleting image from Vercel Blob:', error)
      throw error
    }
  }

  /**
   * List images in a folder
   */
  async listImages(folder = '') {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .list(folder, {
          limit: 100,
          offset: 0
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error listing images:', error)
      throw error
    }
  }

  /**
   * Create signed URL for private images
   */
  async createSignedUrl(path, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucket)
        .createSignedUrl(path, expiresIn)

      if (error) throw error
      return data.signedUrl
    } catch (error) {
      console.error('Error creating signed URL:', error)
      throw error
    }
  }

  /**
   * Upload product image with auto-generated filename
   */
  async uploadProductImage(file, productId) {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `product-${productId || Date.now()}-${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { data, error } = await supabase.storage
        .from(this.bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const publicUrl = this.getPublicUrl(filePath)

      return {
        path: data.path,
        publicUrl,
        fileName,
        fullPath: filePath
      }
    } catch (error) {
      console.error('Error uploading product image:', error)
      throw error
    }
  }

  /**
   * Upload multiple images at once to Vercel Blob
   */
  async uploadMultipleImages(files, folder = 'uploads') {
    try {
      return await vercelBlobService.uploadMultipleImages(files, folder);
    } catch (error) {
      console.error('Error uploading multiple images to Vercel Blob:', error)
      throw error
    }
  }

  /**
   * List images - now returns empty array since we use Vercel Blob
   * Images are managed through Firebase metadata
   */
  async listImages(folder = 'products') {
    console.warn('listImages called - this method is deprecated. Use Firebase metadata service instead.');
    return [];
  }

  /**
   * Replace existing product image
   */
  async replaceProductImage(oldPath, newFile, productId) {
    try {
      // Delete old image if it exists
      if (oldPath) {
        await this.deleteImage(oldPath)
      }

      // Upload new image
      return await this.uploadProductImage(newFile, productId)
    } catch (error) {
      console.error('Error replacing product image:', error)
      throw error
    }
  }

  /**
   * Ensure image_metadata table exists
   */
  async ensureImageMetadataTable() {
    try {
      console.log('🔧 Checking if image_metadata table exists...');

      // Try to query the table to see if it exists
      const { data, error } = await supabase
        .from('image_metadata')
        .select('id')
        .limit(1);

      if (error && error.code === '42P01') {
        // Table doesn't exist, create it
        console.log('📝 Creating image_metadata table...');

        // Insert a dummy record to create the table structure
        const { error: createError } = await supabase
          .from('image_metadata')
          .insert({
            image_name: 'dummy-image.jpg',
            title: 'Dummy Product',
            description: 'This is a dummy product to create the table',
            category: 'Components',
            price: 100,
            in_stock: true,
            featured: false
          });

        if (createError) {
          console.error('❌ Error creating table:', createError);
          // Try alternative method - direct table creation
          await this.createImageMetadataTableDirect();
        } else {
          // Delete the dummy record
          await supabase
            .from('image_metadata')
            .delete()
            .eq('image_name', 'dummy-image.jpg');

          console.log('✅ image_metadata table created successfully');
        }
      } else if (error) {
        console.error('❌ Error checking table:', error);
      } else {
        console.log('✅ image_metadata table already exists');
      }

      return true;
    } catch (error) {
      console.error('❌ Error ensuring table exists:', error);
      return false;
    }
  }

  /**
   * Create image_metadata table directly
   */
  async createImageMetadataTableDirect() {
    try {
      console.log('🔧 Creating image_metadata table directly...');

      // Use the products table as a template and create image_metadata
      const sampleRecord = {
        image_name: 'sample-image.jpg',
        title: 'Sample Product',
        description: 'Sample description',
        category: 'Components',
        price: 100,
        in_stock: true,
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // This will auto-create the table with the correct structure
      const { data, error } = await supabase
        .from('image_metadata')
        .insert(sampleRecord)
        .select();

      if (error) {
        console.error('❌ Error creating table directly:', error);
        return false;
      }

      // Delete the sample record
      if (data && data[0]) {
        await supabase
          .from('image_metadata')
          .delete()
          .eq('id', data[0].id);
      }

      console.log('✅ image_metadata table created directly');
      return true;
    } catch (error) {
      console.error('❌ Error creating table directly:', error);
      return false;
    }
  }

  /**
   * Get image metadata from database
   */
  async getImageMetadata(imageName) {
    try {
      // Ensure table exists first
      await this.ensureImageMetadataTable();

      const { data, error } = await supabase
        .from('image_metadata')
        .select('*')
        .eq('image_name', imageName)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting image metadata:', error);
      return null;
    }
  }

  /**
   * Update image metadata in database
   */
  async updateImageMetadata(imageName, metadata) {
    try {
      console.log('📝 Updating image metadata in database:', { imageName, metadata });

      // Ensure table exists first
      await this.ensureImageMetadataTable();

      const { data, error } = await supabase
        .from('image_metadata')
        .upsert({
          image_name: imageName,
          title: metadata.title,
          description: metadata.description,
          category: metadata.category,
          price: metadata.price,
          in_stock: metadata.inStock,
          featured: metadata.featured,
          tags: metadata.tags,
          specifications: metadata.specifications,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Successfully updated image metadata in database:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating image metadata:', error);
      throw error;
    }
  }

  /**
   * Get orders for a specific user
   */
  async getUserOrders(userId) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching user orders:', error);
      throw error;
    }
  }

  /**
   * Get all orders (admin only)
   */
  async getAllOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching all orders:', error);
      throw error;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId, status, adminNotes = '') {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString()
      };

      if (adminNotes) {
        updateData.notes = adminNotes;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Order status updated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Add tracking update
   */
  async addTrackingUpdate(orderId, trackingData) {
    try {
      // Add to package_tracking table
      const trackingEntry = {
        order_id: orderId,
        tracking_number: trackingData.trackingNumber,
        status: trackingData.status,
        location: trackingData.location,
        description: trackingData.description,
        created_by: trackingData.createdBy || 'admin',
        timestamp: new Date().toISOString()
      };

      const { data: trackingResult, error: trackingError } = await supabase
        .from('package_tracking')
        .insert([trackingEntry])
        .select()
        .single();

      if (trackingError) throw trackingError;

      // Update order's tracking_updates array
      const { data: order, error: orderFetchError } = await supabase
        .from('orders')
        .select('tracking_updates')
        .eq('id', orderId)
        .single();

      if (orderFetchError) throw orderFetchError;

      const updatedTrackingUpdates = [
        ...(order.tracking_updates || []),
        {
          status: trackingData.status,
          description: trackingData.description,
          location: trackingData.location,
          timestamp: new Date().toISOString()
        }
      ];

      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          tracking_status: trackingData.status,
          tracking_updates: updatedTrackingUpdates,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('✅ Tracking update added:', trackingResult);
      return { tracking: trackingResult, order: updatedOrder };
    } catch (error) {
      console.error('❌ Error adding tracking update:', error);
      throw error;
    }
  }

  /**
   * Get tracking history for an order
   */
  async getTrackingHistory(orderId) {
    try {
      const { data, error } = await supabase
        .from('package_tracking')
        .select('*')
        .eq('order_id', orderId)
        .order('timestamp', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error fetching tracking history:', error);
      throw error;
    }
  }

  /**
   * Generate tracking number
   */
  generateTrackingNumber() {
    const prefix = 'GS';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Calculate estimated delivery date (7-14 days from now)
   */
  calculateEstimatedDelivery() {
    const now = new Date();
    const deliveryDays = Math.floor(Math.random() * 8) + 7; // 7-14 days
    const estimatedDate = new Date(now.getTime() + (deliveryDays * 24 * 60 * 60 * 1000));
    return estimatedDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }

  /**
   * Search orders by tracking number
   */
  async searchOrderByTracking(trackingNumber) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error searching order by tracking:', error);
      throw error;
    }
  }
}

// Create singleton instance
const supabaseService = new SupabaseService()

export default supabaseService

// Export utility functions
export const {
  // Database methods
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  // Storage methods
  uploadImage,
  getPublicUrl,
  deleteImage,
  listImages,
  createSignedUrl,
  uploadProductImage,
  uploadMultipleImages,
  replaceProductImage,
  getImageMetadata,
  updateImageMetadata,
  // Order management methods
  initializeOrderTables,
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  addTrackingUpdate,
  getTrackingHistory,
  searchOrderByTracking,
  generateTrackingNumber,
  calculateEstimatedDelivery
} = supabaseService
