import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  MessageCircle,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Database
} from 'lucide-react';
import adminSettingsService from '../services/adminSettingsService';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('site');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState(null);

  // Site Settings
  const [siteSettings, setSiteSettings] = useState({});
  
  // Footer Settings
  const [footerSettings, setFooterSettings] = useState({});
  
  // Categories
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    sort_order: 0
  });

  // Load all settings
  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const [site, footer, cats] = await Promise.all([
        adminSettingsService.getSiteSettings(),
        adminSettingsService.getFooterSettings(),
        adminSettingsService.getAdminCategories()
      ]);
      
      setSiteSettings(site);
      setFooterSettings(footer);
      setCategories(cats);
      
      console.log('✅ All settings loaded successfully');
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      showMessage('Error loading settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save site settings
  const saveSiteSettings = async () => {
    try {
      setSaving(true);
      await adminSettingsService.updateSiteSettings(siteSettings);
      showMessage('Site settings saved successfully!', 'success');
    } catch (error) {
      console.error('❌ Error saving site settings:', error);
      showMessage('Error saving site settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save footer settings
  const saveFooterSettings = async () => {
    try {
      setSaving(true);
      await adminSettingsService.updateFooterSettings(footerSettings);
      showMessage('Footer settings saved successfully!', 'success');
    } catch (error) {
      console.error('❌ Error saving footer settings:', error);
      showMessage('Error saving footer settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Add new category
  const addCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        showMessage('Category name is required', 'error');
        return;
      }

      setSaving(true);
      const created = await adminSettingsService.createCategory(newCategory);
      setCategories(prev => [...prev, created]);
      setNewCategory({ name: '', description: '', icon: '', color: '#3B82F6', sort_order: 0 });
      showMessage('Category added successfully!', 'success');
    } catch (error) {
      console.error('❌ Error adding category:', error);
      showMessage('Error adding category', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete category
  const deleteCategory = async (categoryId) => {
    try {
      if (!confirm('Are you sure you want to delete this category?')) return;
      
      setSaving(true);
      await adminSettingsService.deleteCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      showMessage('Category deleted successfully!', 'success');
    } catch (error) {
      console.error('❌ Error deleting category:', error);
      showMessage('Error deleting category', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Show message
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Test Firebase connection
  const testFirebaseConnection = async () => {
    try {
      setTesting(true);
      console.log('🔄 Testing Firebase connection for admin settings...');

      await adminSettingsService.testConnection();
      showMessage('✅ Firebase connection test successful! Settings can be saved.', 'success');
    } catch (error) {
      console.error('❌ Firebase test failed:', error);
      showMessage(`❌ Firebase connection failed: ${error.message}`, 'error');
    } finally {
      setTesting(false);
    }
  };

  // Initialize default settings
  const initializeDefaults = async () => {
    try {
      setSaving(true);
      await adminSettingsService.initializeDefaultSettings();
      await loadSettings();
      showMessage('Default settings initialized successfully!', 'success');
    } catch (error) {
      console.error('❌ Error initializing defaults:', error);
      showMessage('Error initializing defaults', 'error');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>
          <p className="text-gray-600">Manage site settings, footer, and categories</p>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 
          'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? 
            <CheckCircle className="w-5 h-5" /> : 
            <AlertCircle className="w-5 h-5" />
          }
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'site', label: 'Site Settings', icon: Globe },
            { id: 'footer', label: 'Footer Settings', icon: MapPin },
            { id: 'categories', label: 'Categories', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Site Settings Tab */}
      {activeTab === 'site' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={siteSettings.site_name || ''}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, site_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <input
                type="text"
                value={siteSettings.currency || ''}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Primary Phone
              </label>
              <input
                type="text"
                value={siteSettings.contact_phone || ''}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, contact_phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Secondary Phone
              </label>
              <input
                type="text"
                value={siteSettings.contact_phone_2 || ''}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, contact_phone_2: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                WhatsApp Number
              </label>
              <input
                type="text"
                value={siteSettings.whatsapp_number || ''}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={siteSettings.email || ''}
                onChange={(e) => setSiteSettings(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              value={siteSettings.site_description || ''}
              onChange={(e) => setSiteSettings(prev => ({ ...prev, site_description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Address
            </label>
            <input
              type="text"
              value={siteSettings.address || ''}
              onChange={(e) => setSiteSettings(prev => ({ ...prev, address: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={testFirebaseConnection}
              disabled={testing}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Database className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Testing...' : 'Test Firebase'}
            </button>

            <button
              onClick={saveSiteSettings}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Site Settings'}
            </button>

            <button
              onClick={initializeDefaults}
              disabled={saving}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4" />
              Initialize Defaults
            </button>
          </div>
        </div>
      )}

      {/* Footer Settings Tab */}
      {activeTab === 'footer' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={footerSettings.company_name || ''}
                onChange={(e) => setFooterSettings(prev => ({ ...prev, company_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={footerSettings.tagline || ''}
                onChange={(e) => setFooterSettings(prev => ({ ...prev, tagline: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Footer Description
            </label>
            <textarea
              value={footerSettings.description || ''}
              onChange={(e) => setFooterSettings(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copyright Text
            </label>
            <input
              type="text"
              value={footerSettings.copyright_text || ''}
              onChange={(e) => setFooterSettings(prev => ({ ...prev, copyright_text: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={saveFooterSettings}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Footer Settings'}
          </button>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Add New Category */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Category Name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Description"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={addCategory}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Category
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Existing Categories</h3>
            {categories.length === 0 ? (
              <p className="text-gray-600">No categories found. Add some categories above.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{category.name}</h4>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className={`px-2 py-1 rounded ${category.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span>Order: {category.sort_order}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
