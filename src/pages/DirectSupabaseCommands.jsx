import React, { useState } from 'react';
import { 
  runCompleteDirectSetup,
  createBucketDirect,
  uploadSampleImagesDirect,
  testStorageDirect,
  getStorageInfoDirect
} from '../utils/directSupabaseSetup';
import { 
  Play, 
  Terminal, 
  Database, 
  Upload, 
  TestTube, 
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const DirectSupabaseCommands = () => {
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addOutput = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, { message, type, timestamp }]);
  };

  const clearOutput = () => {
    setOutput([]);
  };

  const runCommand = async (commandName, commandFunction) => {
    setIsRunning(true);
    addOutput(`🚀 Running ${commandName}...`, 'info');
    
    try {
      const result = await commandFunction();
      
      if (result) {
        addOutput(`✅ ${commandName} completed successfully`, 'success');
        if (typeof result === 'object') {
          addOutput(`📊 Result: ${JSON.stringify(result, null, 2)}`, 'info');
        }
      } else {
        addOutput(`❌ ${commandName} failed`, 'error');
      }
    } catch (error) {
      addOutput(`❌ ${commandName} error: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const commands = [
    {
      name: 'Complete Setup',
      description: 'Run all setup commands in sequence',
      icon: Play,
      color: 'bg-blue-500 hover:bg-blue-600',
      action: () => runCommand('Complete Setup', runCompleteDirectSetup)
    },
    {
      name: 'Create Bucket',
      description: 'Create storage bucket with policies',
      icon: Database,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => runCommand('Create Bucket', createBucketDirect)
    },
    {
      name: 'Upload Samples',
      description: 'Upload sample product images',
      icon: Upload,
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => runCommand('Upload Samples', uploadSampleImagesDirect)
    },
    {
      name: 'Test Storage',
      description: 'Test storage functionality',
      icon: TestTube,
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => runCommand('Test Storage', testStorageDirect)
    },
    {
      name: 'Get Info',
      description: 'Get storage information',
      icon: Info,
      color: 'bg-gray-500 hover:bg-gray-600',
      action: () => runCommand('Get Info', getStorageInfoDirect)
    }
  ];

  const getOutputColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
          <Terminal className="mr-3" />
          Direct Supabase Commands
        </h1>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-blue-800">🚀 Push Commands Directly to Supabase</h2>
          <p className="text-blue-700 text-sm">
            These commands bypass the UI and push directly to your Supabase instance. 
            Use "Complete Setup" to run everything at once, or run individual commands as needed.
          </p>
        </div>

        {/* Command Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {commands.map((command, index) => {
            const Icon = command.icon;
            return (
              <button
                key={index}
                onClick={command.action}
                disabled={isRunning}
                className={`${command.color} text-white p-4 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Icon size={24} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{command.name}</h3>
                <p className="text-xs opacity-90">{command.description}</p>
              </button>
            );
          })}
        </div>

        {/* Console Output */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Terminal className="mr-2" size={20} />
              Command Output
            </h2>
            <button
              onClick={clearOutput}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
            >
              Clear Output
            </button>
          </div>
          
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {output.length === 0 ? (
              <div className="text-gray-500">
                Ready to execute commands. Click a button above to start...
              </div>
            ) : (
              output.map((log, index) => (
                <div key={index} className={`mb-1 ${getOutputColor(log.type)}`}>
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))
            )}
            
            {isRunning && (
              <div className="text-yellow-400 animate-pulse">
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> Command running...
              </div>
            )}
          </div>
        </div>

        {/* Browser Console Commands */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">💻 Browser Console Commands</h2>
          <p className="text-gray-600 text-sm mb-4">
            You can also run these commands directly in your browser console (F12):
          </p>
          
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm space-y-2">
            <div>// Run complete setup</div>
            <div className="text-yellow-400">window.directSupabase.runCompleteDirectSetup()</div>
            
            <div className="mt-4">// Create bucket only</div>
            <div className="text-yellow-400">window.directSupabase.createBucketDirect()</div>
            
            <div className="mt-4">// Upload sample images</div>
            <div className="text-yellow-400">window.directSupabase.uploadSampleImagesDirect()</div>
            
            <div className="mt-4">// Test storage</div>
            <div className="text-yellow-400">window.directSupabase.testStorageDirect()</div>
            
            <div className="mt-4">// Get storage info</div>
            <div className="text-yellow-400">window.directSupabase.getStorageInfoDirect()</div>
          </div>
        </div>

        {/* Supabase Connection Info */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-green-800">🔗 Supabase Connection</h2>
          <div className="text-sm text-green-700 space-y-1">
            <div><strong>URL:</strong> https://fotcjsmnerawpqzhldhq.supabase.co</div>
            <div><strong>Bucket:</strong> product-images</div>
            <div><strong>Access:</strong> Public read/write</div>
            <div><strong>File Types:</strong> JPEG, PNG, WebP</div>
            <div><strong>Max Size:</strong> 5MB per file</div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <Database className="mx-auto mb-2 text-blue-500" size={24} />
            <div className="text-sm font-medium text-blue-800">Storage Bucket</div>
            <div className="text-xs text-blue-600">product-images</div>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
            <CheckCircle className="mx-auto mb-2 text-green-500" size={24} />
            <div className="text-sm font-medium text-green-800">Public Access</div>
            <div className="text-xs text-green-600">Read/Write Enabled</div>
          </div>
          
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <Upload className="mx-auto mb-2 text-purple-500" size={24} />
            <div className="text-sm font-medium text-purple-800">Image Upload</div>
            <div className="text-xs text-purple-600">Ready for Use</div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-yellow-800">🎯 Next Steps</h2>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Click "Complete Setup" to initialize everything</li>
            <li>Check the output for success messages</li>
            <li>Visit the Image Manager to start uploading real images</li>
            <li>Use the Supabase dashboard to monitor storage usage</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DirectSupabaseCommands;
