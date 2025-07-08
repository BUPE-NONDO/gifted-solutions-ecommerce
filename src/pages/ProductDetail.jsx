import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import ProductVideo from '../components/ProductVideo';
import CORSSafeImage from '../components/CORSSafeImage';
import RobustImage from '../components/RobustImage';
import InlineImageEditor from '../components/InlineImageEditor';
import { formatPrice, parsePrice } from '../utils/priceUtils';
import {
  ShoppingCart as CartIcon,
  Plus,
  Minus,
  Star,
  Heart,
  Share2,
  ArrowLeft,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Zap,
  Leaf,
  Award,
  Clock,
  Users,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  Play
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();
  const { products, getProductById } = useProducts();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const inCart = product ? isInCart(product.id) : false;
  const cartQuantity = product ? getItemQuantity(product.id) : 0;

  // Enhanced product data with multiple images and detailed info
  const enhancedProducts = {
    1: {
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=600&fit=crop'
      ],
      specifications: {
        'Microcontroller': 'ATmega328P',
        'Operating Voltage': '5V',
        'Input Voltage': '7-12V',
        'Digital I/O Pins': '14',
        'Analog Input Pins': '6',
        'Flash Memory': '32KB',
        'SRAM': '2KB',
        'EEPROM': '1KB',
        'Clock Speed': '16MHz'
      },
      features: [
        'USB connectivity for easy programming',
        'Built-in LED on pin 13',
        'Reset button for easy debugging',
        'Compatible with Arduino IDE',
        'Extensive library support',
        'Perfect for beginners and professionals'
      ],
      reviews: [
        {
          id: 1,
          name: 'John Banda',
          rating: 5,
          comment: 'Excellent quality Arduino board. Works perfectly for my IoT projects.',
          date: '2024-01-15'
        },
        {
          id: 2,
          name: 'Mary Phiri',
          rating: 4,
          comment: 'Good product, fast delivery. Recommended for students.',
          date: '2024-01-10'
        }
      ],
      relatedProducts: [2, 3, 4]
    }
  };

  useEffect(() => {
    setIsLoading(true);
    // Simulate loading delay for smooth animation
    setTimeout(() => {
      // Find product by string ID (e.g., 'gs-002') or numeric ID from Supabase
      const foundProduct = products.find(p =>
        p.id === id || p.id === parseInt(id) || p.id.toString() === id
      );

      if (foundProduct) {
        // Use product data from Supabase
        setProduct({
          ...foundProduct,
          images: foundProduct.images || [foundProduct.image || foundProduct.publicUrl],
          specifications: foundProduct.specifications || {},
          features: foundProduct.features || [],
          reviews: foundProduct.reviews || [],
          relatedProducts: foundProduct.relatedProducts || []
        });
      }
      setIsLoading(false);
    }, 800);
  }, [id, products]);

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    addToCart(product, quantity);
    setIsAddingToCart(false);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
  };

  const handleImageChange = (index) => {
    setSelectedImage(index);
  };

  const nextImage = () => {
    setSelectedImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/shop')}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg"
          >
            Back to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-primary-500 transition-colors"
            >
              Home
            </button>
            <span className="text-gray-300">/</span>
            <button
              onClick={() => navigate('/shop')}
              className="text-gray-500 hover:text-primary-500 transition-colors"
            >
              Shop
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-500 mb-6 transition-colors group"
        >
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <InlineImageEditor
              productId={product.id}
              currentImageUrl={product.images[selectedImage]}
              className="relative bg-white rounded-2xl shadow-lg overflow-hidden group"
            >
              <div className="aspect-square relative">
                <RobustImage
                  src={product.images[selectedImage]}
                  alt={product.name}
                  productName={product.name}
                  category={product.category}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="eager"
                />

                {/* Image Navigation */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 z-20"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 z-20"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Zoom Button */}
                <button
                  onClick={() => setShowImageModal(true)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all opacity-0 group-hover:opacity-100 z-20"
                >
                  <ZoomIn size={16} />
                </button>

                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                      {product.badge}
                    </span>
                  </div>
                )}
              </div>
            </InlineImageEditor>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageChange(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary-500 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <RobustImage
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      productName={product.name}
                      category={product.category}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Product Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-500 mb-2">{product.category}</p>
                  <h1 className="text-3xl font-bold text-black leading-tight">{product.name}</h1>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-3 rounded-full border-2 transition-all ${
                      isWishlisted
                        ? 'border-red-500 bg-red-50 text-red-500'
                        : 'border-gray-300 hover:border-red-300 text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <Heart className={isWishlisted ? 'fill-current' : ''} size={20} />
                  </button>
                  <button className="p-3 rounded-full border-2 border-gray-300 hover:border-primary-300 text-gray-400 hover:text-primary-500 transition-all">
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < Math.floor(product.rating || 4.5)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating || 4.5} ({product.reviews?.length || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline space-x-3">
                <span className="text-4xl font-bold text-black">
                  {typeof product.price === 'string' && product.price.startsWith('K')
                    ? product.price
                    : formatPrice(parsePrice(product.price))
                  }
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {typeof product.originalPrice === 'string' && product.originalPrice.startsWith('K')
                      ? product.originalPrice
                      : formatPrice(parsePrice(product.originalPrice))
                    }
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="prose prose-sm text-gray-600">
              <p>{product.description}</p>
            </div>

            {/* Quantity and Add to Cart */}
            {product.inStock && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex space-x-4">
                    {!inCart ? (
                      <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white py-4 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center"
                      >
                        {isAddingToCart ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <CartIcon className="mr-2" size={20} />
                            Add to Cart
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-center py-2 text-green-600 font-medium">
                          <Check className="mr-2" size={16} />
                          In Cart ({cartQuantity})
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateQuantity(product.id, cartQuantity - 1)}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                          >
                            Remove One
                          </button>
                          <button
                            onClick={() => updateQuantity(product.id, cartQuantity + 1)}
                            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg transition-colors"
                          >
                            Add More
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp Buy Button */}
                  <button
                    onClick={() => {
                      const formattedPrice = typeof product.price === 'string' && product.price.startsWith('K')
                        ? product.price
                        : formatPrice(parsePrice(product.price));
                      const message = `Hello! I'm interested in purchasing:\n\n📦 Product: ${product.name}\n💰 Price: ${formattedPrice}\n📊 Quantity: ${quantity}\n\nPlease let me know about payment and delivery options.`;
                      const whatsappUrl = `https://wa.me/260779421717?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center border-2 border-green-500 hover:border-green-600"
                  >
                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                    </svg>
                    Buy via WhatsApp
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <svg className="text-green-500" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                </svg>
                <span>WhatsApp Support</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="text-primary-500" size={16} />
                <span>1 Year Warranty</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RotateCcw className="text-primary-500" size={16} />
                <span>30 Day Returns</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Zap className="text-primary-500" size={16} />
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'description', label: 'Description', icon: MessageCircle },
                { id: 'specifications', label: 'Specifications', icon: Award },
                { id: 'videos', label: 'Videos', icon: Play },
                { id: 'reviews', label: 'Reviews', icon: Users },
                { id: 'features', label: 'Features', icon: Zap }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="mr-2" size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="py-8">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="prose prose-lg max-w-none text-gray-700 animate-fadeIn">
                <h3 className="text-xl font-semibold text-black mb-4">Product Description</h3>
                <p className="mb-4">{product.description}</p>
                <p className="mb-4">
                  This high-quality electronic component is designed for professionals and enthusiasts alike.
                  Built with precision and tested for reliability, it offers exceptional performance for your projects.
                </p>
                <h4 className="text-lg font-semibold text-black mb-2">What's Included:</h4>
                <ul className="list-disc list-inside space-y-1 mb-4">
                  <li>Main product unit</li>
                  <li>User manual and documentation</li>
                  <li>Necessary cables and connectors</li>
                  <li>Warranty card</li>
                </ul>
              </div>
            )}

            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div className="animate-fadeIn">
                <h3 className="text-xl font-semibold text-black mb-6">Technical Specifications</h3>
                {Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="bg-white rounded-lg border border-gray-200 p-4">
                        <dt className="text-sm font-medium text-gray-500 mb-1">{key}</dt>
                        <dd className="text-lg font-semibold text-black">{value}</dd>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Detailed specifications will be available soon.</p>
                  </div>
                )}
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div className="animate-fadeIn">
                <ProductVideo
                  videoUrl={product.video_url || product.videoUrl}
                  youtubeTutorialUrl={product.youtube_tutorial_url || product.youtubeTutorialUrl}
                  videoTitle={product.video_title || product.videoTitle}
                  videoDescription={product.video_description || product.videoDescription}
                  productTitle={product.title || product.name}
                />
                {!product.video_url && !product.videoUrl && !product.youtube_tutorial_url && !product.youtubeTutorialUrl && (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No videos available for this product yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="animate-fadeIn">
                <h3 className="text-xl font-semibold text-black mb-6">Customer Reviews</h3>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {product.reviews.map((review) => (
                      <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-black">{review.name}</h4>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={`${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                  </div>
                )}
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="animate-fadeIn">
                <h3 className="text-xl font-semibold text-black mb-6">Key Features</h3>
                {product.features && product.features.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3 bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <p className="text-gray-700">{feature}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Zap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">Feature details will be available soon.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-black mb-8">Related Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.relatedProducts.map((relatedId) => {
                const relatedProduct = products.find(p => p.id === relatedId);
                if (!relatedProduct) return null;

                return (
                  <div
                    key={relatedId}
                    onClick={() => navigate(`/product/${relatedId}`)}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-primary-500 font-medium mb-1">{relatedProduct.category}</p>
                      <h4 className="text-sm font-semibold text-black mb-2 line-clamp-2">{relatedProduct.name}</h4>
                      <p className="text-lg font-bold text-black">{relatedProduct.price}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X size={24} />
            </button>
            <img
              src={product.images[selectedImage]}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Eco-Friendly Badge */}
      {product.category === 'Eco-Friendly' && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-full shadow-lg animate-bounce">
          <Leaf size={24} />
        </div>
      )}
    </div>
  );
};

export default ProductDetail;