import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, Play, Copy, ExternalLink } from 'lucide-react';
import { runSupabaseSetup, testStorageConnection, generateSetupCommands } from '../scripts/setupSupabase';

const SupabaseSetup = () => {
  const [setupStatus, setSetupStatus] = useState('idle'); // idle, running, success, error
  const [setupResult, setSetupResult] = useState(null);
  const [connectionTest, setConnectionTest] = useState(null);
  const [setupCommands, setSetupCommands] = useState(null);

  useEffect(() => {
    // Generate setup commands on component mount
    const commands = generateSetupCommands();
    setSetupCommands(commands);
    
    // Test connection on mount
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const result = await testStorageConnection();
      setConnectionTest(result);
    } catch (error) {
      setConnectionTest({
        success: false,
        error: error.message
      });
    }
  };

  const runSetup = async () => {
    setSetupStatus('running');
    setSetupResult(null);

    try {
      const result = await runSupabaseSetup();
      setSetupResult(result);
      setSetupStatus(result.success ? 'success' : 'error');
      
      // Refresh connection test
      await testConnection();
    } catch (error) {
      setSetupResult({
        success: false,
        error: error.message
      });
      setSetupStatus('error');
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Database className="mx-auto h-16 w-16 text-primary-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Supabase Storage Setup</h1>
          <p className="text-gray-600 mt-2">Configure Supabase storage for image management</p>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Status</h2>
          
          {connectionTest ? (
            <div className="space-y-3">
              <div className="flex items-center">
                {connectionTest.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span className={connectionTest.success ? 'text-green-700' : 'text-red-700'}>
                  {connectionTest.success ? 'Connected to Supabase' : 'Connection Failed'}
                </span>
              </div>

              {connectionTest.success && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Connection Details</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <div>Bucket Exists: {connectionTest.bucketExists ? '✅' : '❌'}</div>
                    <div>Available Buckets: {connectionTest.buckets?.join(', ') || 'None'}</div>
                  </div>
                </div>
              )}

              {!connectionTest.success && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="font-medium text-red-900 mb-2">Error Details</h3>
                  <div className="text-sm text-red-700">{connectionTest.error}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Testing connection...</div>
          )}

          <button
            onClick={testConnection}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Test Connection
          </button>
        </div>

        {/* Setup Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Automated Setup</h2>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              Run the automated setup to configure Supabase storage bucket and folder structure.
            </p>

            <button
              onClick={runSetup}
              disabled={setupStatus === 'running'}
              className="flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              <Play className="mr-2 h-4 w-4" />
              {setupStatus === 'running' ? 'Running Setup...' : 'Run Supabase Setup'}
            </button>

            {/* Setup Results */}
            {setupResult && (
              <div className={`rounded-lg p-4 ${
                setupResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center mb-2">
                  {setupResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <h3 className={`font-medium ${
                    setupResult.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {setupResult.success ? 'Setup Successful' : 'Setup Failed'}
                  </h3>
                </div>
                
                <div className={`text-sm ${
                  setupResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {setupResult.message || setupResult.error}
                </div>

                {setupResult.folders && (
                  <div className="mt-2">
                    <div className="text-sm text-green-700">
                      Created folders: {setupResult.folders.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Manual Setup Instructions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Setup Instructions</h2>
          
          <div className="space-y-6">
            {/* Dashboard Steps */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Supabase Dashboard Steps</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
                  <li>Navigate to Storage section</li>
                  <li>Create a new bucket named "product-images"</li>
                  <li>Set the bucket to Public</li>
                  <li>Go to Storage → Policies</li>
                  <li>Add the SQL policies below</li>
                  <li>Test upload functionality</li>
                </ol>
              </div>
            </div>

            {/* SQL Commands */}
            {setupCommands && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">SQL Policies</h3>
                  <button
                    onClick={() => copyToClipboard(setupCommands.sql)}
                    className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy SQL
                  </button>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400 whitespace-pre-wrap">
                    {setupCommands.sql}
                  </pre>
                </div>
              </div>
            )}

            {/* Environment Variables */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Environment Variables</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-700 space-y-1">
                  <div><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</div>
                  <div><strong>VITE_SUPABASE_ANON_KEY:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Not set'}</div>
                  <div><strong>VITE_STORAGE_BUCKET:</strong> {import.meta.env.VITE_STORAGE_BUCKET || 'product-images'}</div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Quick Links</h3>
              <div className="flex space-x-4">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Supabase Dashboard
                </a>
                <a
                  href="/admin-image-manager"
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Image Manager
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseSetup;
