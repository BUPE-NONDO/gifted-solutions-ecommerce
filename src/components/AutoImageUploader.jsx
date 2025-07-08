import React, { useState } from 'react';
import { Download, Upload, CheckCircle, AlertCircle, Play, RefreshCw } from 'lucide-react';
import { uploadProductImage } from '../utils/imageUpload';
import { downloadAndUploadAllImages, betterComponentImages } from '../utils/downloadComponentImages';

const AutoImageUploader = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [message, setMessage] = useState(null);

  // Run the automated download and upload process
  const runAutomatedUpload = async () => {
    setIsRunning(true);
    setProgress(null);
    setResults(null);
    setMessage(null);

    try {
      const result = await downloadAndUploadAllImages(uploadProductImage, (progressUpdate) => {
        setProgress(progressUpdate);
      });

      setResults(result);
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully uploaded ${result.summary.uploaded} component images!`
        });
      } else {
        setMessage({
          type: 'error',
          text: result.error
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Process failed: ${error.message}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Generate updated product data
  const generateUpdatedProductData = () => {
    if (!results || !results.success) return null;

    const successfulUploads = results.uploadResults.filter(r => r.success);
    
    const productData = successfulUploads.map((upload, index) => ({
      id: index + 1,
      name: upload.component,
      category: getCategoryForComponent(upload.component),
      price: getPriceForComponent(upload.component),
      image: upload.publicUrl,
      description: getDescriptionForComponent(upload.component),
      inStock: true,
      badge: index < 3 ? 'Popular' : null
    }));

    return JSON.stringify(productData, null, 2);
  };

  // Helper functions for product data
  const getCategoryForComponent = (name) => {
    if (name.includes('Arduino') || name.includes('ESP32')) return 'Arduino Boards';
    if (name.includes('Sensor')) return 'Sensors';
    if (name.includes('Motor')) return 'Motors';
    if (name.includes('Module')) return 'Modules';
    return 'Components';
  };

  const getPriceForComponent = (name) => {
    const prices = {
      'Arduino Uno R3': 'K650',
      'ESP32 Development Board': 'K800',
      'Arduino Nano': 'K450',
      'Arduino Mega 2560': 'K950',
      'Ultrasonic Sensor HC-SR04': 'K200',
      'DHT22 Temperature Sensor': 'K250',
      'PIR Motion Sensor': 'K180',
      'Light Sensor LDR': 'K120',
      'Servo Motor SG90': 'K300',
      'Stepper Motor': 'K450',
      'DC Motor': 'K350',
      'WiFi Module ESP8266': 'K600',
      'Bluetooth Module HC-05': 'K400',
      'LCD Display 16x2': 'K500',
      'Breadboard': 'K150',
      'Jumper Wires': 'K80',
      'Resistor Kit': 'K200',
      'LED Kit': 'K180'
    };
    return prices[name] || 'K200';
  };

  const getDescriptionForComponent = (name) => {
    const descriptions = {
      'Arduino Uno R3': 'Arduino Uno R3 microcontroller board with USB cable',
      'ESP32 Development Board': 'ESP32 WiFi and Bluetooth development board',
      'Arduino Nano': 'Compact Arduino Nano microcontroller',
      'Arduino Mega 2560': 'Arduino Mega 2560 with 54 digital pins',
      'Ultrasonic Sensor HC-SR04': 'Ultrasonic distance sensor for Arduino projects',
      'DHT22 Temperature Sensor': 'Digital temperature and humidity sensor',
      'PIR Motion Sensor': 'Passive infrared motion detection sensor',
      'Light Sensor LDR': 'Light dependent resistor for light detection',
      'Servo Motor SG90': 'Micro servo motor 9g for precise control',
      'Stepper Motor': '28BYJ-48 stepper motor with ULN2003 driver',
      'DC Motor': 'DC gear motor for robotics projects',
      'WiFi Module ESP8266': 'ESP8266 WiFi module for IoT projects',
      'Bluetooth Module HC-05': 'HC-05 Bluetooth module for wireless communication',
      'LCD Display 16x2': '16x2 character LCD display with I2C interface',
      'Breadboard': 'Half-size breadboard for prototyping',
      'Jumper Wires': 'Male to male jumper wires pack of 40',
      'Resistor Kit': 'Resistor kit with common values',
      'LED Kit': 'Assorted LED kit with different colors'
    };
    return descriptions[name] || 'Electronic component for Arduino projects';
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ type: 'success', text: 'Copied to clipboard!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy to clipboard' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Automated Component Image Uploader</h2>
          <p className="text-gray-600 mt-1">
            Automatically download and upload Arduino component images to Supabase
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 border-l-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-400' 
              : 'bg-red-50 border-red-400'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              )}
              <span className={`text-sm ${
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {message.text}
              </span>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="p-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">What this will do:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Download {Object.keys(betterComponentImages).length} high-quality component images</li>
              <li>• Upload them to your Supabase storage</li>
              <li>• Generate updated product data with new image URLs</li>
              <li>• Replace placeholder images with real component photos</li>
            </ul>
          </div>

          <button
            onClick={runAutomatedUpload}
            disabled={isRunning}
            className="w-full flex items-center justify-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-5 w-5" />
                Start Automated Upload
              </>
            )}
          </button>
        </div>

        {/* Progress */}
        {progress && (
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {progress.phase === 'downloading' && 'Downloading Images'}
                  {progress.phase === 'uploading' && 'Uploading to Supabase'}
                  {progress.phase === 'complete' && 'Process Complete'}
                  {progress.phase === 'error' && 'Error Occurred'}
                </span>
                {progress.current && progress.total && (
                  <span className="text-sm text-gray-500">
                    {progress.current}/{progress.total}
                  </span>
                )}
              </div>

              {progress.current && progress.total && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  ></div>
                </div>
              )}

              <div className="text-sm text-gray-600">
                {progress.message}
              </div>

              {progress.component && (
                <div className="bg-gray-50 rounded p-3">
                  <div className="flex items-center">
                    {progress.status === 'downloading' && <Download className="h-4 w-4 text-blue-500 mr-2" />}
                    {progress.status === 'uploading' && <Upload className="h-4 w-4 text-yellow-500 mr-2" />}
                    {(progress.status === 'completed' || progress.status === 'uploaded') && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
                    {(progress.status === 'failed' || progress.status === 'upload-failed') && <AlertCircle className="h-4 w-4 text-red-500 mr-2" />}
                    <span className="text-sm font-medium">{progress.component}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Results</h3>
            
            {results.success ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{results.summary.downloaded}</div>
                    <div className="text-sm text-green-700">Downloaded</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{results.summary.uploaded}</div>
                    <div className="text-sm text-blue-700">Uploaded</div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">{results.summary.failed}</div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                </div>

                {/* Updated Product Data */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Updated Product Data</h4>
                    <button
                      onClick={() => copyToClipboard(generateUpdatedProductData())}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      Copy Data
                    </button>
                  </div>
                  <div className="bg-gray-900 rounded p-3 overflow-x-auto max-h-64">
                    <pre className="text-green-400 text-xs whitespace-pre-wrap">
                      {generateUpdatedProductData()}
                    </pre>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Next Steps:</h4>
                  <ol className="list-decimal list-inside text-sm text-green-800 space-y-1">
                    <li>Copy the product data above</li>
                    <li>Update your product database with the new image URLs</li>
                    <li>The images are now live on your website</li>
                    <li>Test the website to see the new component images</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Upload Failed</h4>
                <p className="text-sm text-red-800">{results.error}</p>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Before You Start</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>✅ Make sure Supabase storage is set up (visit /supabase-storage-setup)</p>
            <p>✅ Ensure you have a stable internet connection</p>
            <p>✅ This process will take 2-3 minutes to complete</p>
            <p>⚠️ This will replace existing product images with new ones</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoImageUploader;
