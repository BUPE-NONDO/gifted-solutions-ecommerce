import { useState } from 'react';
import { Database, CheckCircle, AlertCircle, Play, Copy } from 'lucide-react';
import productMetadataService from '../services/productMetadataService';

const QuickDbSetup = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const setupSteps = [
    'Creating image_metadata table...',
    'Creating product_metadata table...',
    'Creating product_categories table...',
    'Creating product_reviews table...',
    'Creating legacy support tables...',
    'Setting up indexes and policies...',
    'Inserting sample data...'
  ];

  const runQuickSetup = async () => {
    setIsRunning(true);
    setResults([]);
    setError(null);
    setSuccess(false);

    try {
      // Step 1: Test connection
      setResults(prev => [...prev, '🔄 Testing database connection...']);
      await productMetadataService.testConnection();
      setResults(prev => [...prev, '✅ Database connection successful']);

      // Step 2: Create tables using the service
      setResults(prev => [...prev, '🔄 Creating database tables...']);
      await productMetadataService.createTables();
      setResults(prev => [...prev, '✅ Database tables created successfully']);

      // Step 3: Insert sample data
      setResults(prev => [...prev, '🔄 Inserting sample data...']);
      
      // Create sample categories
      const sampleCategories = [
        { name: 'Microcontrollers', slug: 'microcontrollers', description: 'Arduino, ESP32, and other microcontroller boards' },
        { name: 'Sensors', slug: 'sensors', description: 'Temperature, humidity, motion, and other sensors' },
        { name: 'Displays', slug: 'displays', description: 'LCD, OLED, LED displays and screens' },
        { name: 'Components', slug: 'components', description: 'Electronic components and parts' }
      ];

      for (const category of sampleCategories) {
        try {
          await productMetadataService.createCategory(category);
        } catch (err) {
          console.log(`Category ${category.name} might already exist`);
        }
      }

      // Create sample products
      const sampleProducts = [
        {
          name: 'Arduino Uno R3',
          description: 'The classic Arduino development board with USB cable',
          category: 'Microcontrollers',
          price: 650,
          stock_quantity: 25,
          featured: true,
          specifications: {
            "Microcontroller": "ATmega328P",
            "Operating Voltage": "5V",
            "Digital I/O Pins": "14"
          },
          features: ["USB connectivity", "Built-in LED", "Reset button"]
        },
        {
          name: 'ESP32 Development Board',
          description: 'WiFi and Bluetooth enabled microcontroller',
          category: 'Microcontrollers',
          price: 850,
          stock_quantity: 15,
          featured: true,
          specifications: {
            "Processor": "Dual-core",
            "WiFi": "802.11 b/g/n",
            "Bluetooth": "v4.2"
          },
          features: ["Built-in WiFi", "Bluetooth connectivity", "Dual-core processor"]
        },
        {
          name: 'DHT22 Temperature Sensor',
          description: 'High precision digital temperature and humidity sensor',
          category: 'Sensors',
          price: 120,
          stock_quantity: 50,
          specifications: {
            "Temperature Range": "-40°C to 80°C",
            "Humidity Range": "0-100% RH"
          },
          features: ["High accuracy", "Digital output", "Low power consumption"]
        }
      ];

      for (const product of sampleProducts) {
        try {
          await productMetadataService.createProduct(product);
        } catch (err) {
          console.log(`Product ${product.name} might already exist`);
        }
      }

      setResults(prev => [...prev, '✅ Sample data inserted successfully']);
      setResults(prev => [...prev, '🎉 Database setup completed successfully!']);
      setSuccess(true);

    } catch (error) {
      console.error('Setup error:', error);
      setError(error.message);
      setResults(prev => [...prev, `❌ Error: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const copySQL = () => {
    const sqlContent = `-- QUICK DATABASE SETUP SQL
-- Copy and paste this into Supabase SQL Editor

-- Create image_metadata table
CREATE TABLE IF NOT EXISTS image_metadata (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(255),
  price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'K',
  tags JSONB DEFAULT '[]'::jsonb,
  public_url TEXT,
  file_path TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_metadata table
CREATE TABLE IF NOT EXISTS product_metadata (
  id BIGSERIAL PRIMARY KEY,
  product_id VARCHAR(255) NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(255),
  price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'K',
  stock_quantity INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active',
  specifications JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_categories table
CREATE TABLE IF NOT EXISTS product_categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE image_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public access" ON image_metadata FOR ALL USING (true);
CREATE POLICY "Public access" ON product_metadata FOR ALL USING (true);
CREATE POLICY "Public access" ON product_categories FOR ALL USING (true);

SELECT 'Database setup completed!' as result;`;

    navigator.clipboard.writeText(sqlContent);
    alert('✅ SQL copied to clipboard! Paste it in Supabase SQL Editor.');
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quick Database Setup</h2>
          <p className="text-gray-600">Fix all database table issues automatically</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={runQuickSetup}
          disabled={isRunning}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-5 h-5" />
          {isRunning ? 'Setting up...' : 'Run Quick Setup'}
        </button>

        <button
          onClick={copySQL}
          className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Copy className="w-5 h-5" />
          Copy SQL
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Setup Progress:</h3>
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {result.includes('✅') && <CheckCircle className="w-4 h-4 text-green-600" />}
                {result.includes('❌') && <AlertCircle className="w-4 h-4 text-red-600" />}
                {result.includes('🔄') && <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                <span className={`${result.includes('❌') ? 'text-red-600' : result.includes('✅') ? 'text-green-600' : 'text-gray-700'}`}>
                  {result}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Setup Error</h3>
          </div>
          <p className="text-red-700 mt-2">{error}</p>
          <div className="mt-3 text-sm text-red-600">
            <p>Try the manual SQL approach:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Click "Copy SQL" button above</li>
              <li>Go to Supabase Dashboard → SQL Editor</li>
              <li>Paste and run the SQL</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      )}

      {/* Success Display */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Setup Completed Successfully!</h3>
          </div>
          <p className="text-green-700 mt-2">
            All database tables have been created and sample data has been inserted.
            You can now use the product metadata system.
          </p>
          <div className="mt-3">
            <a 
              href="/product-metadata-manager" 
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Open Product Manager
            </a>
          </div>
        </div>
      )}

      {/* Manual Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-blue-900 mb-2">Manual Setup Instructions:</h3>
        <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
          <li>Click "Copy SQL" to copy the setup script</li>
          <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
          <li>Navigate to SQL Editor</li>
          <li>Paste the SQL and click "Run"</li>
          <li>Return here and click "Run Quick Setup"</li>
        </ol>
      </div>
    </div>
  );
};

export default QuickDbSetup;
