import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, CheckCircle, AlertCircle, Copy, ExternalLink, RefreshCw } from 'lucide-react';
import supabaseService from '../services/supabase';

const DatabaseSetup = () => {
  const navigate = useNavigate();
  const [setupStatus, setSetupStatus] = useState('idle'); // idle, testing, success, error
  const [message, setMessage] = useState('');
  const [showSQL, setShowSQL] = useState(false);

  const sqlScript = `-- Gifted Solutions Database Migration
-- Run this SQL in your Supabase SQL Editor

-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  site_name VARCHAR(255) DEFAULT 'Gifted Solutions',
  tagline VARCHAR(255) DEFAULT 'Your Electronics Partner',
  logo TEXT,
  header_text VARCHAR(255) DEFAULT 'Welcome to Gifted Solutions',
  header_subtext TEXT DEFAULT 'Quality Electronics Components & Solutions',
  footer_text TEXT DEFAULT 'Contact: 0779421717 | 0961288156',
  footer_description TEXT DEFAULT 'Your trusted partner for quality electronics components and solutions in Zambia.',
  show_social_links BOOLEAN DEFAULT true,
  phone1 VARCHAR(20) DEFAULT '0779421717',
  phone2 VARCHAR(20) DEFAULT '0961288156',
  email VARCHAR(255) DEFAULT 'giftedsolutions20@gmail.com',
  address TEXT DEFAULT 'Lusaka, Zambia',
  whatsapp_number VARCHAR(20) DEFAULT '260779421717',
  social_links JSONB DEFAULT '{"facebook": "bupelifestyle", "twitter": "giftedsolutionz", "tiktok": "bupelifestyle"}',
  hero_title VARCHAR(255) DEFAULT 'Quality Electronics Components',
  hero_subtitle TEXT DEFAULT 'Find everything you need for your electronics projects',
  hero_button_text VARCHAR(100) DEFAULT 'Shop Now',
  featured_section_title VARCHAR(255) DEFAULT 'Featured Products',
  featured_section_subtitle TEXT DEFAULT 'Discover our most popular electronics components',
  currency VARCHAR(10) DEFAULT 'K',
  show_featured_products BOOLEAN DEFAULT true,
  enable_search BOOLEAN DEFAULT true,
  enable_cart BOOLEAN DEFAULT true,
  maintenance_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow write access to site_settings for authenticated users" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON site_settings TO authenticated;
GRANT SELECT ON site_settings TO anon;`;

  const testDatabaseConnection = async () => {
    setSetupStatus('testing');
    setMessage('Testing database connection...');

    try {
      // Test basic connection
      const { data, error } = await supabaseService.getProducts();
      
      if (error) {
        throw new Error(`Database connection failed: ${error.message}`);
      }

      // Test site settings table
      const settings = await supabaseService.getSiteSettings();
      
      if (settings) {
        setSetupStatus('success');
        setMessage('✅ Database is properly configured! Site settings table exists and is accessible.');
      } else {
        setSetupStatus('error');
        setMessage('⚠️ Database connected but site_settings table needs to be created. Please run the SQL script below.');
        setShowSQL(true);
      }
    } catch (error) {
      setSetupStatus('error');
      setMessage(`❌ Database setup required: ${error.message}`);
      setShowSQL(true);
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(sqlScript);
    alert('SQL script copied to clipboard!');
  };

  const openSupabase = () => {
    window.open('https://supabase.com/dashboard/project/fotcjsmnerawpqzhldhq/sql', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center mb-4">
            <Database className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Database Setup</h1>
              <p className="text-gray-600">Configure your Supabase database for Gifted Solutions</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={testDatabaseConnection}
              disabled={setupStatus === 'testing'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50"
            >
              {setupStatus === 'testing' ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Test Database
            </button>

            <button
              onClick={() => navigate('/super-admin')}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
            >
              Go to Admin Dashboard
            </button>

            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Back to Website
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`rounded-lg p-4 mb-6 ${
            setupStatus === 'success' ? 'bg-green-100 text-green-800' :
            setupStatus === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            <div className="flex items-center">
              {setupStatus === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
              {setupStatus === 'error' && <AlertCircle className="w-5 h-5 mr-2" />}
              {setupStatus === 'testing' && <RefreshCw className="w-5 h-5 mr-2 animate-spin" />}
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Setup Instructions</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">1</span>
              <div>
                <h3 className="font-medium text-gray-900">Test Database Connection</h3>
                <p className="text-gray-600 text-sm">Click "Test Database" to check if your Supabase database is properly configured.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">2</span>
              <div>
                <h3 className="font-medium text-gray-900">Run SQL Script (if needed)</h3>
                <p className="text-gray-600 text-sm">If the test fails, copy and run the SQL script in your Supabase SQL Editor.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">3</span>
              <div>
                <h3 className="font-medium text-gray-900">Access Admin Dashboard</h3>
                <p className="text-gray-600 text-sm">Once setup is complete, go to the Super Admin Dashboard to manage your website.</p>
              </div>
            </div>
          </div>
        </div>

        {/* SQL Script */}
        {showSQL && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">SQL Setup Script</h2>
              <div className="flex space-x-2">
                <button
                  onClick={copySQL}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy SQL
                </button>
                <button
                  onClick={openSupabase}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Supabase
                </button>
              </div>
            </div>
            
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm whitespace-pre-wrap">{sqlScript}</pre>
            </div>
            
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">How to run this script:</h3>
              <ol className="text-sm text-yellow-700 space-y-1">
                <li>1. Click "Open Supabase" to go to your Supabase dashboard</li>
                <li>2. Navigate to the SQL Editor</li>
                <li>3. Paste the copied SQL script</li>
                <li>4. Click "Run" to execute the script</li>
                <li>5. Come back here and click "Test Database" again</li>
              </ol>
            </div>
          </div>
        )}

        {/* Success Actions */}
        {setupStatus === 'success' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎉 Setup Complete!</h2>
            <p className="text-gray-600 mb-4">
              Your database is properly configured. You can now use all the admin features.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/super-admin')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Open Super Admin Dashboard
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                View Website
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseSetup;
