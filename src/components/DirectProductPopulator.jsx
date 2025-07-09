import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, RefreshCw, Star } from 'lucide-react';

const DirectProductPopulator = () => {
  const [status, setStatus] = useState('loading');
  const [results, setResults] = useState([]);

  // Electronics products with featured status
  const products = [
    { name: "5V DC Pump (Non Submissible)", price: "K350", category: "Motors & Pumps", featured: false },
    { name: "12V DC Small Electromagnetic Lock", price: "K350", category: "Security & Access", featured: false },
    { name: "16x2 LCD Display (with I2C)", price: "K350", category: "Displays", featured: true },
    { name: "16x2 LCD Display (without I2C)", price: "K300", category: "Displays", featured: false },
    { name: "170-Point Breadboard", price: "K100", category: "Prototyping", featured: true },
    { name: "20kg Load Cell Weight Sensor + HX711 AD Module", price: "K450", category: "Sensors", featured: false },
    { name: "20x4 Alphanumeric LCD Display (with I2C)", price: "K450", category: "Displays", featured: false },
    { name: "3000VA Solar Africa Inverter with Charger", price: "K2800", category: "Power Supply", featured: true },
    { name: "5V, 10A, Single Channel Relay Module", price: "K150", category: "Relays & Switches", featured: false },
    { name: "5V 2-Channel Relay Module (Jumper Connection)", price: "K250", category: "Relays & Switches", featured: false },
    { name: "5V 2-Channel Relay Module (Wire-Screw Connection)", price: "K250", category: "Relays & Switches", featured: false },
    { name: "5V 4-Channel Relay Module", price: "K350", category: "Relays & Switches", featured: false },
    { name: "7805 & 7812 Voltage Regulator", price: "K30", category: "Power Supply", featured: false },
    { name: "9g Micro Servo Motor", price: "K180", category: "Motors & Pumps", featured: false },
    { name: "9V Battery Clip Holder Case with DC Jack", price: "K80", category: "Power Supply", featured: false },
    { name: "9V Battery Snap Power Cable with DC Jack", price: "K80", category: "Power Supply", featured: false },
    { name: "9V, 1A DC Power Supply", price: "K250", category: "Power Supply", featured: false },
    { name: "ACS712 Current Sensor", price: "K250", category: "Sensors", featured: false },
    { name: "Arduino Mega (Atmega2560 + USB Cable)", price: "K1000", category: "Microcontrollers", featured: true },
    { name: "Arduino Nano", price: "K450", category: "Microcontrollers", featured: true },
    { name: "Arduino Nano Terminal Adapter", price: "K250", category: "Microcontrollers", featured: false },
    { name: "Arduino Starter Kit (Starter Kit for Arduino UNO R3)", price: "K2500", category: "Kits & Bundles", featured: true },
    { name: "Arduino Uno + USB Cable", price: "K650", category: "Microcontrollers", featured: true },
    { name: "AS608n Fingerprint Sensor", price: "K800", category: "Sensors", featured: false },
    { name: "Atmega 328P Microcontroller Set", price: "K350", category: "Microcontrollers", featured: false },
    { name: "Capacitive Touch Sensor", price: "K200", category: "Sensors", featured: false },
    { name: "DFPlayer Mini MP3 Player Module", price: "K200", category: "Audio & Video", featured: false },
    { name: "DHT11 Temperature & Humidity Sensor", price: "K250", category: "Sensors", featured: true },
    { name: "ESP32 WiFi Module with OV2640 Cam Version", price: "K800", category: "WiFi & Communication", featured: true },
    { name: "ESP8266 NodeMCU WiFi Module", price: "K800", category: "WiFi & Communication", featured: true },
    { name: "ESP NodeMCU WRover WiFi Module", price: "K800", category: "WiFi & Communication", featured: false },
    { name: "HC-SR04 Ultrasonic Sensor", price: "K250", category: "Sensors", featured: true },
    { name: "HC-SR501 PIR Motion Sensor", price: "K250", category: "Sensors", featured: false },
    { name: "Heart Rate Sensor (KY-039)", price: "K350", category: "Sensors", featured: false },
    { name: "High-Quality Double-Sided PCB Board", price: "K250", category: "Prototyping", featured: false },
    { name: "Jumper Wires (per line)", price: "K4", category: "Prototyping", featured: true },
    { name: "LCD Display (16x2) (without I2C)", price: "K300", category: "Displays", featured: false },
    { name: "LEDs (per unit)", price: "K10", category: "Components", featured: true },
    { name: "LM35 Temperature Sensor", price: "K250", category: "Sensors", featured: false },
    { name: "L293D Motor Driver IC", price: "K100", category: "Motor Drivers", featured: false },
    { name: "L298N Motor Driver", price: "K250", category: "Motor Drivers", featured: true },
    { name: "MQ-2 Smoke & LPG Gas Sensor", price: "K250", category: "Sensors", featured: false },
    { name: "MQ-3 Gas Sensor", price: "K250", category: "Sensors", featured: false },
    { name: "Micro SD Card Module", price: "K100", category: "Storage & Memory", featured: false },
    { name: "Nema 17 Stepper Motor", price: "K450", category: "Motors & Pumps", featured: false },
    { name: "NE555 Timer IC", price: "K60", category: "Components", featured: false },
    { name: "PAM8403 Audio Amplifier Module", price: "K120", category: "Audio & Video", featured: false },
    { name: "800-Point PCB Board", price: "K350", category: "Prototyping", featured: false },
    { name: "PIR Obstacle Avoidance Sensor", price: "K250", category: "Sensors", featured: false },
    { name: "PIR Motion Sensor (HC-SR501)", price: "K250", category: "Sensors", featured: false },
    { name: "Potentiometer (1M Trimmer)", price: "K30", category: "Components", featured: false }
  ];

  useEffect(() => {
    const populateProducts = async () => {
      try {
        console.log('🚀 Starting direct product population...');
        setStatus('importing');

        // Use the existing Supabase service
        const { default: supabaseService } = await import('../services/supabase');

        const results = [];
        let successCount = 0;

        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          
          try {
            console.log(`📦 Adding ${i + 1}/${products.length}: ${product.name}`);

            const productData = {
              name: product.name,
              description: `High-quality ${product.name.toLowerCase()} for electronics projects. Perfect for Arduino, ESP32, and microcontroller projects.

📱 Order via WhatsApp: 0779421717 or 0961288156
🚚 Fast delivery available
💯 Quality guaranteed
🔧 Technical support included

Contact Gifted Solutions for orders and technical assistance.`,
              price: product.price,
              category: product.category,
              featured: product.featured,
              inStock: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            const addedProduct = await supabaseService.addProduct(productData);

            console.log(`✅ Added: ${product.name}`);
            results.push({
              success: true,
              name: product.name,
              data: addedProduct
            });
            successCount++;

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

        setResults(results);
        setStatus('completed');

        // Trigger website refresh
        window.dispatchEvent(new CustomEvent('productDataUpdated', {
          detail: { 
            type: 'direct_population',
            count: successCount,
            timestamp: Date.now() 
          }
        }));

        console.log(`🎉 Direct population completed! ${successCount}/${products.length} products added.`);

      } catch (error) {
        console.error('❌ Direct population failed:', error);
        setStatus('failed');
      }
    };

    populateProducts();
  }, []);

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  const featuredCount = products.filter(p => p.featured).length;

  if (status === 'loading') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <RefreshCw className="w-5 h-5 text-blue-600 mr-2 animate-spin" />
          <span className="text-blue-800">Initializing product population...</span>
        </div>
      </div>
    );
  }

  if (status === 'importing') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <RefreshCw className="w-5 h-5 text-yellow-600 mr-2 animate-spin" />
          <div>
            <span className="text-yellow-800 font-medium">Populating electronics products...</span>
            <p className="text-sm text-yellow-700 mt-1">
              Adding {products.length} products ({featuredCount} featured) to Supabase database...
            </p>
            {results.length > 0 && (
              <p className="text-sm text-yellow-700">
                Progress: {results.length}/{products.length} processed
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">Products populated successfully!</span>
        </div>
        <div className="text-sm text-green-700 space-y-1">
          <p>✅ {successCount} products added successfully</p>
          <p><Star className="w-4 h-4 inline mr-1" />{featuredCount} products marked as featured</p>
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

  if (status === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800 font-medium">Failed to populate products</span>
        </div>
        <p className="text-sm text-red-700 mt-1">
          There was an error populating the products. Please check the console for details.
        </p>
      </div>
    );
  }

  return null;
};

export default DirectProductPopulator;
