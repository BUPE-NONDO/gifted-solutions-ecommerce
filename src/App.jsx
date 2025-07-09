import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ProductProvider } from './context/ProductContext';
import { ImageProvider } from './context/ImageContext';
import { SiteSettingsProvider } from './context/SiteSettingsContext';
import { DarkModeProvider } from './context/DarkModeContext';
// Removed problematic mobile image refresh service import
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Gallery from './pages/Gallery';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Contact from './pages/Contact';
import CustomRequest from './pages/CustomRequest';
import Login from './pages/Login';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DataDeletion from './pages/DataDeletion';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import AdminOrders from './pages/AdminOrders';
import TestPaymentConnection from './pages/TestPaymentConnection';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import DatabaseInitializer from './components/DatabaseInitializer';
import UnifiedImageManager from './components/UnifiedImageManager';
import MobileImageTest from './components/MobileImageTest';
import DatabaseTest from './components/DatabaseTest';
// Supabase imports removed - using Firebase + Vercel Blob only
import ProductImageUploader from './components/ProductImageUploader';

import CreateAdmin from './pages/CreateAdmin';
import SafeLogin from './pages/SafeLogin';
import SuperAdmin from './pages/SuperAdmin';
import AdminErrorBoundary from './components/AdminErrorBoundary';
// TestSupabaseOnly removed
import UpdateProductImages from './pages/UpdateProductImages';
import UpdateAccurateImages from './pages/UpdateAccurateImages';
import AutoUpdateImages from './pages/AutoUpdateImages';
import ImageTools from './pages/ImageTools';
import DeployWithRealImages from './pages/DeployWithRealImages';
// CheckSupabaseImages removed
import ProductMetadataManager from './components/ProductMetadataManager';
import ProductMetadataTest from './pages/ProductMetadataTest';
import ImageMigrationPanel from './components/admin/ImageMigrationPanel';
import ManualDatabaseSetup from './components/ManualDatabaseSetup';
import Chatbot from './components/Chatbot';
import ChatbotAdmin from './pages/ChatbotAdmin';
import FirebaseTest from './pages/FirebaseTest';
import VideoDemo from './pages/VideoDemo';




