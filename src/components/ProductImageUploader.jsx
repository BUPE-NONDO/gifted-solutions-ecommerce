import React, { useState } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { uploadProductImage } from '../utils/imageUpload';
import { getPublicUrl } from '../lib/supabase';

const ProductImageUploader = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [message, setMessage] = useState(null);

  // Arduino component images to upload
  const componentImages = [
    {
      name: 'Arduino Uno R3',
      category: 'Arduino Boards',
      price: 'K650',
      suggestedUrl: 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Arduino Uno R3 microcontroller board'
    },
    {
      name: 'ESP32 Development Board',
      category: 'Arduino Boards', 
      price: 'K800',
      suggestedUrl: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'ESP32 WiFi and Bluetooth development board'
    },
    {
      name: 'Arduino Nano',
      category: 'Arduino Boards',
      price: 'K450',
      suggestedUrl: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Compact Arduino Nano microcontroller'
    },
    {
      name: 'Ultrasonic Sensor HC-SR04',
      category: 'Sensors',
      price: 'K200',
      suggestedUrl: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Ultrasonic distance sensor'
    },
    {
      name: 'DHT22 Temperature Sensor',
      category: 'Sensors',
      price: 'K250',
      suggestedUrl: 'https://images.pexels.com/photos/159298/gears-cogs-machine-machinery-159298.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Digital temperature and humidity sensor'
    },
    {
      name: 'PIR Motion Sensor',
      category: 'Sensors',
      price: 'K180',
      suggestedUrl: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Passive infrared motion sensor'
    },
    {
      name: 'Servo Motor SG90',
      category: 'Motors',
      price: 'K300',
      suggestedUrl: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Micro servo motor 9g'
    },
    {
      name: 'Stepper Motor',
      category: 'Motors',
      price: 'K450',
      suggestedUrl: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: '28BYJ-48 stepper motor with driver'
    }
  ];

  // Handle file upload
  const handleFileUpload = async (event, component) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    try {
      const result = await uploadProductImage(file, component.name, 'products');
      
      if (result.success) {
        const newResult = {
          component: component.name,
          success: true,
          publicUrl: result.publicUrl,
          fileName: result.fileName
        };
        
        setUploadResults(prev => [...prev, newResult]);
        setMessage({ 
          type: 'success', 
          text: `Successfully uploaded image for ${component.name}` 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: `Failed to upload ${component.name}: ${result.error}` 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: `Upload error: ${error.message}` 
      });
    } finally {
      setUploading(false);
    }
  };

  // Copy URL to clipboard
  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage({ type: 'success', text: 'URL copied to clipboard!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to copy URL' });
    }
  };

  // Generate product data with new URLs
  const generateProductData = () => {
    const productData = componentImages.map((component, index) => {
      const uploadResult = uploadResults.find(r => r.component === component.name);
      return {
        id: index + 1,
        name: component.name,
        category: component.category,
        price: component.price,
        image: uploadResult ? uploadResult.publicUrl : component.suggestedUrl,
        description: component.description,
        inStock: true,
        badge: index < 3 ? 'Popular' : null
      };
    });

    return JSON.stringify(productData, null, 2);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Arduino Component Image Uploader</h2>
          <p className="text-gray-600 mt-1">Upload real images for Arduino components and electronics</p>
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

        {/* Component Upload Grid */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Component Images</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {componentImages.map((component, index) => {
              const uploadResult = uploadResults.find(r => r.component === component.name);
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {uploadResult ? (
                      <img 
                        src={uploadResult.publicUrl} 
                        alt={component.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">{component.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{component.category} • {component.price}</p>
                  
                  {uploadResult ? (
                    <div className="space-y-2">
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Uploaded
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => copyUrl(uploadResult.publicUrl)}
                          className="flex-1 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                          <Copy className="h-3 w-3 inline mr-1" />
                          Copy URL
                        </button>
                        <button
                          onClick={() => window.open(uploadResult.publicUrl, '_blank')}
                          className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, component)}
                        disabled={uploading}
                        className="hidden"
                        id={`upload-${index}`}
                      />
                      <label
                        htmlFor={`upload-${index}`}
                        className="w-full flex items-center justify-center px-3 py-2 bg-primary-500 text-white text-sm rounded cursor-pointer hover:bg-primary-600 disabled:opacity-50"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Results */}
        {uploadResults.length > 0 && (
          <div className="border-t border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Upload Results ({uploadResults.length}/{componentImages.length})
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Updated Product Data</h4>
              <p className="text-sm text-gray-600 mb-3">
                Copy this data to update your products with the new image URLs:
              </p>
              <div className="bg-gray-900 rounded p-3 overflow-x-auto">
                <pre className="text-green-400 text-xs whitespace-pre-wrap">
                  {generateProductData()}
                </pre>
              </div>
              <button
                onClick={() => copyUrl(generateProductData())}
                className="mt-2 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                Copy Product Data
              </button>
            </div>

            <div className="space-y-2">
              {uploadResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <div>
                    <span className="font-medium text-green-900">{result.component}</span>
                    <span className="text-sm text-green-700 ml-2">✓ Uploaded</span>
                  </div>
                  <button
                    onClick={() => copyUrl(result.publicUrl)}
                    className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                  >
                    Copy URL
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>First, make sure Supabase storage is set up (run setup on previous page)</li>
            <li>Upload real images of Arduino components using the upload buttons above</li>
            <li>Copy the generated product data and update your product database</li>
            <li>The images will automatically appear on your website</li>
            <li>Use high-quality images (JPEG, PNG) for best results</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ProductImageUploader;
