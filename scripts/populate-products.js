#!/usr/bin/env node

/**
 * Populate Supabase with sample products
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://fotcjsmnerawpqzhldhq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdGNqc21uZXJhd3BxemhsZGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1Mzg5MjYsImV4cCI6MjA2NDExNDkyNn0.cMIRbKVsw-gvOu53IaZzrABpngZ4O-hsMV7sWqLehK4';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sample products data
const sampleProducts = [
  {
    name: "Arduino Uno R3 + USB Cable",
    description: "Complete Arduino Uno R3 development board with USB cable for programming and power. Perfect for beginners and professionals.",
    price: "K650",
    category: "Microcontrollers",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-uno-r3-1748603951988-impc78.jpg",
    inStock: true,
    featured: true,
    badge: "Best Seller"
  },
  {
    name: "ESP32 Development Board",
    description: "WiFi and Bluetooth enabled microcontroller with dual-core processor. Ideal for IoT projects.",
    price: "K450",
    category: "Microcontrollers",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/esp32-dev-board.jpg",
    inStock: true,
    featured: true,
    badge: "WiFi Enabled"
  },
  {
    name: "DHT22 Temperature & Humidity Sensor",
    description: "High precision digital temperature and humidity sensor with calibrated output.",
    price: "K120",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/dht22-sensor.jpg",
    inStock: true,
    featured: false,
    badge: "High Precision"
  },
  {
    name: "Ultrasonic Distance Sensor HC-SR04",
    description: "Ultrasonic ranging module for distance measurement from 2cm to 400cm.",
    price: "K85",
    category: "Sensors",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/hc-sr04-ultrasonic.jpg",
    inStock: true,
    featured: false,
    badge: null
  },
  {
    name: "16x2 LCD Display with I2C",
    description: "16x2 character LCD display with I2C interface for easy connection and control.",
    price: "K180",
    category: "Displays",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/lcd-16x2-i2c.jpg",
    inStock: true,
    featured: false,
    badge: "I2C Interface"
  },
  {
    name: "Servo Motor SG90",
    description: "Micro servo motor with 180-degree rotation. Perfect for robotics and automation projects.",
    price: "K95",
    category: "Components",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/servo-sg90.jpg",
    inStock: true,
    featured: false,
    badge: null
  },
  {
    name: "Breadboard 830 Points",
    description: "Solderless breadboard with 830 tie points for prototyping electronic circuits.",
    price: "K75",
    category: "Tools",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/breadboard-830.jpg",
    inStock: true,
    featured: false,
    badge: null
  },
  {
    name: "Jumper Wires Set (120pcs)",
    description: "Complete set of male-to-male, male-to-female, and female-to-female jumper wires.",
    price: "K65",
    category: "Cables",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/jumper-wires-set.jpg",
    inStock: true,
    featured: false,
    badge: "Complete Set"
  },
  {
    name: "Power Supply Module 3.3V/5V",
    description: "Breadboard power supply module with 3.3V and 5V outputs. USB powered.",
    price: "K140",
    category: "Power Supply",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/power-supply-module.jpg",
    inStock: true,
    featured: false,
    badge: "Dual Voltage"
  },
  {
    name: "Arduino Starter Kit",
    description: "Complete Arduino starter kit with Uno board, sensors, components, and project guide.",
    price: "K1200",
    category: "Kits",
    image: "https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-starter-kit.jpg",
    inStock: true,
    featured: true,
    badge: "Complete Kit"
  }
];

console.log('🚀 Populating Supabase with sample products...');
console.log('===============================================');

async function populateProducts() {
  try {
    // Check if products table exists and has data
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Error checking products table:', checkError.message);
      return;
    }

    if (existingProducts && existingProducts.length > 0) {
      console.log('ℹ️ Products already exist in database. Skipping population.');
      console.log('   Use the admin panel to manage existing products.');
      return;
    }

    console.log('📦 Adding sample products to Supabase...');

    // Insert products one by one to handle any schema issues
    for (let i = 0; i < sampleProducts.length; i++) {
      const product = sampleProducts[i];
      console.log(`   ${i + 1}. Adding: ${product.name}`);

      try {
        const { data, error } = await supabase
          .from('products')
          .insert([{
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category
          }])
          .select();

        if (error) {
          console.warn(`   ⚠️ Error adding ${product.name}:`, error.message);
          
          // Try with minimal schema only
          const { data: basicData, error: basicError } = await supabase
            .from('products')
            .insert([{
              name: product.name,
              description: product.description,
              price: product.price,
              category: product.category
            }])
            .select();

          if (basicError) {
            console.error(`   ❌ Failed to add ${product.name}:`, basicError.message);
          } else {
            console.log(`   ✅ Added ${product.name} (basic schema)`);
          }
        } else {
          console.log(`   ✅ Added ${product.name}`);
        }
      } catch (productError) {
        console.error(`   ❌ Exception adding ${product.name}:`, productError.message);
      }
    }

    console.log('\n🎉 Product population complete!');
    console.log('===============================');
    console.log('You can now:');
    console.log('1. Visit the admin panel to manage products');
    console.log('2. View products on the main website');
    console.log('3. Add more products through the admin interface');

  } catch (error) {
    console.error('❌ Error populating products:', error);
  }
}

// Run the script
populateProducts();
