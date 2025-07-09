import React, { useState } from 'react';
import { Upload, X, Save, Trash2, RefreshCw } from 'lucide-react';
import { productService } from '../services/productService';
import { firebaseMetadataService } from '../services/firebaseMetadataService';
import { clearAllImages } from '../utils/clearAllImages';

const FreshAdminUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    featured: false
  });

  // Handle image upload and product creation
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!newProduct.title.trim()) {
      alert('Please enter a product title first');
      return;
    }

    setUploading(true);
    try {
      console.log('📤 Uploading image to Vercel Blob...');
      
      // Upload to Vercel Blob
      const uploadResult = await productService.uploadImage(file, `products/${Date.now()}-${file.name}`);
      
      console.log('✅ Image uploaded to Vercel Blob:', uploadResult.url);
      
      // Create product with Vercel Blob URL
      const productData = {
        title: newProduct.title.trim(),
        description: newProduct.description.trim(),
        category: newProduct.category.trim(),
        price: parseFloat(newProduct.price) || 0,
        featured: newProduct.featured,
        image: uploadResult.url, // Vercel Blob URL
        in_stock: true,
        created_at: new Date().toISOString()
      };
      
      // Save to Firebase
      const productId = await firebaseMetadataService.createProduct(productData);
      
      console.log('✅ Product created in Firebase:', productId);
      
      // Add to local state
      setProducts(prev => [...prev, { id: productId, ...productData }]);
      
      // Reset form
      setNewProduct({
        title: '',
        description: '',
        category: '',
        price: '',
        featured: false
      });
      
      // Clear file input
      event.target.value = '';
      
      alert('Product uploaded successfully!');
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Clear all existing images
  const handleClearAll = async () => {
    if (!confirm('⚠️ This will DELETE ALL existing products and images. Are you sure?')) {
      return;
    }
    
    setClearing(true);
    try {
      const result = await clearAllImages();
      
      if (result.success) {
        setProducts([]);
        alert(`✅ Cleared ${result.clearedCount} products successfully!`);
      } else {
        alert('❌ Failed to clear: ' + result.message);
      }
    } catch (error) {
      console.error('Error clearing:', error);
      alert('Error: ' + error.message);
    } finally {
      setClearing(false);
    }
  };

  // Delete single product
  const handleDeleteProduct = async (productId) => {
    if (!confirm('Delete this product?')) return;
    
    try {
      await firebaseMetadataService.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      console.log('✅ Product deleted:', productId);
    } catch (error) {
      console.error('❌ Delete failed:', error);
      alert('Delete failed: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Fresh Admin Upload</h2>
        <p className="text-gray-600">Upload new products with images directly to Vercel Blob</p>
      </div>

      {/* Clear All Button */}
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Reset Everything</h3>
        <p className="text-red-600 mb-3">Clear all existing products and start fresh</p>
        <button
          onClick={handleClearAll}
          disabled={clearing}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
        >
          {clearing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          {clearing ? 'Clearing...' : 'Clear All Products'}
        </button>
      </div>

      {/* Upload Form */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Add New Product</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Product Title *"
            value={newProduct.title}
            onChange={(e) => setNewProduct(prev => ({ ...prev, title: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <input
            type="text"
            placeholder="Category"
            value={newProduct.category}
            onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newProduct.featured}
              onChange={(e) => setNewProduct(prev => ({ ...prev, featured: e.target.checked }))}
              className="rounded"
            />
            <span>Featured Product</span>
          </label>
        </div>
        
        <textarea
          placeholder="Product Description"
          value={newProduct.description}
          onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          rows="3"
        />
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer">
            {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload Image & Create Product'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading || !newProduct.title.trim()}
              className="hidden"
            />
          </label>
          
          {!newProduct.title.trim() && (
            <span className="text-red-500 text-sm">Enter title first</span>
          )}
        </div>
      </div>

      {/* Products List */}
      {products.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Uploaded Products ({products.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <h4 className="font-semibold">{product.title}</h4>
                <p className="text-sm text-gray-600">{product.category}</p>
                <p className="text-sm font-medium">${product.price}</p>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="mt-2 text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FreshAdminUpload;
