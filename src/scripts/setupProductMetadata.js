/**
 * Setup Product Metadata Tables Script
 * Run this script to create all necessary tables for product metadata management
 */

import { createAllProductTables } from '../utils/createProductMetadataTable.js';
import productMetadataService from '../services/productMetadataService.js';

// Function to run the setup
export const setupProductMetadata = async () => {
  console.log('🚀 Starting Product Metadata Setup...');
  
  try {
    // Step 1: Create tables
    console.log('📋 Step 1: Creating database tables...');
    const tableResult = await createAllProductTables();
    
    if (!tableResult.success) {
      throw new Error(`Failed to create tables: ${tableResult.error}`);
    }
    
    console.log('✅ Database tables created successfully!');
    
    // Step 2: Create sample categories
    console.log('📋 Step 2: Creating sample categories...');
    const sampleCategories = [
      {
        name: 'Microcontrollers',
        description: 'Arduino, ESP32, and other microcontroller boards',
        slug: 'microcontrollers',
        is_active: true
      },
      {
        name: 'Sensors',
        description: 'Temperature, humidity, motion, and other sensors',
        slug: 'sensors',
        is_active: true
      },
      {
        name: 'Displays',
        description: 'LCD, OLED, LED displays and screens',
        slug: 'displays',
        is_active: true
      },
      {
        name: 'Motors & Actuators',
        description: 'Servo motors, stepper motors, and actuators',
        slug: 'motors-actuators',
        is_active: true
      },
      {
        name: 'Power Supplies',
        description: 'Batteries, adapters, and power management modules',
        slug: 'power-supplies',
        is_active: true
      },
      {
        name: 'Wiring & Connectors',
        description: 'Jumper wires, breadboards, and connectors',
        slug: 'wiring-connectors',
        is_active: true
      }
    ];
    
    for (const category of sampleCategories) {
      try {
        await productMetadataService.createCategory(category);
        console.log(`✅ Created category: ${category.name}`);
      } catch (error) {
        console.log(`⚠️ Category ${category.name} might already exist: ${error.message}`);
      }
    }
    
    // Step 3: Create sample products
    console.log('📋 Step 3: Creating sample products...');
    const sampleProducts = [
      {
        name: 'Arduino Uno R3',
        description: 'The classic Arduino development board with USB cable',
        short_description: 'Popular microcontroller board for beginners',
        category: 'Microcontrollers',
        brand: 'Arduino',
        model: 'Uno R3',
        price: 650,
        currency: 'K',
        stock_quantity: 25,
        low_stock_threshold: 5,
        in_stock: true,
        featured: true,
        bestseller: true,
        specifications: {
          'Microcontroller': 'ATmega328P',
          'Operating Voltage': '5V',
          'Input Voltage': '7-12V',
          'Digital I/O Pins': '14',
          'Analog Input Pins': '6',
          'Flash Memory': '32KB'
        },
        features: [
          'USB connectivity',
          'Built-in LED on pin 13',
          'Reset button',
          'Power jack',
          'ICSP header'
        ],
        warranty_period: '1 year',
        meta_title: 'Arduino Uno R3 - Perfect for Electronics Projects',
        meta_description: 'Get started with electronics using the Arduino Uno R3. Perfect for beginners and professionals.',
        keywords: ['arduino', 'microcontroller', 'electronics', 'programming', 'diy']
      },
      {
        name: 'ESP32 Development Board',
        description: 'WiFi and Bluetooth enabled microcontroller with dual-core processor',
        short_description: 'Powerful WiFi/Bluetooth microcontroller',
        category: 'Microcontrollers',
        brand: 'Espressif',
        model: 'ESP32-WROOM-32',
        price: 850,
        currency: 'K',
        stock_quantity: 15,
        low_stock_threshold: 3,
        in_stock: true,
        featured: true,
        new_arrival: true,
        specifications: {
          'Processor': 'Dual-core Tensilica LX6',
          'Clock Speed': '240MHz',
          'WiFi': '802.11 b/g/n',
          'Bluetooth': 'v4.2 BR/EDR and BLE',
          'Flash Memory': '4MB',
          'SRAM': '520KB'
        },
        features: [
          'Built-in WiFi',
          'Bluetooth connectivity',
          'Dual-core processor',
          'Low power consumption',
          'Rich peripheral interfaces'
        ],
        warranty_period: '1 year',
        meta_title: 'ESP32 WiFi Bluetooth Development Board',
        meta_description: 'Advanced ESP32 board with WiFi and Bluetooth for IoT projects.',
        keywords: ['esp32', 'wifi', 'bluetooth', 'iot', 'microcontroller']
      },
      {
        name: 'DHT22 Temperature Humidity Sensor',
        description: 'High precision digital temperature and humidity sensor',
        short_description: 'Accurate temperature and humidity measurements',
        category: 'Sensors',
        brand: 'Aosong',
        model: 'DHT22',
        price: 120,
        currency: 'K',
        stock_quantity: 50,
        low_stock_threshold: 10,
        in_stock: true,
        specifications: {
          'Temperature Range': '-40°C to 80°C',
          'Humidity Range': '0-100% RH',
          'Temperature Accuracy': '±0.5°C',
          'Humidity Accuracy': '±2% RH',
          'Operating Voltage': '3.3V to 6V'
        },
        features: [
          'High accuracy',
          'Digital output',
          'Long-term stability',
          'Low power consumption'
        ],
        warranty_period: '6 months',
        meta_title: 'DHT22 Digital Temperature Humidity Sensor',
        meta_description: 'Precise DHT22 sensor for temperature and humidity monitoring projects.',
        keywords: ['dht22', 'temperature', 'humidity', 'sensor', 'digital']
      },
      {
        name: '16x2 LCD Display with I2C',
        description: '16x2 character LCD display with I2C interface for easy connection',
        short_description: 'Easy-to-use LCD display with I2C',
        category: 'Displays',
        brand: 'Generic',
        model: '1602A',
        price: 180,
        currency: 'K',
        stock_quantity: 30,
        low_stock_threshold: 5,
        in_stock: true,
        specifications: {
          'Display Size': '16x2 characters',
          'Character Size': '5x8 dots',
          'Interface': 'I2C',
          'Operating Voltage': '5V',
          'Backlight': 'Blue with white text'
        },
        features: [
          'I2C interface (only 4 wires needed)',
          'Blue backlight',
          'Clear white characters',
          'Easy to program'
        ],
        warranty_period: '3 months',
        meta_title: '16x2 LCD Display with I2C Interface',
        meta_description: 'Simple 16x2 LCD display with I2C for Arduino and microcontroller projects.',
        keywords: ['lcd', 'display', 'i2c', '16x2', 'arduino']
      },
      {
        name: 'SG90 Micro Servo Motor',
        description: 'Small and lightweight servo motor perfect for robotics projects',
        short_description: 'Compact servo motor for robotics',
        category: 'Motors & Actuators',
        brand: 'TowerPro',
        model: 'SG90',
        price: 95,
        currency: 'K',
        stock_quantity: 40,
        low_stock_threshold: 8,
        in_stock: true,
        specifications: {
          'Operating Voltage': '4.8V to 6V',
          'Torque': '1.8kg/cm at 4.8V',
          'Speed': '0.1s/60° at 4.8V',
          'Weight': '9g',
          'Rotation': '180°'
        },
        features: [
          'Lightweight design',
          'Precise control',
          'Standard servo connector',
          'Plastic gears'
        ],
        warranty_period: '3 months',
        meta_title: 'SG90 Micro Servo Motor for Robotics',
        meta_description: 'Compact SG90 servo motor ideal for small robotics and automation projects.',
        keywords: ['servo', 'motor', 'sg90', 'robotics', 'actuator']
      }
    ];
    
    for (const product of sampleProducts) {
      try {
        await productMetadataService.createProduct(product);
        console.log(`✅ Created product: ${product.name}`);
      } catch (error) {
        console.log(`⚠️ Product ${product.name} might already exist: ${error.message}`);
      }
    }
    
    // Step 4: Display summary
    console.log('📋 Step 4: Setup summary...');
    const stats = await productMetadataService.getProductStats();
    const categories = await productMetadataService.getCategories();
    
    console.log('\n🎉 Product Metadata Setup Complete!');
    console.log('=====================================');
    console.log(`📦 Total Products: ${stats.total}`);
    console.log(`✅ In Stock: ${stats.in_stock}`);
    console.log(`⭐ Featured: ${stats.featured}`);
    console.log(`🏷️ Categories: ${categories.length}`);
    console.log('=====================================');
    
    return {
      success: true,
      stats: {
        products: stats.total,
        categories: categories.length,
        inStock: stats.in_stock,
        featured: stats.featured
      }
    };
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export for browser console access
if (typeof window !== 'undefined') {
  window.setupProductMetadata = setupProductMetadata;
  console.log('🔧 Product Metadata Setup available in console: window.setupProductMetadata()');
}

export default setupProductMetadata;
