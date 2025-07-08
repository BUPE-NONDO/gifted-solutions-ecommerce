import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Package } from 'lucide-react';

const AutoProductImport = () => {
  const [importStatus, setImportStatus] = useState('checking');
  const [importResults, setImportResults] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);

  // Electronics products to import
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

  useEffect(() => {
    const checkAndImportProducts = async () => {
      try {
        console.log('🔍 Checking if products need to be imported...');

        const { default: supabaseService } = await import('../services/supabase');

        // Initialize database tables first
        await supabaseService.initializeTables();

        // Check if products already exist
        let existingProducts = [];
        try {
          existingProducts = await supabaseService.getProducts();
          console.log(`📊 Found ${existingProducts.length} existing products`);
        } catch (error) {
          console.log('📋 No products table found or error accessing it, will create during import');
          console.error('Database access error:', error);
          existingProducts = [];
        }

        const hasElectronicsProducts = existingProducts.some(p =>
          electronicsProducts.some(ep => ep.name === p.name)
        );

        if (hasElectronicsProducts && existingProducts.length > 10) {
          console.log('✅ Electronics products already exist in database');
          setImportStatus('already_imported');
          setTotalProducts(existingProducts.length);
          return;
        }

        console.log('🚀 Starting automatic import of electronics products...');
        setImportStatus('importing');
        
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
              category: product.category
            };

            const addedProduct = await supabaseService.addProduct(productData);
            
            results.push({
              success: true,
              product: addedProduct,
              name: product.name
            });

            console.log(`✅ Product ${i + 1} added: ${product.name}`);
            
            // Small delay to prevent overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 100));
            
          } catch (error) {
            console.error(`❌ Failed to add ${product.name}:`, error);
            results.push({
              success: false,
              name: product.name,
              error: error.message
            });
          }
        }

        setImportResults(results);
        setTotalProducts(results.filter(r => r.success).length);
        setImportStatus('completed');

        // Trigger website refresh
        window.dispatchEvent(new CustomEvent('productDataUpdated', {
          detail: { 
            type: 'auto_import',
            count: results.filter(r => r.success).length,
            timestamp: Date.now() 
          }
        }));

        console.log(`🎉 Auto-import completed! ${results.filter(r => r.success).length}/${electronicsProducts.length} products added successfully.`);

      } catch (error) {
        console.error('❌ Auto-import failed:', error);
        setImportStatus('failed');
      }
    };

    checkAndImportProducts();
  }, []);

  const successCount = importResults.filter(r => r.success).length;
  const failureCount = importResults.filter(r => !r.success).length;

  if (importStatus === 'checking') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <RefreshCw className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
          <span className="text-blue-800">Checking product database...</span>
        </div>
      </div>
    );
  }

  if (importStatus === 'already_imported') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <div>
            <span className="text-green-800 font-medium">Electronics products already loaded!</span>
            <p className="text-sm text-green-700 mt-1">
              Found {totalProducts} products in database. All electronics components are available on the website.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (importStatus === 'importing') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <RefreshCw className="w-5 h-5 text-yellow-600 mr-2 animate-spin" />
          <div>
            <span className="text-yellow-800 font-medium">Importing electronics products...</span>
            <p className="text-sm text-yellow-700 mt-1">
              Adding {electronicsProducts.length} products to the website. This may take a few moments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (importStatus === 'completed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">Electronics products imported successfully!</span>
        </div>
        <div className="text-sm text-green-700">
          <p>✅ {successCount} products added successfully</p>
          {failureCount > 0 && <p>❌ {failureCount} products failed to import</p>}
          <p className="mt-2">
            🌐 All products are now live on the website with WhatsApp ordering: 
            <a href="https://wa.me/260779421717" target="_blank" rel="noopener noreferrer" className="underline ml-1">
              0779421717
            </a>
          </p>
        </div>
      </div>
    );
  }

  if (importStatus === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800 font-medium">Failed to import products</span>
        </div>
        <p className="text-sm text-red-700 mt-1">
          There was an error importing the electronics products. Please check the console for details.
        </p>
      </div>
    );
  }

  return null;
};

export default AutoProductImport;
