import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Database,
  Image,
  Layout,
  Users,
  ShoppingBag,
  Home,
  FileText,
  Palette,
  Globe,
  Save,
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import supabaseService from '../services/supabase';
import { initializeDatabaseDirect } from '../utils/initializeDatabase';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, deleteProduct, loading } = useProducts();
  const { settings: siteSettings, updateSettings, loading: settingsLoading } = useSiteSettings();
  const [activeTab, setActiveTab] = useState('products');
  const [initializingDB, setInitializingDB] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    inStock: true,
    featured: false,
    badge: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  // Initialize database on component mount
  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    setInitializingDB(true);
    try {
      const success = await initializeDatabaseDirect();
      if (success) {
        setMessage({ type: 'success', text: 'Database initialized successfully!' });
      } else {
        setMessage({ type: 'info', text: 'Database tables already exist or initialization skipped' });
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      setMessage({ type: 'error', text: 'Failed to initialize database' });
    } finally {
      setInitializingDB(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const saveSiteSettings = async (newSettings) => {
    try {
      const success = await updateSettings(newSettings);
      if (success) {
        setMessage({ type: 'success', text: 'Site settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save site settings' });
      }
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving site settings:', error);
      setMessage({ type: 'error', text: 'Failed to save site settings' });
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      setMessage({ type: 'error', text: 'Name and price are required' });
      return;
    }

    try {
      await addProduct({
        ...newProduct,
        price: newProduct.price.startsWith('K') ? newProduct.price : `K${newProduct.price}`
      });
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        inStock: true,
        featured: false,
        badge: ''
      });
      setMessage({ type: 'success', text: 'Product added successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error adding product:', error);
      setMessage({ type: 'error', text: 'Failed to add product' });
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      await updateProduct(editingProduct.id, editingProduct);
      setEditingProduct(null);
      setMessage({ type: 'success', text: 'Product updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating product:', error);
      setMessage({ type: 'error', text: 'Failed to update product' });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(productId);
      setMessage({ type: 'success', text: 'Product deleted successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setMessage({ type: 'error', text: 'Failed to delete product' });
    }
  };

  const handleImageUpload = async (file, type = 'product') => {
    if (!file) return;

    setUploading(true);
    try {
      const result = await supabaseService.uploadProductImage(file);
      
      if (type === 'product' && editingProduct) {
        setEditingProduct({ ...editingProduct, image: result.publicUrl });
      } else if (type === 'new-product') {
        setNewProduct({ ...newProduct, image: result.publicUrl });
      } else if (type === 'logo') {
        setSiteSettings({ ...siteSettings, logo: result.publicUrl });
      }

      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'site-settings', label: 'Site Settings', icon: Settings },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'analytics', label: 'Analytics', icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Full website customization & management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Website
              </button>
              <button
                onClick={() => navigate('/admin-mode')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                Admin Mode
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4`}>
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow-sm p-6 mr-8">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Products:</span>
                  <span className="font-medium">{products?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Featured:</span>
                  <span className="font-medium">
                    {products?.filter(p => p.featured)?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">In Stock:</span>
                  <span className="font-medium">
                    {products?.filter(p => p.inStock)?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Product Management</h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => navigate('/supabase-manager')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      Supabase Manager
                    </button>
                  </div>
                </div>

                {/* Add New Product Form */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Product</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Price (e.g., K650)"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Badge (optional)"
                      value={newProduct.badge}
                      onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    placeholder="Product Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mt-4"
                    rows="3"
                  />
                  <div className="flex items-center space-x-4 mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newProduct.inStock}
                        onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.checked })}
                        className="mr-2"
                      />
                      In Stock
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newProduct.featured}
                        onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                        className="mr-2"
                      />
                      Featured
                    </label>
                  </div>
                  <div className="flex items-center space-x-4 mt-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], 'new-product')}
                      className="hidden"
                      id="new-product-image"
                    />
                    <label
                      htmlFor="new-product-image"
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </label>
                    {newProduct.image && (
                      <img src={newProduct.image} alt="Preview" className="w-16 h-16 object-cover rounded" />
                    )}
                    <button
                      onClick={handleAddProduct}
                      disabled={uploading}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </button>
                  </div>
                </div>

                {/* Products List */}
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8">
                      <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                      <p className="text-gray-600">Loading products...</p>
                    </div>
                  ) : products?.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Yet</h3>
                      <p className="text-gray-600">Add your first product using the form above.</p>
                    </div>
                  ) : (
                    products?.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                        {editingProduct?.id === product.id ? (
                          <ProductEditForm
                            product={editingProduct}
                            setProduct={setEditingProduct}
                            onSave={handleUpdateProduct}
                            onCancel={() => setEditingProduct(null)}
                            onImageUpload={(file) => handleImageUpload(file, 'product')}
                            uploading={uploading}
                          />
                        ) : (
                          <ProductDisplayCard
                            product={product}
                            onEdit={() => setEditingProduct({ ...product })}
                            onDelete={() => handleDeleteProduct(product.id)}
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Site Settings Tab */}
            {activeTab === 'site-settings' && (
              <SiteSettingsTab
                settings={siteSettings}
                onSave={saveSiteSettings}
                onImageUpload={(file) => handleImageUpload(file, 'logo')}
                uploading={uploading}
                loading={settingsLoading}
              />
            )}

            {/* Other tabs will be implemented */}
            {activeTab !== 'products' && activeTab !== 'site-settings' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-gray-600">This section is under development.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Product Edit Form Component
const ProductEditForm = ({ product, setProduct, onSave, onCancel, onImageUpload, uploading }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="text"
        value={product.name}
        onChange={(e) => setProduct({ ...product, name: e.target.value })}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        value={product.price}
        onChange={(e) => setProduct({ ...product, price: e.target.value })}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <textarea
      value={product.description}
      onChange={(e) => setProduct({ ...product, description: e.target.value })}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      rows="3"
    />
    <div className="flex items-center space-x-4">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onImageUpload(e.target.files[0])}
        className="hidden"
        id={`edit-image-${product.id}`}
      />
      <label
        htmlFor={`edit-image-${product.id}`}
        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center"
      >
        <Upload className="w-4 h-4 mr-2" />
        Change Image
      </label>
      {product.image && (
        <img src={product.image} alt="Preview" className="w-16 h-16 object-cover rounded" />
      )}
      <button
        onClick={onSave}
        disabled={uploading}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
      >
        <Save className="w-4 h-4 mr-2" />
        Save
      </button>
      <button
        onClick={onCancel}
        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
      >
        Cancel
      </button>
    </div>
  </div>
);

// Product Display Card Component
const ProductDisplayCard = ({ product, onEdit, onDelete }) => (
  <div className="flex items-center space-x-4">
    <img
      src={product.image || 'https://via.placeholder.com/64x64?text=No+Image'}
      alt={product.name}
      className="w-16 h-16 object-cover rounded"
    />
    <div className="flex-1">
      <h3 className="font-semibold text-gray-900">{product.name}</h3>
      <p className="text-sm text-gray-600">{product.category} - {product.price}</p>
      <p className="text-xs text-gray-500 mt-1">{product.description}</p>
    </div>
    <div className="flex items-center space-x-2">
      {product.featured && <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Featured</span>}
      {product.inStock ? (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">In Stock</span>
      ) : (
        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Out of Stock</span>
      )}
      <button
        onClick={onEdit}
        className="text-blue-600 hover:text-blue-800"
      >
        <Edit className="w-4 h-4" />
      </button>
      <button
        onClick={onDelete}
        className="text-red-600 hover:text-red-800"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Site Settings Tab Component
const SiteSettingsTab = ({ settings, onSave, onImageUpload, uploading, loading }) => {
  const [localSettings, setLocalSettings] = React.useState(settings);

  // Update local settings when context settings change
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
  };

  const updateLocalSetting = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateSocialLink = (platform, value) => {
    setLocalSettings(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mr-3" />
          <span className="text-gray-600">Loading site settings...</span>
        </div>
      </div>
    );
  }

  return (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-gray-900">Site Settings</h2>
      <button
        onClick={handleSave}
        disabled={uploading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center disabled:opacity-50"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Settings
      </button>
    </div>

    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
          <input
            type="text"
            value={localSettings.siteName || ''}
            onChange={(e) => updateLocalSetting('siteName', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
          <input
            type="text"
            value={localSettings.tagline || ''}
            onChange={(e) => updateLocalSetting('tagline', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Header Text</label>
        <input
          type="text"
          value={localSettings.headerText || ''}
          onChange={(e) => updateLocalSetting('headerText', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Footer Text</label>
        <textarea
          value={localSettings.footerText || ''}
          onChange={(e) => updateLocalSetting('footerText', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
          <input
            type="text"
            value={localSettings.socialLinks?.facebook || ''}
            onChange={(e) => updateSocialLink('facebook', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
          <input
            type="text"
            value={localSettings.socialLinks?.twitter || ''}
            onChange={(e) => updateSocialLink('twitter', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
          <input
            type="text"
            value={localSettings.socialLinks?.tiktok || ''}
            onChange={(e) => updateSocialLink('tiktok', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onImageUpload(e.target.files[0])}
            className="hidden"
            id="logo-upload"
          />
          <label
            htmlFor="logo-upload"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Logo
          </label>
          {localSettings.logo && (
            <img src={localSettings.logo} alt="Logo" className="w-16 h-16 object-cover rounded" />
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default SuperAdminDashboard;
