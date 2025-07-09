import { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Check, 
  AlertCircle,
  Package,
  Tag,
  Star,
  DollarSign,
  Image,
  FileText
} from 'lucide-react';
import { createAllProductTables } from '../utils/createProductMetadataTable';
import productMetadataService from '../services/productMetadataService';

const ProductMetadataManager = () => {
  const [isCreatingTables, setIsCreatingTables] = useState(false);
  const [tablesCreated, setTablesCreated] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('products');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock_quantity: '',
    sku: '',
    featured: false,
    in_stock: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    slug: '',
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'products') {
        const productsData = await productMetadataService.getProducts({
          status: 'active',
          limit: 50 // Limit for performance
        });
        setProducts(productsData || []);
        console.log(`✅ Loaded ${productsData?.length || 0} products`);
      } else if (activeTab === 'categories') {
        const categoriesData = await productMetadataService.getCategories();
        setCategories(categoriesData || []);
        console.log(`✅ Loaded ${categoriesData?.length || 0} categories`);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(`Failed to load ${activeTab}: ${error.message}`);

      // Set empty arrays on error
      if (activeTab === 'products') {
        setProducts([]);
      } else if (activeTab === 'categories') {
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTables = async () => {
    setIsCreatingTables(true);
    try {
      const result = await createAllProductTables();
      if (result.success) {
        setTablesCreated(true);
        alert('✅ Product metadata tables created successfully!');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error creating tables:', error);
      alert(`❌ Error creating tables: ${error.message}`);
    } finally {
      setIsCreatingTables(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      // Validate required fields
      if (!productForm.name.trim()) {
        alert('❌ Product name is required');
        return;
      }

      if (!productForm.price || parseFloat(productForm.price) < 0) {
        alert('❌ Valid price is required');
        return;
      }

      const newProduct = await productMetadataService.createProduct({
        ...productForm,
        price: parseFloat(productForm.price),
        stock_quantity: parseInt(productForm.stock_quantity) || 0
      });

      setProducts([...products, newProduct]);
      setProductForm({
        name: '',
        description: '',
        category: '',
        price: '',
        stock_quantity: '',
        sku: '',
        featured: false,
        in_stock: true
      });
      setShowAddForm(false);
      alert('✅ Product added successfully!');

      // Reload data to ensure consistency
      await loadData();
    } catch (error) {
      console.error('Error adding product:', error);
      alert(`❌ Error adding product: ${error.message}`);
    }
  };

  const handleAddCategory = async () => {
    try {
      const newCategory = await productMetadataService.createCategory(categoryForm);
      setCategories([...categories, newCategory]);
      setCategoryForm({
        name: '',
        description: '',
        slug: '',
        is_active: true
      });
      setShowAddForm(false);
      alert('✅ Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      alert(`❌ Error adding category: ${error.message}`);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productMetadataService.deleteProduct(productId);
        setProducts(products.filter(p => p.product_id !== productId));
        alert('✅ Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert(`❌ Error deleting product: ${error.message}`);
      }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await productMetadataService.deleteCategory(categoryId);
        setCategories(categories.filter(c => c.id !== categoryId));
        alert('✅ Category deleted successfully!');
      } catch (error) {
        console.error('Error deleting category:', error);
        alert(`❌ Error deleting category: ${error.message}`);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Metadata Manager</h1>
                <p className="text-gray-600">Comprehensive CRUD operations for product metadata</p>
              </div>
            </div>
            
            <button
              onClick={handleCreateTables}
              disabled={isCreatingTables}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
            >
              {isCreatingTables ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Database className="h-4 w-4" />
              )}
              <span>{isCreatingTables ? 'Creating...' : 'Create Tables'}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'products', label: 'Products', icon: Package },
              { id: 'categories', label: 'Categories', icon: Tag },
              { id: 'stats', label: 'Statistics', icon: Star }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Products</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading products...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setEditingItem(product)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.product_id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">{product.currency}{product.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Stock:</span>
                          <span className={`font-medium ${product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock_quantity}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{product.category}</span>
                        </div>
                        {product.featured && (
                          <div className="flex items-center space-x-1 text-yellow-600">
                            <Star className="h-3 w-3" />
                            <span className="text-xs">Featured</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Category</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading categories...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <div key={category.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setEditingItem(category)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="text-gray-600">{category.description}</div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Slug:</span>
                          <span className="font-mono text-xs">{category.slug}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-medium ${category.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-blue-600">Total Products</p>
                      <p className="text-2xl font-bold text-blue-900">{products.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center">
                    <Check className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-green-600">In Stock</p>
                      <p className="text-2xl font-bold text-green-900">
                        {products.filter(p => p.in_stock).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                  <div className="flex items-center">
                    <Star className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-yellow-600">Featured</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {products.filter(p => p.featured).length}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center">
                    <Tag className="h-8 w-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-purple-600">Categories</p>
                      <p className="text-2xl font-bold text-purple-900">{categories.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddForm && activeTab === 'products' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Product</h3>
              <button onClick={() => setShowAddForm(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Product Name"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="3"
              />
              <input
                type="text"
                placeholder="Category"
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Price"
                value={productForm.price}
                onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                value={productForm.stock_quantity}
                onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                placeholder="SKU"
                value={productForm.sku}
                onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                    className="mr-2"
                  />
                  Featured
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.in_stock}
                    onChange={(e) => setProductForm({...productForm, in_stock: e.target.checked})}
                    className="mr-2"
                  />
                  In Stock
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddForm && activeTab === 'categories' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New Category</h3>
              <button onClick={() => setShowAddForm(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Category Name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="3"
              />
              <input
                type="text"
                placeholder="Slug (auto-generated if empty)"
                value={categoryForm.slug}
                onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={categoryForm.is_active}
                  onChange={(e) => setCategoryForm({...categoryForm, is_active: e.target.checked})}
                  className="mr-2"
                />
                Active
              </label>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMetadataManager;
