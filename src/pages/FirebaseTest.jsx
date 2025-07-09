import { useState } from 'react';
import { Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import firebaseMetadataService from '../services/firebaseMetadataService';

const FirebaseTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    const results = [];

    // Test 1: Basic Connection
    try {
      results.push({ test: 'Firebase Connection', status: 'running', message: 'Testing...' });
      setTestResults([...results]);
      
      await firebaseMetadataService.testConnection();
      results[results.length - 1] = { test: 'Firebase Connection', status: 'success', message: 'Connected successfully' };
      setTestResults([...results]);
    } catch (error) {
      results[results.length - 1] = { test: 'Firebase Connection', status: 'error', message: error.message };
      setTestResults([...results]);
    }

    // Test 2: Save Sample Metadata
    try {
      results.push({ test: 'Save Metadata', status: 'running', message: 'Testing save operation...' });
      setTestResults([...results]);
      
      const sampleMetadata = {
        title: 'Test Product',
        description: 'Test Description',
        category: 'Test Category',
        price: 100,
        inStock: true,
        featured: false
      };
      
      await firebaseMetadataService.saveImageMetadata('test-image.jpg', sampleMetadata);
      results[results.length - 1] = { test: 'Save Metadata', status: 'success', message: 'Metadata saved successfully' };
      setTestResults([...results]);
    } catch (error) {
      results[results.length - 1] = { test: 'Save Metadata', status: 'error', message: error.message };
      setTestResults([...results]);
    }

    // Test 3: Read Metadata
    try {
      results.push({ test: 'Read Metadata', status: 'running', message: 'Testing read operation...' });
      setTestResults([...results]);
      
      const metadata = await firebaseMetadataService.getImageMetadata('test-image.jpg');
      if (metadata) {
        results[results.length - 1] = { test: 'Read Metadata', status: 'success', message: `Retrieved: ${metadata.title}` };
      } else {
        results[results.length - 1] = { test: 'Read Metadata', status: 'error', message: 'No metadata found' };
      }
      setTestResults([...results]);
    } catch (error) {
      results[results.length - 1] = { test: 'Read Metadata', status: 'error', message: error.message };
      setTestResults([...results]);
    }

    // Test 4: List All Metadata
    try {
      results.push({ test: 'List All Metadata', status: 'running', message: 'Testing list operation...' });
      setTestResults([...results]);
      
      const allMetadata = await firebaseMetadataService.getAllImageMetadata();
      results[results.length - 1] = { test: 'List All Metadata', status: 'success', message: `Found ${allMetadata.length} items` };
      setTestResults([...results]);
    } catch (error) {
      results[results.length - 1] = { test: 'List All Metadata', status: 'error', message: error.message };
      setTestResults([...results]);
    }

    setTesting(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Firebase Connection Test</h1>
              <p className="text-gray-600">Test Firebase Firestore permissions and operations</p>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={runTests}
              disabled={testing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Database className="w-5 h-5" />
              {testing ? 'Running Tests...' : 'Run Firebase Tests'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Test Results:</h3>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-4 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{result.test}</h4>
                    <p className={`text-sm ${
                      result.status === 'error' ? 'text-red-600' : 
                      result.status === 'success' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {result.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Manual Setup Instructions:</h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-1 text-sm">
              <li>Go to <a href="https://console.firebase.google.com/project/gifted-solutions-shop/firestore" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></li>
              <li>Navigate to Firestore Database → Rules</li>
              <li>Replace rules with the provided configuration</li>
              <li>Click "Publish" to save</li>
              <li>Create collections: image_metadata, product_metadata, product_categories</li>
              <li>Return here and click "Run Firebase Tests"</li>
            </ol>
          </div>

          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Firebase Security Rules:</h3>
            <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to image_metadata collection
    match /image_metadata/{document} {
      allow read, write: if true;
    }
    
    // Allow read/write access to product_metadata collection
    match /product_metadata/{document} {
      allow read, write: if true;
    }
    
    // Allow read/write access to product_categories collection
    match /product_categories/{document} {
      allow read, write: if true;
    }
    
    // Allow read/write access to product_reviews collection
    match /product_reviews/{document} {
      allow read, write: if true;
    }
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;