const TestHome = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-green-600 mb-4">
        🎯 Gifted Solutions - Test Menu
      </h1>
      <p className="text-xl text-gray-600 mb-6">
        All components working! ✅
      </p>
      <div className="space-y-6">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ Complete App is running at root path!
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          <Link to="/shop-test" className="bg-violet-500 text-white px-4 py-2 rounded hover:bg-violet-600 text-center">
            Shop Page Test
          </Link>
          <Link to="/home-test" className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-emerald-600 text-center">
            Home Page Test
          </Link>
          <Link to="/layout-test" className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600 text-center">
            Layout Test
          </Link>
          <Link to="/cart-test" className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 text-center">
            Cart Test
          </Link>
        </div>
        <div className="mt-8">
          <p className="text-sm text-gray-500 mb-4">
            The complete app is now running! Visit the root path to see the live app.
          </p>
          <div className="space-y-2">
            <div>
              <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-lg font-semibold inline-block">
                🚀 Go to Live App (Home)
              </Link>
            </div>
            <div>
              <Link to="/shop" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 text-lg font-semibold inline-block">
                🛍️ Go to Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ShopTest = () => {
  return (
    <div className="min-h-screen bg-violet-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Shop Page Content */}
      <main className="flex-grow">
        <Shop />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

const HomeTest = () => {
  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Home Page Content */}
      <main className="flex-grow">
        <Home />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

const LayoutTest = () => {
  return (
    <div className="min-h-screen bg-teal-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-teal-600 mb-6 text-center">
            🏗️ Layout Test (Header + Footer)
          </h1>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-bold mb-4">Layout Features to Test:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-teal-600">Header (Top):</h3>
                <ul className="text-sm space-y-1">
                  <li>• Navigation bar with company name</li>
                  <li>• Menu links (Home, Shop, Contact, etc.)</li>
                  <li>• Cart icon with count</li>
                  <li>• Login/Register buttons</li>
                  <li>• Mobile responsive menu</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-teal-600">Footer (Bottom):</h3>
                <ul className="text-sm space-y-1">
                  <li>• Company information</li>
                  <li>• Quick links</li>
                  <li>• Contact details</li>
                  <li>• Payment methods</li>
                  <li>• Social media links</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-bold mb-4">Test Instructions:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Scroll to the top - Header should be visible and sticky</li>
              <li>Scroll to the bottom - Footer should be at the bottom</li>
              <li>Test header navigation links</li>
              <li>Test footer links</li>
              <li>Check if layout is responsive (resize browser)</li>
              <li>Verify the page has proper spacing and layout</li>
            </ol>
          </div>

          <div className="bg-teal-100 p-6 rounded-lg mb-8">
            <h3 className="font-semibold mb-2">Sample Content for Scrolling:</h3>
            <p className="mb-4">This is sample content to test the layout. The header should stay at the top, and the footer should be at the bottom of the page.</p>
            {/* Add some content to make the page scrollable */}
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="mb-4 p-4 bg-white rounded">
                <h4 className="font-semibold">Sample Section {i + 1}</h4>
                <p>This is sample content to test scrolling and layout. The header should remain at the top while you scroll through this content.</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Back to Home
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

const HeaderTest = () => {
  return (
    <div className="min-h-screen bg-indigo-50">
      {/* Test Header */}
      <Header />

      {/* Test Content */}
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-indigo-600 mb-6 text-center">
            🧭 Header Component Test
          </h1>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-bold mb-4">Header Features to Test:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Navigation Links:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Company name/logo (should link to home)</li>
                  <li>• Home link</li>
                  <li>• Shop link</li>
                  <li>• Contact link</li>
                  <li>• Custom Request link</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">User Features:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Search icon</li>
                  <li>• Cart icon with count</li>
                  <li>• Login/Register buttons (if not logged in)</li>
                  <li>• User menu (if logged in)</li>
                  <li>• Mobile menu button</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-bold mb-4">Test Instructions:</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Check if header appears at the top</li>
              <li>Click on "Gifted Solutions" logo - should go to home</li>
              <li>Try clicking navigation links</li>
              <li>Click the cart icon - should open cart sidebar</li>
              <li>Try adding items to cart from other tests, then check cart count</li>
              <li>Test mobile responsiveness (resize browser)</li>
              <li>Check if login/register buttons appear</li>
            </ol>
          </div>

          <div className="text-center">
            <Link to="/" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const CartTest = () => {
  const { addToCart, items, removeFromCart, itemCount, clearCart } = useCart();

  const testProduct = {
    id: 1,
    name: "Test Arduino Uno",
    price: "K 650",
    category: "Test",
    image: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=400&h=400&fit=crop",
    description: "Test product for cart functionality"
  };

  return (
    <div className="min-h-screen bg-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-600 mb-6 text-center">
          🛒 Cart Context Test
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cart Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Cart Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => addToCart(testProduct, 1)}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Add Test Product to Cart
              </button>
              <button
                onClick={() => clearCart()}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Clear Cart
              </button>
              <div className="bg-blue-100 p-4 rounded">
                <strong>Cart Count: {itemCount}</strong>
              </div>
            </div>
          </div>

          {/* Cart Items */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Cart Items</h2>
            {items.length === 0 ? (
              <p className="text-gray-500">Cart is empty</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">Qty: {item.quantity} | {item.price}</div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

const AuthTest = () => {
  const { user, loading, login, logout, register } = useAuth();

  const handleTestLogin = async () => {
    try {
      // This is just a test - in real app you'd have proper email/password
      alert('Auth test - checking if login function exists');
      console.log('Login function available:', typeof login === 'function');
    } catch (error) {
      console.error('Auth test error:', error);
    }
  };

  const handleTestLogout = async () => {
    try {
      alert('Auth test - checking if logout function exists');
      console.log('Logout function available:', typeof logout === 'function');
    } catch (error) {
      console.error('Auth test error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-red-600 mb-6 text-center">
          🔐 Auth Provider Test
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Auth Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Auth Status</h2>
            <div className="space-y-4">
              <div className="bg-blue-100 p-4 rounded">
                <strong>Loading: </strong>{loading ? 'Yes' : 'No'}
              </div>
              <div className="bg-green-100 p-4 rounded">
                <strong>User: </strong>{user ? user.email || 'Logged in' : 'Not logged in'}
              </div>
              <div className="bg-yellow-100 p-4 rounded">
                <strong>Auth Functions Available:</strong>
                <ul className="mt-2 text-sm">
                  <li>• Login: {typeof login === 'function' ? '✅' : '❌'}</li>
                  <li>• Logout: {typeof logout === 'function' ? '✅' : '❌'}</li>
                  <li>• Register: {typeof register === 'function' ? '✅' : '❌'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Auth Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Auth Actions</h2>
            <div className="space-y-4">
              <button
                onClick={handleTestLogin}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Test Login Function
              </button>
              <button
                onClick={handleTestLogout}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Test Logout Function
              </button>
              <div className="bg-gray-100 p-4 rounded text-sm">
                <strong>Note:</strong> This tests if auth functions are available.
                Real login/logout will be tested later with Firebase.
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

const TestPage = () => (
  <div className="min-h-screen bg-blue-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        📄 Test Page
      </h1>
      <p className="text-xl text-gray-600 mb-6">
        Navigation is working!
      </p>
      <Link to="/" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Back to Home
      </Link>
    </div>
  </div>
);

const AboutPage = () => (
  <div className="min-h-screen bg-purple-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-purple-600 mb-4">
        ℹ️ About Page
      </h1>
      <p className="text-xl text-gray-600 mb-6">
        Routing between pages works!
      </p>
      <Link to="/" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
        Back to Home
      </Link>
    </div>
  </div>
);

function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <SiteSettingsProvider>
          <ProductProvider>
            <ImageProvider>
              <CartProvider>
              <DatabaseInitializer>
                <Router>
                  <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col transition-colors duration-200">
                    <Header />
                    <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/debug" element={
                  <div className="p-8">
                    <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
                    <div className="space-y-4">
                      <div className="bg-gray-100 p-4 rounded">
                        <strong>Current URL:</strong> {window.location.href}
                      </div>
                      <div className="bg-gray-100 p-4 rounded">
                        <strong>React Version:</strong> Working
                      </div>
                      <div className="bg-gray-100 p-4 rounded">
                        <strong>Router:</strong> Working
                      </div>
                      <Link to="/" className="bg-blue-500 text-white px-4 py-2 rounded">Back to Home</Link>
                    </div>
                  </div>
                } />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:category" element={<Shop />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/gallery/:category" element={<Gallery />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/custom-request" element={<CustomRequest />} />
                <Route path="/mobile-image-test" element={<MobileImageTest />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/data-deletion" element={<DataDeletion />} />
                {/* Admin Tools - Protected Routes */}
                <Route path="/database-test" element={
                  <AdminRoute>
                    <DatabaseTest />
                  </AdminRoute>
                } />
                {/* TestSupabaseOnly route removed */}
                <Route path="/update-product-images" element={
                  <AdminRoute>
                    <UpdateProductImages />
                  </AdminRoute>
                } />
                <Route path="/update-accurate-images" element={
                  <AdminRoute>
                    <UpdateAccurateImages />
                  </AdminRoute>
                } />
                <Route path="/auto-update-images" element={
                  <AdminRoute>
                    <AutoUpdateImages />
                  </AdminRoute>
                } />
                <Route path="/image-tools" element={
                  <AdminRoute>
                    <ImageTools />
                  </AdminRoute>
                } />
                <Route path="/deploy-with-real-images" element={
                  <AdminRoute>
                    <DeployWithRealImages />
                  </AdminRoute>
                } />
                {/* CheckSupabaseImages route removed */}
                <Route path="/product-metadata-manager" element={
                  <AdminRoute>
                    <ProductMetadataManager />
                  </AdminRoute>
                } />
                <Route path="/product-metadata-test" element={
                  <AdminRoute>
                    <ProductMetadataTest />
                  </AdminRoute>
                } />
                <Route path="/vercel-migration" element={
                  <AdminRoute>
                    <ImageMigrationPanel />
                  </AdminRoute>
                } />
                <Route path="/manual-database-setup" element={
                  <AdminRoute>
                    <ManualDatabaseSetup />
                  </AdminRoute>
                } />
                <Route path="/firebase-test" element={
                  <AdminRoute>
                    <FirebaseTest />
                  </AdminRoute>
                } />
                <Route path="/video-demo" element={<VideoDemo />} />
                <Route path="/unified-image-manager" element={
                  <AdminRoute>
                    <UnifiedImageManager />
                  </AdminRoute>
                } />
                {/* All Supabase setup routes removed */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected User Routes */}
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/track-order" element={
                  <ProtectedRoute>
                    <TrackOrder />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/orders" element={
                  <AdminRoute>
                    <AdminOrders />
                  </AdminRoute>
                } />

                <Route path="/admin/chatbot" element={
                  <AdminRoute>
                    <ChatbotAdmin />
                  </AdminRoute>
                } />

                {/* Super Admin - Only Admin Route */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminErrorBoundary>
                      <SuperAdmin />
                    </AdminErrorBoundary>
                  </AdminRoute>
                } />
                <Route path="/super-admin" element={
                  <AdminRoute>
                    <AdminErrorBoundary>
                      <SuperAdmin />
                    </AdminErrorBoundary>
                  </AdminRoute>
                } />

                {/* Helper Routes - Admin Only */}
                <Route path="/create-admin" element={
                  <AdminRoute>
                    <CreateAdmin />
                  </AdminRoute>
                } />
                <Route path="/safe-login" element={<SafeLogin />} />

                {/* Test Routes - Keep for debugging */}
                <Route path="/test-payment-connection" element={<TestPaymentConnection />} />
                <Route path="/test-menu" element={<TestHome />} />
                <Route path="/shop-test" element={<ShopTest />} />
                <Route path="/home-test" element={<HomeTest />} />
                <Route path="/layout-test" element={<LayoutTest />} />
                <Route path="/header-test" element={<HeaderTest />} />
                <Route path="/auth-test" element={<AuthTest />} />
                <Route path="/cart-test" element={<CartTest />} />
                <Route path="/test-page" element={<TestPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </main>
            <Footer />

            {/* Chatbot - Available on all pages */}
            <Chatbot />

                  </div>
                </Router>
              </DatabaseInitializer>
              </CartProvider>
            </ImageProvider>
          </ProductProvider>
        </SiteSettingsProvider>
      </AuthProvider>
    </DarkModeProvider>
  );
}

export default App;
