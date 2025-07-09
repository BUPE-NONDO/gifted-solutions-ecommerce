# 🖼️ Gallery System Documentation

## Overview

The Gallery System is a complete e-commerce-style interface for managing and displaying Supabase images with prices, descriptions, and metadata. It works exactly like the Shop page but for images stored in Supabase storage.

## 🎯 Features

### For Customers
- **Browse all Supabase images** in a beautiful gallery layout
- **Search and filter** by title, description, or category
- **Sort by** name, price, category, or featured status
- **View modes** - Grid and list layouts
- **Add to cart** - Purchase images with prices
- **Responsive design** - Works on all devices

### For Admins
- **Complete metadata management** through SuperAdmin panel
- **Add prices and descriptions** to any image
- **Mark images as featured** for promotion
- **Track stock status** and availability
- **Real-time updates** across the website
- **Sample data loading** for quick setup

## 🚀 How to Use

### Customer Experience

1. **Navigate to Gallery**
   - Click "Gallery" in the main navigation
   - Or visit `/gallery` directly

2. **Browse Images**
   - View all Supabase images in grid or list format
   - Use category filters on the left sidebar
   - Search for specific items using the search bar

3. **Filter and Sort**
   - **Categories**: Filter by Microcontrollers, Sensors, Components, etc.
   - **Search**: Find items by title, description, or category
   - **Sort**: By name, price, category, or featured status
   - **View**: Switch between grid and list layouts

4. **Purchase Items**
   - Images with prices show "Add to Cart" buttons
   - Click to add items to your shopping cart
   - Proceed to checkout via WhatsApp

### Admin Management

1. **Access SuperAdmin**
   - Navigate to `/super-admin`
   - Click on the "Gallery" tab

2. **Load Sample Data** (First Time Setup)
   - Click "Load Sample Data" button
   - This adds prices and descriptions to existing images
   - Perfect for testing and initial setup

3. **Edit Image Metadata**
   - Find any image in the gallery grid
   - Click "Edit Details" on any image card
   - Fill in the form:
     - **Title**: Display name for the image
     - **Description**: Detailed product description
     - **Price**: Price in K currency (e.g., 650 for K650)
     - **Featured**: Mark as featured item
     - **In Stock**: Availability status

4. **Save Changes**
   - Click "Save" to apply changes
   - Changes appear immediately on the gallery
   - Data is saved locally (database-ready)

## 📊 Gallery Statistics

The SuperAdmin Gallery tab shows:
- **Total Images**: Number of images in Supabase storage
- **With Prices**: Images available for purchase
- **Featured**: Promoted items count
- **Categories**: Number of unique categories

## 🛠️ Technical Details

### File Structure
```
src/
├── pages/Gallery.jsx           # Main gallery page
├── context/ImageContext.jsx    # Image state management
├── utils/sampleImageData.js    # Sample metadata
└── components/
    └── GalleryImageCard.jsx    # Admin editing component
```

### Database Schema
```sql
CREATE TABLE image_metadata (
  id SERIAL PRIMARY KEY,
  image_name VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  in_stock BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  tags TEXT[],
  specifications JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Integration
- **Supabase Storage**: Images loaded from `product-images/products/`
- **Metadata Storage**: Image details stored in `image_metadata` table
- **Real-time Updates**: Changes sync across browser tabs
- **Fallback System**: Uses sample data when database unavailable

## 🎨 UI Components

### Gallery Page Components
- **Search Bar**: Real-time search functionality
- **Category Sidebar**: Filter by image categories
- **Sort Controls**: Multiple sorting options
- **View Toggle**: Grid/list view switcher
- **Image Cards**: Display images with metadata
- **Add to Cart**: Purchase functionality

### Admin Components
- **Statistics Cards**: Overview dashboard
- **Image Grid**: All images with edit buttons
- **Inline Editor**: Edit metadata directly
- **Action Buttons**: Save, cancel, refresh
- **Sample Data Loader**: Quick setup tool

## 🔧 Configuration

### Sample Data
The system includes sample metadata for common electronics components:
- Arduino Uno R3 - K650
- ESP32 Development Board - K850
- Ultrasonic Sensor HC-SR04 - K120
- Solderless Breadboard - K45
- And more...

### Categories
Images are automatically categorized based on filename:
- **Microcontrollers**: Arduino, ESP32, etc.
- **WiFi Modules**: ESP8266, ESP32, etc.
- **Sensors**: Ultrasonic, temperature, etc.
- **Components**: Breadboards, LEDs, resistors, etc.

## 🚀 Getting Started

1. **Upload Images to Supabase**
   - Use the SuperAdmin Images tab
   - Upload to the `products` folder

2. **Load Sample Data**
   - Go to SuperAdmin → Gallery tab
   - Click "Load Sample Data"
   - This adds prices and descriptions

3. **Customize Metadata**
   - Edit any image using "Edit Details"
   - Add your own prices and descriptions
   - Mark featured items

4. **Test the Gallery**
   - Visit `/gallery` to see the results
   - Test search, filters, and cart functionality

## 🎉 Success!

Your Gallery system is now fully functional! Customers can browse and purchase your electronic components, while you can easily manage prices and descriptions through the admin panel.

The system is designed to scale with your business and provides a professional e-commerce experience for your Supabase images.
