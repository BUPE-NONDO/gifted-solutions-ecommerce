# 🗄️ Database Setup Guide

## Setting up the Image Metadata Table

To enable persistent storage of image metadata (prices, descriptions, etc.), you need to create the `image_metadata` table in your Supabase database.

## 🚀 Quick Setup

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Navigate to your project: `fotcjsmnerawpqzhldhq`

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Setup Script**
   - Copy the contents of `database/create-image-metadata-table.sql`
   - Paste into the SQL editor
   - Click "Run" to execute

4. **Verify Setup**
   - Check the "Table Editor" to see the new `image_metadata` table
   - You should see sample data already inserted

### Option 2: Manual Table Creation

If you prefer to create the table manually:

```sql
-- Create the table
CREATE TABLE image_metadata (
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

-- Create indexes for performance
CREATE INDEX idx_image_metadata_image_name ON image_metadata(image_name);
CREATE INDEX idx_image_metadata_featured ON image_metadata(featured);
CREATE INDEX idx_image_metadata_price ON image_metadata(price);

-- Enable Row Level Security
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access for everyone" 
ON image_metadata FOR SELECT USING (true);

CREATE POLICY "Allow all operations for authenticated users" 
ON image_metadata FOR ALL USING (auth.role() = 'authenticated');
```

## 🔧 Configuration

### Environment Variables

Make sure your `.env` file has the correct Supabase credentials:

```env
VITE_SUPABASE_URL=https://fotcjsmnerawpqzhldhq.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Service Role Key

For admin operations, you might need the service role key. This should be kept secure and only used server-side.

## ✅ Testing the Setup

### 1. Check Table Creation
```sql
-- Verify table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'image_metadata';

-- Check table structure
\d image_metadata;
```

### 2. Test Data Operations
```sql
-- Insert test record
INSERT INTO image_metadata (image_name, title, description, price) 
VALUES ('test-image.jpg', 'Test Product', 'Test description', 99.99);

-- Query data
SELECT * FROM image_metadata WHERE image_name = 'test-image.jpg';

-- Update data
UPDATE image_metadata 
SET price = 149.99 
WHERE image_name = 'test-image.jpg';

-- Delete test data
DELETE FROM image_metadata WHERE image_name = 'test-image.jpg';
```

### 3. Test from Application

1. **Load Sample Data**
   - Go to SuperAdmin → Gallery tab
   - Click "Load Sample Data"
   - Check console for success messages

2. **Edit Image Metadata**
   - Click "Edit Details" on any image
   - Make changes and save
   - Verify changes persist after page refresh

3. **Check Gallery**
   - Visit `/gallery`
   - Verify images show prices and descriptions
   - Test add to cart functionality

## 🔍 Troubleshooting

### Common Issues

1. **Table doesn't exist**
   - Run the SQL setup script again
   - Check for syntax errors in the SQL

2. **Permission denied**
   - Verify RLS policies are set correctly
   - Check user authentication status

3. **Data not saving**
   - Check browser console for errors
   - Verify Supabase credentials
   - Test database connection

### Debug Queries

```sql
-- Check if table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'image_metadata'
);

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'image_metadata';

-- View all metadata
SELECT * FROM image_metadata ORDER BY created_at DESC;

-- Count records by status
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE price IS NOT NULL) as with_price,
  COUNT(*) FILTER (WHERE featured = true) as featured
FROM image_metadata;
```

## 🎉 Success!

Once the database is set up:
- ✅ Image metadata will persist between sessions
- ✅ Multiple admins can edit simultaneously
- ✅ Changes sync across browser tabs
- ✅ Full backup and recovery support
- ✅ Scalable for thousands of images

Your Gallery system is now ready for production use!
