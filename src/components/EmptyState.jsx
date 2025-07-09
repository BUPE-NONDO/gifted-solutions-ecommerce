import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Plus, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const EmptyState = ({
  title = "No Products Found",
  message = "There are no products in the database yet.",
  showAdminActions = true,
  type = "products" // products, search, category, error
}) => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-16 h-16 text-red-500" />;
      case 'search':
        return <Database className="w-16 h-16 text-gray-400" />;
      case 'category':
        return <Database className="w-16 h-16 text-gray-400" />;
      default:
        return <Database className="w-16 h-16 text-gray-400" />;
    }
  };

  const getActionButtons = () => {
    if (!showAdminActions || !isAdmin) return null;

    return (
      <div className="space-y-3">
        <button
          onClick={() => navigate('/super-admin')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Access Super Admin
        </button>

        <button
          onClick={() => navigate('/database-test')}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          <Upload className="w-5 h-5 mr-2" />
          Test Database Connection
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-6 flex justify-center">
          {getIcon()}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {message}
        </p>

        {getActionButtons()}

        {type === 'products' && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Getting Started:
            </h3>
            <ul className="text-xs text-blue-800 space-y-1 text-left">
              <li>• Click "Enable Admin Mode" to access admin features</li>
              <li>• Use "Seed Products" to populate the database</li>
              <li>• Add your own products using the admin panel</li>
              <li>• Upload product images directly on the website</li>
            </ul>
          </div>
        )}

        {type === 'error' && (
          <div className="mt-8 p-4 bg-red-50 rounded-lg">
            <h3 className="text-sm font-semibold text-red-900 mb-2">
              Troubleshooting:
            </h3>
            <ul className="text-xs text-red-800 space-y-1 text-left">
              <li>• Check your internet connection</li>
              <li>• Verify Supabase configuration</li>
              <li>• Try refreshing the page</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Specific empty state components for different scenarios
export const ProductsEmptyState = () => (
  <EmptyState
    title="No Products Available"
    message="No products are currently available. Please check back later."
    type="products"
    showAdminActions={false}
  />
);

export const SearchEmptyState = ({ searchTerm }) => (
  <EmptyState
    title="No Search Results"
    message={`No products found matching "${searchTerm}". Try different keywords or browse all products.`}
    type="search"
    showAdminActions={false}
  />
);

export const CategoryEmptyState = ({ category }) => (
  <EmptyState
    title="No Products in Category"
    message={`No products found in the "${category}" category. Check other categories or add products to this category.`}
    type="category"
    showAdminActions={false}
  />
);

export const ErrorEmptyState = ({ error }) => (
  <EmptyState
    title="Connection Error"
    message={error || "Unable to load products. Please check your connection and try again."}
    type="error"
    showAdminActions={false}
  />
);

export default EmptyState;
