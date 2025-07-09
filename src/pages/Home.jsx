import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import ProductVideo from '../components/ProductVideo';
import ProductMetadataList from '../components/ProductMetadataList';
import BulkDiscountDisplay from '../components/BulkDiscountDisplay';
import cacheService from '../services/cacheService';
import { enhancedImageService } from '../services/enhancedImageService';
import RobustImage from '../components/RobustImage';
import {
  Smartphone,
  Palette,
  Heart,
  Star,
  ArrowRight,
  Shield,
  Truck,
  Headphones,
  ShoppingBag,
  Award,
  Users,
  TrendingUp,
  Wifi,
  Play,
  Youtube,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  Monitor,
  ExternalLink,
  X,
  Eye,
  ZoomIn
} from 'lucide-react';

const Home = () => {
  const { addToCart } = useCart();
  const { settings } = useSiteSettings();

  // State for Supabase images (same as Gallery and SuperAdmin approach)
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for product detail modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // Load images with admin metadata from Firebase ONLY with caching
  const loadSupabaseImages = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first unless force refresh
      if (!forceRefresh) {
        const cachedImages = cacheService.getImages();
        if (cachedImages && cachedImages.length > 0) {
          setImages(cachedImages);
          setLoading(false);
          console.log(`✅ Loaded ${cachedImages.length} images from cache`);
          return;
        }
      }

      console.log('🖼️ Loading images with admin metadata from Firebase for Home...');

      const { default: firebaseMetadataService } = await import('../services/firebaseMetadataService');

      // Load products directly from Firebase (no Supabase storage calls)
      const productsWithMetadata = await firebaseMetadataService.getAllProducts();

      if (productsWithMetadata && productsWithMetadata.length > 0) {
        // Only load products that have valid Vercel Blob URLs
        const imagesWithMetadata = [];

        for (const product of productsWithMetadata) {
          // Only include products with valid data and Vercel Blob URLs
          if (product.title && product.title.trim() && product.image) {
            const imageWithMetadata = {
              id: product.id,
              publicUrl: product.image, // This should be a Vercel Blob URL
              image: product.image,
              title: product.title,
              description: product.description || '',
              category: product.category || '',
              price: product.price || null,
              inStock: product.in_stock !== false,
              featured: product.featured || false,
              hasMetadata: true
            };

            imagesWithMetadata.push(imageWithMetadata);
          }
        }

        // Cache the results
        cacheService.setImages(imagesWithMetadata);
        setImages(imagesWithMetadata);
        console.log(`✅ Loaded ${imagesWithMetadata.length} products with Vercel Blob URLs from Firebase for Home`);
      } else {
        setImages([]);
        console.log('ℹ️ No products found in Firebase');
      }
    } catch (err) {
      console.error('❌ Error loading images for Home:', err);
      setError(err.message);
      setImages([]);

      // Try to load from cache as fallback
      const cachedImages = cacheService.getImages();
      if (cachedImages && cachedImages.length > 0) {
        setImages(cachedImages);
        console.log(`⚠️ Using cached images as fallback (${cachedImages.length} items)`);
      }
    } finally {
      setLoading(false);
    }
  };

  // NO automatic data generation - all metadata comes from Firebase admin entries

  // Load images on component mount and set up refresh listener
  useEffect(() => {
    loadSupabaseImages();

    // Listen for global refresh events from SuperAdmin
    const handleGlobalRefresh = () => {
      console.log('🔄 Home page refreshing due to SuperAdmin changes...');
      cacheService.clearCache('IMAGES'); // Clear cache on admin refresh
      loadSupabaseImages(true); // Force refresh
    };

    // Set up global refresh listener
    window.addEventListener('refreshAllImages', handleGlobalRefresh);

    // Also set up a global function that SuperAdmin can call
    if (!window.refreshHomeImages) {
      window.refreshHomeImages = loadSupabaseImages;
    }

    // Cleanup on unmount
    return () => {
      window.removeEventListener('refreshAllImages', handleGlobalRefresh);
      delete window.refreshHomeImages;
    };
  }, []);

  // Handle adding image to cart
  const handleAddToCart = (image) => {
    if (image.price) {
      const cartItem = {
        id: image.id,
        name: image.title || image.name,
        price: image.price,
        image: image.publicUrl,
        category: image.category,
        description: image.description
      };
      addToCart(cartItem);
    }
  };

  // Handle opening product detail modal
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  // Handle closing product detail modal
  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  // Get featured products from Supabase images
  const getFeaturedProducts = () => {
    return images.filter(image => image.featured && image.price).slice(0, 8);
  };

  // Get random image from category for categories section
  const getRandomImageFromCategory = (categoryName) => {
    const categoryImages = images.filter(image => image.category === categoryName);
    if (categoryImages.length > 0) {
      return categoryImages[Math.floor(Math.random() * categoryImages.length)];
    }
    return null;
  };



  // Dynamic categories with Supabase images
  const getDynamicCategories = () => {
    const baseCategories = [
      {
        id: 'Microcontrollers',
        name: 'Microcontrollers',
        icon: Smartphone,
        description: 'Arduino Uno, Mega, Nano & Atmega development boards',
        count: '5+ Boards'
      },
      {
        id: 'WiFi Modules',
        name: 'WiFi Modules',
        icon: Wifi,
        description: 'ESP32, ESP8266 & wireless development modules',
        count: '5+ Modules'
      },
      {
        id: 'Sensors',
        name: 'Sensors',
        icon: Heart,
        description: 'Temperature, motion, ultrasonic & specialty sensors',
        count: '15+ Sensors'
      },
      {
        id: 'Components',
        name: 'Components',
        icon: Palette,
        description: 'Breadboards, LEDs, resistors & essential components',
        count: '20+ Components'
      }
    ];

    // Add dynamic images from Supabase
    return baseCategories.map(category => {
      const randomImage = getRandomImageFromCategory(category.id);
      return {
        ...category,
        image: randomImage?.publicUrl || `https://fotcjsmnerawpqzhldhq.supabase.co/storage/v1/object/public/product-images/products/arduino-uno-r3-1748603951988-impc78.jpg` // Fallback
      };
    });
  };

  const categories = getDynamicCategories();

  const features = [
    {
      icon: Shield,
      title: 'Quality Components',
      description: 'Genuine electronic components tested for reliability and performance'
    },
    {
      icon: Truck,
      title: 'Countrywide Delivery',
      description: 'Fast delivery across Zambia. Located in Lusaka, Chalala near ICU'
    },
    {
      icon: Headphones,
      title: 'Project Consultation',
      description: 'Expert help with EC3 projects and final year electronics assistance'
    },
    {
      icon: Award,
      title: 'Multiple Payment Options',
      description: 'Airtel Money, MTN Money, Bank Transfer, and Cash accepted'
    }
  ];

  const stats = [
    {
      icon: Users,
      number: '500+',
      label: 'Electronics Students'
    },
    {
      icon: ShoppingBag,
      number: '80+',
      label: 'Components Available'
    },
    {
      icon: Star,
      number: '4.8/5',
      label: 'Customer Rating'
    },
    {
      icon: TrendingUp,
      number: '50+',
      label: 'Projects Completed'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-white">{settings.headerText || 'Welcome to'}</span>
                <br />
                <span className="text-primary-400">{settings.siteName || 'Gifted Solutions'}</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
                Your premier destination for <span className="text-primary-400 font-semibold">electronic components</span>,
                Arduino projects, and <span className="text-primary-400 font-semibold">electronics consultation</span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/shop"
                  className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <ShoppingBag className="mr-2" size={20} />
                  Shop Now
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <Link
                  to="/custom-request"
                  className="border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Custom Request
                </Link>
              </div>
            </div>

            {/* Right Content - Stats */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent size={24} className="text-white" />
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-gray-300 text-sm">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Video Tutorials Section */}
      <section className="py-16 bg-gray-800 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center">
              <Youtube className="w-8 h-8 mr-3 text-red-600" />
              Featured Video Tutorials
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Watch our latest tutorials and guides to master electronics and shopping on our platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Shopping Guide Video */}
            <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="relative">
                <img
                  src="https://img.youtube.com/vi/L_8o7VTXusI/maxresdefault.jpg"
                  alt="Shopping Guide Thumbnail"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <a
                    href="https://youtu.be/L_8o7VTXusI?si=8vRso5NuAr5jnaFW"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors duration-200"
                  >
                    <Play className="w-8 h-8 fill-current" />
                  </a>
                </div>
                <div className="absolute top-2 right-2">
                  <Youtube className="w-6 h-6 text-red-600 bg-white rounded p-1" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  How to Shop for Electronic Components in Zambia
                </h3>
                <p className="text-gray-300 text-sm">
                  Complete guide to shopping for electronic components on Gifted Solutions website in Zambia.
                </p>
              </div>
            </div>

            {/* Electronics Basics Video */}
            <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="relative">
                <img
                  src="https://img.youtube.com/vi/qXv-TvTnEPA/maxresdefault.jpg"
                  alt="Electronics Basics Thumbnail"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <a
                    href="https://youtube.com/shorts/qXv-TvTnEPA?si=Ybbmp5_BK-C2nnSk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors duration-200"
                  >
                    <Play className="w-8 h-8 fill-current" />
                  </a>
                </div>
                <div className="absolute top-2 right-2">
                  <Youtube className="w-6 h-6 text-red-600 bg-white rounded p-1" />
                </div>
                <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  SHORT
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Electronics Basics - Quick Start Guide
                </h3>
                <p className="text-gray-300 text-sm">
                  Short tutorial covering essential electronics concepts and getting started tips.
                </p>
              </div>
            </div>

            {/* Component Identification Video */}
            <div className="bg-gray-700 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
              <div className="relative">
                <img
                  src="https://img.youtube.com/vi/L8rdew823M4/maxresdefault.jpg"
                  alt="Component Identification Thumbnail"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <a
                    href="https://youtube.com/shorts/L8rdew823M4?si=dKSC2IVpI53KPRfc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transition-colors duration-200"
                  >
                    <Play className="w-8 h-8 fill-current" />
                  </a>
                </div>
                <div className="absolute top-2 right-2">
                  <Youtube className="w-6 h-6 text-red-600 bg-white rounded p-1" />
                </div>
                <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  SHORT
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Component Identification Guide
                </h3>
                <p className="text-gray-300 text-sm">
                  Quick guide to identifying common electronic components and their functions.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              to="/video-demo"
              className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              <Youtube className="w-5 h-5 mr-2" />
              View All Video Tutorials
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Horizontal Scrollable Products Section */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Discover our top-quality electronic components and development boards
              </p>
            </div>
            <Link
              to="/gallery"
              className="hidden md:inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">Error loading products: {error}</p>
            </div>
          ) : images.length > 0 ? (
            <div className="relative">
              <div className="flex overflow-x-auto scrollbar-hide space-x-6 pb-4">
                {images.slice(0, 12).map((image) => (
                  <div key={image.id} className="flex-none w-72">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <div className="relative h-48 overflow-hidden">
                        <RobustImage
                          src={enhancedImageService.getOptimizedUrl(image.publicUrl, { width: 300, height: 300 })}
                          alt={image.title || image.name}
                          productName={image.title || image.name}
                          category={image.category}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          loading={enhancedImageService.isVercelBlobUrl(image.publicUrl) ? "eager" : "lazy"}
                          {...(enhancedImageService.isVercelBlobUrl(image.publicUrl) && {
                            srcSet: enhancedImageService.generateSrcSet(image.publicUrl),
                            sizes: "(max-width: 768px) 250px, 300px"
                          })}
                        />

                        {/* Video Indicators */}
                        {(image.video_url || image.videoUrl || image.youtube_tutorial_url || image.youtubeTutorialUrl) && (
                          <div className="absolute top-2 right-2 flex space-x-1">
                            {(image.video_url || image.videoUrl) && (
                              <div className="bg-black bg-opacity-70 text-white rounded-full p-1.5 text-xs">
                                <Play className="w-3 h-3" />
                              </div>
                            )}
                            {(image.youtube_tutorial_url || image.youtubeTutorialUrl) && (
                              <div className="bg-red-600 text-white rounded-full p-1.5 text-xs">
                                <Youtube className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Price Badge */}
                        {image.price && (
                          <div className="absolute top-2 left-2 bg-green-600 text-white text-sm font-semibold px-2 py-1 rounded">
                            K{image.price}
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {image.title || image.name?.replace(/\.[^/.]+$/, "").replace(/_/g, ' ')}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                          {image.description || 'High-quality electronic component'}
                        </p>

                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {image.category || 'Components'}
                          </span>
                        </div>

                        {/* Compact Bulk Discount Display */}
                        <BulkDiscountDisplay
                          product={image}
                          currentQuantity={0}
                          compact={true}
                        />

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProduct(image)}
                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center justify-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </button>
                          <button
                            onClick={() => handleAddToCart(image)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scroll indicator */}
              <div className="flex justify-center mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ← Scroll to see more products →
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Products coming soon! Check back later.
              </p>
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link
              to="/gallery"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300"
            >
              View All Products
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white dark:bg-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black dark:text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore our diverse collection of products across different categories
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  to={`/shop/${category.id}`}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200"
                >
                  <div className="relative h-48 overflow-hidden">
                    <RobustImage
                      src={enhancedImageService.getOptimizedUrl(category.image, { width: 300, height: 192 })}
                      alt={category.name}
                      productName={category.name}
                      category={category.id}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:bg-primary-500 group-hover:scale-110 transition-all duration-300">
                        <IconComponent
                          size={32}
                          className="text-primary-500 group-hover:text-white transition-colors duration-300"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-semibold text-black mb-2 group-hover:text-primary-500 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      {category.description}
                    </p>
                    <div className="text-sm font-medium text-primary-500">
                      {category.count}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
              Why Choose Gifted Solutions?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're committed to providing exceptional service and quality products that exceed your expectations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-500 group-hover:scale-110 transition-all duration-300">
                    <IconComponent size={36} className="text-primary-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-black mb-3 group-hover:text-primary-500 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Build Your Next <span className="text-primary-400">Electronics Project</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Whether you need Arduino components, sensors, or project consultation for your EC3 or final year project,
              we have everything you need to bring your ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/shop"
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-10 rounded-lg transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <ShoppingBag className="mr-2" size={20} />
                Browse Components
                <ArrowRight className="ml-2" size={20} />
              </Link>
              <Link
                to="/custom-request"
                className="border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-semibold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Project Consultation
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white text-white hover:bg-white hover:text-black font-semibold py-4 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                WhatsApp: 0779421717
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedProduct.title || selectedProduct.name}
              </h2>
              <button
                onClick={closeProductModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={selectedProduct.publicUrl || '/placeholder-product.jpg'}
                      alt={selectedProduct.title || selectedProduct.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>

                  {/* Video Indicators */}
                  {(selectedProduct.video_url || selectedProduct.videoUrl || selectedProduct.youtube_tutorial_url || selectedProduct.youtubeTutorialUrl) && (
                    <div className="flex space-x-2">
                      {(selectedProduct.video_url || selectedProduct.videoUrl) && (
                        <div className="flex items-center bg-black text-white rounded-lg px-3 py-2 text-sm">
                          <Play className="w-4 h-4 mr-2" />
                          Product Video
                        </div>
                      )}
                      {(selectedProduct.youtube_tutorial_url || selectedProduct.youtubeTutorialUrl) && (
                        <div className="flex items-center bg-red-600 text-white rounded-lg px-3 py-2 text-sm">
                          <Youtube className="w-4 h-4 mr-2" />
                          Tutorial
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedProduct.description || 'Professional electronic component with advanced features'}
                    </p>
                  </div>

                  {/* Price */}
                  {selectedProduct.price && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Price</h3>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        K{selectedProduct.price}
                      </p>
                    </div>
                  )}

                  {/* Features */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Features</h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        High-quality construction
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Professional grade components
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Compatible with standard projects
                      </li>
                      <li className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-2" />
                        Detailed documentation included
                      </li>
                    </ul>
                  </div>

                  {/* Specifications */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Specifications</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Category:</span>
                        <span className="text-gray-600 dark:text-gray-300 ml-2">
                          {selectedProduct.category || 'Components'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">Availability:</span>
                        <span className={`ml-2 ${selectedProduct.inStock ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedProduct.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bulk Discounts */}
                  <BulkDiscountDisplay
                    product={selectedProduct}
                    currentQuantity={0}
                    compact={false}
                  />

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        closeProductModal();
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </button>
                    <Link
                      to={`/product/${selectedProduct.id}`}
                      onClick={closeProductModal}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Full Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Product Card Component - Updated design with full image and quantity controls
const ProductCard = ({ image, onAddToCart }) => {
  const [quantity, setQuantity] = useState(0);
  const [isInCart, setIsInCart] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(image);
    setQuantity(1);
    setIsInCart(true);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      setQuantity(0);
      setIsInCart(false);
    } else {
      setQuantity(newQuantity);
      // Update cart with new quantity
      onAddToCart({ ...image, quantity: newQuantity });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200">
      {/* Stock Status Badge */}
      <div className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 text-center">
        {image.inStock ? 'In Stock' : 'Out of Stock'}
      </div>

      {/* Image Container - Full image fill */}
      <div className="aspect-square relative overflow-hidden">
        <RobustImage
          src={enhancedImageService.getOptimizedUrl(image.publicUrl, { width: 300, height: 300 })}
          alt={image.title || image.name}
          productName={image.title || image.name}
          category={image.category}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading={enhancedImageService.isVercelBlobUrl(image.publicUrl) ? "eager" : "lazy"}
          {...(enhancedImageService.isVercelBlobUrl(image.publicUrl) && {
            srcSet: enhancedImageService.generateSrcSet(image.publicUrl),
            sizes: "(max-width: 768px) 250px, 300px"
          })}
        />

        {/* Video Indicators */}
        {(image.video_url || image.videoUrl || image.youtube_tutorial_url || image.youtubeTutorialUrl) && (
          <div className="absolute top-2 right-2 flex space-x-1">
            {(image.video_url || image.videoUrl) && (
              <div className="bg-black bg-opacity-70 text-white rounded-full p-1.5 text-xs">
                <Play className="w-3 h-3" />
              </div>
            )}
            {(image.youtube_tutorial_url || image.youtubeTutorialUrl) && (
              <div className="bg-red-600 text-white rounded-full p-1.5 text-xs">
                <Youtube className="w-3 h-3" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Category Badge */}
      <div className="px-3 pt-2">
        <span className="inline-block bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded">
          {image.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
          {image.title || image.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2">
          {image.description}
        </p>

        {/* Price */}
        {image.price && (
          <div className="text-lg font-bold text-gray-900">
            K{image.price}
          </div>
        )}

        {/* Add to Cart Button or Quantity Controls */}
        {image.price && image.inStock && (
          <>
            {!isInCart ? (
              <button
                onClick={handleAddToCart}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded text-sm transition-colors duration-200 flex items-center justify-center"
              >
                🛒 Add to Cart
              </button>
            ) : (
              <div className="flex items-center justify-between bg-gray-100 rounded p-2">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold"
                >
                  −
                </button>
                <span className="text-lg font-semibold text-gray-900">
                  Qty: {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold"
                >
                  +
                </button>
              </div>
            )}
          </>
        )}

        {/* Out of Stock Button */}
        {image.price && !image.inStock && (
          <button
            disabled
            className="w-full bg-gray-300 text-gray-500 font-medium py-2 px-3 rounded text-sm cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  );
};

export default Home;
