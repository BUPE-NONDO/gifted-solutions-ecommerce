import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon,
  RefreshCw,
  Download,
  Settings,
  Database
} from 'lucide-react';
import { 
  initializeCompleteImageSystem,
  step1_InitializeStorage,
  step2_TestConnection,
  step4_UploadSampleImages,
  step5_TestImageRetrieval,
  step6_CreateTestGallery
} from '../utils/initializeImageSystem';

const SupabaseImageSetup = () => {
  const [setupStatus, setSetupStatus] = useState({
    step1: null, // null = not started, true = success, false = failed
    step2: null,
    step3: null,
    step4: null,
    step5: null,
    step6: null,
    overall: null
  });
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const runCompleteSetup = async () => {
    setIsRunning(true);
    setCurrentStep(1);
    setLogs([]);
    addLog('🚀 Starting complete Supabase image system setup...', 'info');

    try {
      const results = await initializeCompleteImageSystem();
      setSetupStatus(results);
      
      if (results.overall) {
        addLog('🎉 Setup completed successfully!', 'success');
      } else {
        addLog('❌ Setup completed with errors', 'error');
      }
    } catch (error) {
      addLog(`❌ Setup failed: ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
      setCurrentStep(0);
    }
  };

  const runIndividualStep = async (stepNumber) => {
    setIsRunning(true);
    addLog(`Running step ${stepNumber}...`, 'info');

    try {
      let result = false;
      
      switch (stepNumber) {
        case 1:
          result = await step1_InitializeStorage();
          break;
        case 2:
          result = await step2_TestConnection();
          break;
        case 4:
          const uploadResults = await step4_UploadSampleImages();
          result = uploadResults.some(r => r.success);
          break;
        case 5:
          const images = await step5_TestImageRetrieval();
          result = images.length > 0;
          break;
        case 6:
          result = await step6_CreateTestGallery();
          break;
        default:
          result = false;
      }

      setSetupStatus(prev => ({
        ...prev,
        [`step${stepNumber}`]: result
      }));

      addLog(`Step ${stepNumber} ${result ? 'completed successfully' : 'failed'}`, result ? 'success' : 'error');
    } catch (error) {
      addLog(`Step ${stepNumber} failed: ${error.message}`, 'error');
      setSetupStatus(prev => ({
        ...prev,
        [`step${stepNumber}`]: false
      }));
    } finally {
      setIsRunning(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'Initialize Storage',
      description: 'Create Supabase storage bucket and configure policies',
      icon: Database
    },
    {
      number: 2,
      title: 'Test Connection',
      description: 'Verify connection to Supabase storage',
      icon: RefreshCw
    },
    {
      number: 4,
      title: 'Upload Samples',
      description: 'Create and upload sample product images',
      icon: Upload
    },
    {
      number: 5,
      title: 'Test Retrieval',
      description: 'Test image listing and URL generation',
      icon: Download
    },
    {
      number: 6,
      title: 'Create Gallery',
      description: 'Display test gallery of uploaded images',
      icon: ImageIcon
    }
  ];

  const getStatusIcon = (status) => {
    if (status === null) return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    if (status === true) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusColor = (status) => {
    if (status === null) return 'border-gray-300';
    if (status === true) return 'border-green-500 bg-green-50';
    return 'border-red-500 bg-red-50';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
          <Settings className="mr-3" />
          Supabase Image System Setup
        </h1>

        {/* Quick Start */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Quick Start</h2>
          <p className="text-blue-700 mb-4">
            Run the complete setup to initialize your Supabase image storage system with sample data.
          </p>
          <button
            onClick={runCompleteSetup}
            disabled={isRunning}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isRunning ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Running Setup...
              </>
            ) : (
              <>
                <Play className="mr-2" size={20} />
                Run Complete Setup
              </>
            )}
          </button>
        </div>

        {/* Individual Steps */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Individual Steps</h2>
          <div className="space-y-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const status = setupStatus[`step${step.number}`];
              
              return (
                <div
                  key={step.number}
                  className={`border-2 rounded-lg p-4 transition-colors ${getStatusColor(status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(status)}
                      <Icon className="w-6 h-6 text-gray-600" />
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          Step {step.number}: {step.title}
                        </h3>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => runIndividualStep(step.number)}
                      disabled={isRunning}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
                    >
                      Run
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Setup Status */}
        {Object.values(setupStatus).some(status => status !== null) && (
          <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Setup Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {steps.map((step) => {
                const status = setupStatus[`step${step.number}`];
                return (
                  <div key={step.number} className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <span className="text-sm">Step {step.number}</span>
                  </div>
                );
              })}
              <div className="flex items-center space-x-2">
                {getStatusIcon(setupStatus.overall)}
                <span className="text-sm font-semibold">Overall</span>
              </div>
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Setup Logs</h2>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-blue-500 hover:text-blue-600"
            >
              {showLogs ? 'Hide' : 'Show'} Logs
            </button>
          </div>
          
          {showLogs && (
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet. Run setup to see progress...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={`mb-1 ${
                    log.type === 'error' ? 'text-red-400' : 
                    log.type === 'success' ? 'text-green-400' : 
                    'text-blue-400'
                  }`}>
                    <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Next Steps */}
        {setupStatus.overall === true && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-green-800">🎉 Setup Complete!</h2>
            <p className="text-green-700 mb-4">
              Your Supabase image system is now ready. Here's what you can do next:
            </p>
            <div className="space-y-2 text-sm text-green-700">
              <div>• Visit <a href="/admin-image-manager" className="underline font-medium">/admin-image-manager</a> to manage product images</div>
              <div>• Visit <a href="/admin-import" className="underline font-medium">/admin-import</a> to import products with images</div>
              <div>• Check the test gallery that should be visible on the right side of your screen</div>
              <div>• Upload your own product images to replace the sample ones</div>
            </div>
          </div>
        )}

        {/* Manual Instructions */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Manual Setup (if needed)</h2>
          <p className="text-yellow-700 mb-4">
            If automatic setup fails, you can manually create the storage bucket in Supabase Dashboard:
          </p>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Go to your Supabase Dashboard → Storage</li>
            <li>Create a new bucket named "product-images"</li>
            <li>Set it as a public bucket</li>
            <li>Configure RLS policies for public read access</li>
            <li>Return here and run the test connection step</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default SupabaseImageSetup;
