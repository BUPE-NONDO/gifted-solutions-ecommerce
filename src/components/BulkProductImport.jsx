import React, { useState, useEffect } from 'react';
import { Upload, Plus, CheckCircle, AlertCircle, RefreshCw, Package, Download } from 'lucide-react';

const BulkProductImport = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [autoImported, setAutoImported] = useState(false);

  // Pre-defined product list from your requirements
  const electronicsProducts = [
    { name: "5V DC Pump (Non Submissible)", price: "K350", category: "Motors & Pumps" },
    { name: "12V DC Small Electromagnetic Lock", price: "K350", category: "Security & Access" },
    { name: "16x2 LCD Display (with I2C)", price: "K350", category: "Displays" },
    { name: "16x2 LCD Display (without I2C)", price: "K300", category: "Displays" },
    { name: "170-Point Breadboard", price: "K100", category: "Prototyping" },
    { name: "20kg Load Cell Weight Sensor + HX711 AD Module", price: "K450", category: "Sensors" },
    { name: "20x4 Alphanumeric LCD Display (with I2C)", price: "K450", category: "Displays" },
    { name: "3000VA Solar Africa Inverter with Charger", price: "K2800", category: "Power Supply" },
    { name: "5V, 10A, Single Channel Relay Module", price: "K150", category: "Relays & Switches" },
    { name: "5V 2-Channel Relay Module (Jumper Connection)", price: "K250", category: "Relays & Switches" },
    { name: "5V 2-Channel Relay Module (Wire-Screw Connection)", price: "K250", category: "Relays & Switches" },
    { name: "5V 4-Channel Relay Module", price: "K350", category: "Relays & Switches" },
    { name: "7805 & 7812 Voltage Regulator", price: "K30", category: "Power Supply" },
    { name: "9g Micro Servo Motor", price: "K180", category: "Motors & Pumps" },
    { name: "9V Battery Clip Holder Case with DC Jack", price: "K80", category: "Power Supply" },
    { name: "9V Battery Snap Power Cable with DC Jack", price: "K80", category: "Power Supply" },
    { name: "9V, 1A DC Power Supply", price: "K250", category: "Power Supply" },
    { name: "ACS712 Current Sensor", price: "K250", category: "Sensors" },
    { name: "Arduino Mega (Atmega2560 + USB Cable)", price: "K1000", category: "Microcontrollers" },
    { name: "Arduino Nano", price: "K450", category: "Microcontrollers" },
    { name: "Arduino Nano Terminal Adapter", price: "K250", category: "Microcontrollers" },
    { name: "Arduino Starter Kit (Starter Kit for Arduino UNO R3)", price: "K2500", category: "Kits & Bundles" },
    { name: "Arduino Uno + USB Cable", price: "K650", category: "Microcontrollers" },
    { name: "AS608n Fingerprint Sensor", price: "K800", category: "Sensors" },
    { name: "Atmega 328P Microcontroller Set", price: "K350", category: "Microcontrollers" },
    { name: "Capacitive Touch Sensor", price: "K200", category: "Sensors" },
    { name: "DFPlayer Mini MP3 Player Module", price: "K200", category: "Audio & Video" },
    { name: "DHT11 Temperature & Humidity Sensor", price: "K250", category: "Sensors" },
    { name: "ESP32 WiFi Module with OV2640 Cam Version", price: "K800", category: "WiFi & Communication" },
    { name: "ESP8266 NodeMCU WiFi Module", price: "K800", category: "WiFi & Communication" },
    { name: "ESP NodeMCU WRover WiFi Module", price: "K800", category: "WiFi & Communication" },
    { name: "HC-SR04 Ultrasonic Sensor", price: "K250", category: "Sensors" },
    { name: "HC-SR501 PIR Motion Sensor", price: "K250", category: "Sensors" },
    { name: "Heart Rate Sensor (KY-039)", price: "K350", category: "Sensors" },
    { name: "High-Quality Double-Sided PCB Board", price: "K250", category: "Prototyping" },
    { name: "Jumper Wires (per line)", price: "K4", category: "Prototyping" },
    { name: "LCD Display (16x2) (without I2C)", price: "K300", category: "Displays" },
    { name: "LEDs (per unit)", price: "K10", category: "Components" },
    { name: "LM35 Temperature Sensor", price: "K250", category: "Sensors" },
    { name: "L293D Motor Driver IC", price: "K100", category: "Motor Drivers" },
    { name: "L298N Motor Driver", price: "K250", category: "Motor Drivers" },
    { name: "MQ-2 Smoke & LPG Gas Sensor", price: "K250", category: "Sensors" },
    { name: "MQ-3 Gas Sensor", price: "K250", category: "Sensors" },
    { name: "Micro SD Card Module", price: "K100", category: "Storage & Memory" },
    { name: "Nema 17 Stepper Motor", price: "K450", category: "Motors & Pumps" },
    { name: "NE555 Timer IC", price: "K60", category: "Components" },
    { name: "PAM8403 Audio Amplifier Module", price: "K120", category: "Audio & Video" },
    { name: "800-Point PCB Board", price: "K350", category: "Prototyping" },
    { name: "PIR Obstacle Avoidance Sensor", price: "K250", category: "Sensors" },
    { name: "PIR Motion Sensor (HC-SR501)", price: "K250", category: "Sensors" },
    { name: "Potentiometer (1M Trimmer)", price: "K30", category: "Components" }
  ];

  const importAllProducts = async () => {
    setIsImporting(true);
    setImportResults([]);
    setShowResults(true);

    try {
      console.log('🚀 Starting bulk import of electronics products...');
      
      const { default: supabaseService } = await import('../services/supabase');
      const results = [];

      for (let i = 0; i < electronicsProducts.length; i++) {
        const product = electronicsProducts[i];
        
        try {
          console.log(`📦 Adding product ${i + 1}/${electronicsProducts.length}: ${product.name}`);
          
          const productData = {
            name: product.name,
            description: `High-quality ${product.name.toLowerCase()} for electronics projects and prototyping. Perfect for Arduino, ESP32, and other microcontroller projects.

📱 Order via WhatsApp: 0779421717 or 0961288156
🚚 Fast delivery available
💯 Quality guaranteed
🔧 Technical support included

Contact Gifted Solutions for bulk orders and technical assistance.`,
            price: product.price,
            category: product.category,
            image: '', // Will be assigned later from Supabase gallery
            inStock: true,
            featured: false,
            visible: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const addedProduct = await supabaseService.addProduct(productData);
          
          results.push({
            success: true,
            product: addedProduct,
            message: `✅ ${product.name} added successfully`
          });

          console.log(`✅ Product ${i + 1} added: ${product.name}`);
          
          // Small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.error(`❌ Failed to add ${product.name}:`, error);
          results.push({
            success: false,
            product: product,
            message: `❌ Failed to add ${product.name}: ${error.message}`,
            error: error.message
          });
        }
        
        // Update results in real-time
        setImportResults([...results]);
      }

      // Trigger website refresh
      window.dispatchEvent(new CustomEvent('productDataUpdated', {
        detail: { 
          type: 'bulk_import',
          count: results.filter(r => r.success).length,
          timestamp: Date.now() 
        }
      }));

      console.log(`🎉 Bulk import completed! ${results.filter(r => r.success).length}/${electronicsProducts.length} products added successfully.`);

    } catch (error) {
      console.error('❌ Bulk import failed:', error);
      setImportResults([{
        success: false,
        message: `❌ Bulk import failed: ${error.message}`,
        error: error.message
      }]);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadProductList = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Price,Category\n"
      + electronicsProducts.map(p => `"${p.name}","${p.price}","${p.category}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "gifted_solutions_electronics_products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Auto-import on component mount
  useEffect(() => {
    const shouldAutoImport = localStorage.getItem('gifted-solutions-auto-import');
    if (!shouldAutoImport && !autoImported) {
      console.log('🚀 Starting automatic product import...');
      setAutoImported(true);
      localStorage.setItem('gifted-solutions-auto-import', 'true');
      importAllProducts();
    }
  }, []);

  const successCount = importResults.filter(r => r.success).length;
  const failureCount = importResults.filter(r => !r.success).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="w-6 h-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Bulk Electronics Products Import</h3>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={downloadProductList}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center text-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Download List
          </button>
          <button
            onClick={importAllProducts}
            disabled={isImporting}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
          >
            {isImporting ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {isImporting ? 'Importing...' : `Import ${electronicsProducts.length} Products`}
          </button>
        </div>
      </div>

      {/* Product Preview */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Products to Import ({electronicsProducts.length} items):</h4>
        <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            {electronicsProducts.slice(0, 12).map((product, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-700 truncate">{product.name}</span>
                <span className="text-green-600 font-medium ml-2">{product.price}</span>
              </div>
            ))}
            {electronicsProducts.length > 12 && (
              <div className="text-gray-500 italic">...and {electronicsProducts.length - 12} more items</div>
            )}
          </div>
        </div>
      </div>

      {/* Import Progress */}
      {isImporting && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Import Progress</span>
            <span className="text-sm text-gray-500">{importResults.length}/{electronicsProducts.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(importResults.length / electronicsProducts.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {showResults && importResults.length > 0 && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Processed</p>
                  <p className="text-xl font-bold text-blue-900">{importResults.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">Successful</p>
                  <p className="text-xl font-bold text-green-900">{successCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-800">Failed</p>
                  <p className="text-xl font-bold text-red-900">{failureCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Contact Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h5 className="font-medium text-green-800 mb-2">📱 Order via WhatsApp</h5>
        <p className="text-sm text-green-700 mb-2">
          All products will include WhatsApp contact information for easy ordering:
        </p>
        <div className="flex items-center space-x-4 text-sm">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">📞 0779421717</span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">📞 0961288156</span>
          <a 
            href="https://wa.me/260779421717" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            💬 WhatsApp Direct
          </a>
        </div>
      </div>
    </div>
  );
};

export default BulkProductImport;
