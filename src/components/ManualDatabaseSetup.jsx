import { useState } from 'react';
import { 
  Database, 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Code,
  ArrowRight,
  FileText
} from 'lucide-react';
import { 
  createProductMetadataTableSQL, 
  createProductCategoriesTableSQL, 
  createProductReviewsTableSQL 
} from '../utils/createProductMetadataTable';

const ManualDatabaseSetup = () => {
  const [copiedQuery, setCopiedQuery] = useState(null);

  const copyToClipboard = async (text, queryName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedQuery(queryName);
      setTimeout(() => setCopiedQuery(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedQuery(queryName);
      setTimeout(() => setCopiedQuery(null), 2000);
    }
  };

  const sqlQueries = [
    {
      name: 'Product Metadata Table',
      description: 'Main table for storing comprehensive product information',
      sql: createProductMetadataTableSQL,
      features: [
        'Complete product details (name, description, pricing)',
        'Inventory management (stock, availability)',
        'Product status and flags (featured, bestseller)',
        'Physical properties (weight, dimensions)',
        'Media storage (images, videos)',
        'Technical specifications (JSONB)',
        'SEO metadata (title, description, keywords)',
        'Supplier and shipping information',
        'Customer reviews integration'
      ]
    },
    {
      name: 'Product Categories Table',
      description: 'Hierarchical category system for organizing products',
      sql: createProductCategoriesTableSQL,
      features: [
        'Category hierarchy (parent-child relationships)',
        'SEO-friendly slugs',
        'Category images and icons',
        'Sort ordering',
        'Active/inactive status',
        'Meta information for SEO'
      ]
    },
    {
      name: 'Product Reviews Table',
      description: 'Customer review and rating system',
      sql: createProductReviewsTableSQL,
      features: [
        'Customer ratings (1-5 stars)',
        'Review titles and text',
        'Verification status',
        'Approval workflow',
        'Helpful vote counting',
        'Timestamp tracking'
      ]
    }
  ];

  const setupSteps = [
    {
      step: 1,
      title: 'Open Supabase Dashboard',
      description: 'Navigate to your Supabase project dashboard',
      action: 'Go to https://supabase.com/dashboard',
      icon: ExternalLink
    },
    {
      step: 2,
      title: 'Access SQL Editor',
      description: 'Click on "SQL Editor" in the left sidebar',
      action: 'Find and click the SQL Editor menu item',
      icon: Code
    },
    {
      step: 3,
      title: 'Create New Query',
      description: 'Start a new SQL query session',
      action: 'Click "New Query" or "+" button',
      icon: FileText
    },
    {
      step: 4,
      title: 'Execute SQL Queries',
      description: 'Copy and run each SQL query below in order',
      action: 'Copy → Paste → Run for each query',
      icon: Database
    },
    {
      step: 5,
      title: 'Verify Tables',
      description: 'Check that all tables were created successfully',
      action: 'Return to this page and test the system',
      icon: CheckCircle
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manual Database Setup</h1>
              <p className="text-gray-600">Create product metadata tables in your Supabase database</p>
            </div>
          </div>
        </div>

        {/* Alert */}
        <div className="p-6 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Manual Setup Required</h3>
              <p className="mt-1 text-sm text-yellow-700">
                The automatic table creation requires manual execution through Supabase SQL Editor. 
                Follow the steps below to set up your database.
              </p>
            </div>
          </div>
        </div>

        {/* Setup Steps */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Setup Steps</h2>
          <div className="space-y-4">
            {setupSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <h3 className="font-medium text-gray-900">{step.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    <p className="text-sm text-blue-600 mt-1 font-medium">{step.action}</p>
                  </div>
                  {step.step < setupSteps.length && (
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SQL Queries */}
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">SQL Queries to Execute</h2>
          <div className="space-y-8">
            {sqlQueries.map((query, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Query Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {index + 1}. {query.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{query.description}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(query.sql, query.name)}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {copiedQuery === query.name ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy SQL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Features */}
                <div className="px-6 py-4 bg-blue-50">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Features:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {query.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-blue-600 flex-shrink-0" />
                        <span className="text-xs text-blue-800">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SQL Code */}
                <div className="p-6">
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-100 whitespace-pre-wrap">
                      <code>{query.sql}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="p-6 border-t border-gray-200 bg-green-50">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-green-900">After Running All Queries</h3>
              <div className="mt-2 text-sm text-green-800">
                <p className="mb-2">Once you've successfully executed all three SQL queries in your Supabase SQL Editor:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Return to the Product Metadata Test page</li>
                  <li>Click "Run Setup" to create sample data</li>
                  <li>Start using the Product Metadata Manager</li>
                  <li>Add your own products and categories</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-blue-600" />
              <span className="text-blue-900 font-medium">Supabase Dashboard</span>
            </a>
            
            <a
              href="/product-metadata-test"
              className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Database className="h-5 w-5 text-green-600" />
              <span className="text-green-900 font-medium">Test Setup</span>
            </a>
            
            <a
              href="/product-metadata-manager"
              className="flex items-center space-x-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="text-purple-900 font-medium">Metadata Manager</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualDatabaseSetup;
