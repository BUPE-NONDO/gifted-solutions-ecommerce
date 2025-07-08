import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import CartIcon from './CartIcon';
import ShoppingCart from './ShoppingCart';
import DarkModeToggle from './DarkModeToggle';
import {
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Heart,
  Search,
  Package,
  ShoppingBag
} from 'lucide-react';

const Header = () => {
  const { user, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Company Name/Logo */}
          <Link to="/" className="flex items-center space-x-3">
            {settings.logo && (
              <img
                src={settings.logo}
                alt={settings.siteName}
                className="h-10 w-auto"
              />
            )}
            <span className="text-2xl font-bold text-black dark:text-white transition-colors duration-200">
              {settings.siteName || 'Gifted Solutions'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-secondary-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-secondary-700 hover:text-primary-500 transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/gallery"
              className="text-secondary-700 hover:text-primary-500 transition-colors"
            >
              Gallery
            </Link>
            <Link
              to="/video-demo"
              className="text-secondary-700 hover:text-primary-500 transition-colors"
            >
              Videos
            </Link>
            <Link
              to="/contact"
              className="text-secondary-700 hover:text-primary-500 transition-colors"
            >
              Contact
            </Link>
            <Link
              to="/custom-request"
              className="text-secondary-700 hover:text-primary-500 transition-colors"
            >
              Custom Request
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-secondary-600 hover:text-primary-500 transition-colors">
              <Search size={20} />
            </button>

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Cart */}
            <CartIcon onClick={() => setIsCartOpen(true)} />

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 p-2 text-secondary-600 hover:text-primary-500 transition-colors"
                >
                  <User size={20} />
                  <span className="hidden sm:block text-sm">
                    {user.displayName || 'User'}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-secondary-200 dark:border-gray-600 py-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-secondary-700 hover:bg-secondary-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>

                    <Link
                      to="/track-order"
                      className="flex items-center space-x-2 px-4 py-2 text-secondary-700 hover:bg-secondary-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Package size={16} />
                      <span>Track Orders</span>
                    </Link>

                    {isAdmin && (
                      <>
                        <Link
                          to="/admin/orders"
                          className="flex items-center space-x-2 px-4 py-2 text-secondary-700 hover:bg-secondary-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <ShoppingBag size={16} />
                          <span>Manage Orders</span>
                        </Link>
                        <Link
                          to="/super-admin"
                          className="flex items-center space-x-2 px-4 py-2 text-secondary-700 hover:bg-secondary-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings size={16} />
                          <span>Super Admin</span>
                        </Link>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-secondary-700 hover:bg-secondary-50"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-secondary-700 hover:text-primary-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-secondary-600 hover:text-primary-500 transition-colors"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-secondary-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-secondary-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="text-secondary-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link
                to="/gallery"
                className="text-secondary-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link
                to="/video-demo"
                className="text-secondary-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Videos
              </Link>
              <Link
                to="/contact"
                className="text-secondary-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                to="/custom-request"
                className="text-secondary-700 hover:text-primary-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Custom Request
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Shopping Cart Sidebar */}
      <ShoppingCart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;
