import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Percent, 
  DollarSign,
  Package,
  Users,
  Target,
  AlertCircle
} from 'lucide-react';

const BulkDiscountManager = () => {
  const [discounts, setDiscounts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state for new/edit discount
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'percentage', // 'percentage' or 'fixed'
    value: '',
    minQuantity: '',
    maxQuantity: '',
    applicableProducts: 'all', // 'all', 'category', 'specific'
    categoryFilter: '',
    specificProducts: [],
    isActive: true,
    startDate: '',
    endDate: ''
  });

  // Load existing discounts
  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      // Load from localStorage for now (can be replaced with API call)
      const savedDiscounts = localStorage.getItem('bulkDiscounts');
      if (savedDiscounts) {
        setDiscounts(JSON.parse(savedDiscounts));
      }
    } catch (error) {
      console.error('Error loading discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDiscounts = (updatedDiscounts) => {
    try {
      localStorage.setItem('bulkDiscounts', JSON.stringify(updatedDiscounts));
      setDiscounts(updatedDiscounts);
    } catch (error) {
      console.error('Error saving discounts:', error);
    }
  };

  const handleAddDiscount = () => {
    setFormData({
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      minQuantity: '',
      maxQuantity: '',
      applicableProducts: 'all',
      categoryFilter: '',
      specificProducts: [],
      isActive: true,
      startDate: '',
      endDate: ''
    });
    setEditingDiscount(null);
    setShowAddModal(true);
  };

  const handleEditDiscount = (discount) => {
    setFormData(discount);
    setEditingDiscount(discount.id);
    setShowAddModal(true);
  };

  const handleDeleteDiscount = (discountId) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      const updatedDiscounts = discounts.filter(d => d.id !== discountId);
      saveDiscounts(updatedDiscounts);
    }
  };

  const handleSaveDiscount = () => {
    if (!formData.name || !formData.value || !formData.minQuantity) {
      alert('Please fill in all required fields');
      return;
    }

    const discountData = {
      ...formData,
      id: editingDiscount || Date.now().toString(),
      value: parseFloat(formData.value),
      minQuantity: parseInt(formData.minQuantity),
      maxQuantity: formData.maxQuantity ? parseInt(formData.maxQuantity) : null,
      createdAt: editingDiscount ? discounts.find(d => d.id === editingDiscount)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let updatedDiscounts;
    if (editingDiscount) {
      updatedDiscounts = discounts.map(d => d.id === editingDiscount ? discountData : d);
    } else {
      updatedDiscounts = [...discounts, discountData];
    }

    saveDiscounts(updatedDiscounts);
    setShowAddModal(false);
  };

  const toggleDiscountStatus = (discountId) => {
    const updatedDiscounts = discounts.map(d => 
      d.id === discountId ? { ...d, isActive: !d.isActive } : d
    );
    saveDiscounts(updatedDiscounts);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Discount Management</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Configure quantity-based discounts for products
            </p>
          </div>
          <button
            onClick={handleAddDiscount}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Discount
          </button>
        </div>
      </div>

      {/* Discounts List */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Loading discounts...</p>
          </div>
        ) : discounts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No discounts configured</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create your first bulk discount to encourage larger purchases
            </p>
            <button
              onClick={handleAddDiscount}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Add First Discount
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {discounts.map((discount) => (
              <div
                key={discount.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {discount.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        discount.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {discount.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-3">{discount.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Discount:</span>
                        <div className="flex items-center mt-1">
                          {discount.type === 'percentage' ? (
                            <Percent className="w-4 h-4 text-green-600 mr-1" />
                          ) : (
                            <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                          )}
                          <span className="text-green-600 font-semibold">
                            {discount.type === 'percentage' ? `${discount.value}%` : `K${discount.value}`}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Quantity Range:</span>
                        <div className="flex items-center mt-1">
                          <Users className="w-4 h-4 text-blue-600 mr-1" />
                          <span className="text-blue-600">
                            {discount.minQuantity}{discount.maxQuantity ? `-${discount.maxQuantity}` : '+'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Applies To:</span>
                        <div className="flex items-center mt-1">
                          <Target className="w-4 h-4 text-purple-600 mr-1" />
                          <span className="text-purple-600 capitalize">
                            {discount.applicableProducts}
                            {discount.categoryFilter && ` (${discount.categoryFilter})`}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Valid Until:</span>
                        <div className="text-gray-600 dark:text-gray-300 mt-1">
                          {discount.endDate ? new Date(discount.endDate).toLocaleDateString() : 'No expiry'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => toggleDiscountStatus(discount.id)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        discount.isActive
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                      }`}
                    >
                      {discount.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEditDiscount(discount)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDiscount(discount.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingDiscount ? 'Edit Discount' : 'Add New Discount'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discount Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Bulk Purchase 10%"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discount Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (K)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                  placeholder="Describe when this discount applies..."
                />
              </div>
              
              {/* Discount Value and Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={formData.type === 'percentage' ? '10' : '50'}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({...formData, minQuantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Quantity
                  </label>
                  <input
                    type="number"
                    value={formData.maxQuantity}
                    onChange={(e) => setFormData({...formData, maxQuantity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Leave empty for no limit"
                  />
                </div>
              </div>
              
              {/* Product Application */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Applies To
                </label>
                <select
                  value={formData.applicableProducts}
                  onChange={(e) => setFormData({...formData, applicableProducts: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">All Products</option>
                  <option value="category">Specific Category</option>
                  <option value="specific">Specific Products</option>
                </select>
              </div>
              
              {formData.applicableProducts === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.categoryFilter}
                    onChange={(e) => setFormData({...formData, categoryFilter: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Arduino, Sensors, Components"
                  />
                </div>
              )}
              
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Activate this discount immediately
                </label>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDiscount}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingDiscount ? 'Update' : 'Create'} Discount
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkDiscountManager;
