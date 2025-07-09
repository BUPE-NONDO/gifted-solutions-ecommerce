import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  ShoppingBag,
  Package,
  CreditCard,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Minimize2,
  Maximize2,
  ExternalLink
} from 'lucide-react';

const Chatbot = () => {
  const { user } = useAuth();
  const { itemCount, total } = useCart();
  const navigate = useNavigate();

  // Error boundary state
  const [hasError, setHasError] = useState(false);

  // Reset error boundary
  useEffect(() => {
    setHasError(false);
  }, []);

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center space-x-2">
            <AlertCircle size={20} />
            <div>
              <h3 className="font-semibold">Chat Unavailable</h3>
              <p className="text-sm">Please contact support at 0779421717</p>
              <button
                onClick={() => setHasError(false)}
                className="text-xs underline mt-1"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  try {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with personalized greeting
  useEffect(() => {
    const initializeChat = () => {
      let greeting;
      let helpMessage;

      if (user) {
        // User is logged in
        const userName = user.displayName || user.email?.split('@')[0] || 'there';
        greeting = `Hello ${userName}! 👋 Welcome back to Gifted Solutions!`;
        helpMessage = `I can help you with:

🛍️ Product recommendations
📦 Order tracking
💳 Payment assistance (MTN MOMO)
🎯 Personalized shopping experience

What can I help you with today?`;
      } else {
        // User is not logged in
        greeting = `Hello! 👋 Welcome to Gifted Solutions!`;
        helpMessage = `I need help tracking my order 2023

🔐 To track your order, you'll need to log in first. Please create an account or log in to access order tracking features.

I can also help you with:
🛍️ Product information
💳 Payment assistance
📞 Contact support

What would you like to do?`;
      }

      const initialMessage = {
        id: 1,
        type: 'bot',
        content: greeting,
        timestamp: new Date()
      };

      const helpMessageObj = {
        id: 2,
        type: 'bot',
        content: helpMessage,
        timestamp: new Date(),
        actions: user ? undefined : [
          { text: 'Login', action: 'login' },
          { text: 'Register', action: 'register' }
        ]
      };

      setMessages([initialMessage, helpMessageObj]);
    };

    // Only initialize if messages array is empty
    if (messages.length === 0) {
      initializeChat();
    }
  }, [user, messages.length]);

  const quickReplies = [
    { text: 'Track my order', icon: Package, action: 'track_order' },
    { text: 'Payment help', icon: CreditCard, action: 'payment_help' },
    { text: 'Browse products', icon: ShoppingBag, action: 'product_info' },
    { text: 'Contact support', icon: Phone, action: 'contact_support' },
    { text: 'Check my cart', icon: ShoppingBag, action: 'check_cart' },
    { text: 'Business hours', icon: Clock, action: 'business_hours' }
  ];

  const getBotResponseFromAI = async (userMessage) => {
    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: {
            user: user ? {
              name: user.displayName,
              email: user.email,
              isAuthenticated: true
            } : { isAuthenticated: false },
            cart: {
              itemCount: itemCount || 0,
              total: total || 0
            }
          },
          session_id: `session_${Date.now()}`
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return {
          text: data.response || 'No response received',
          confidence: data.confidence || 0.1,
          type: data.type || 'ai_response'
        };
      } else {
        console.warn('AI server returned non-OK status:', response.status);
        return null;
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('AI server request timed out');
      } else {
        console.warn('AI chatbot error:', error.message);
      }
      return null;
    }
  };

  // Enhanced pattern matching for intelligent responses
  const getIntelligentResponse = (userMessage) => {
    try {
      if (!userMessage || typeof userMessage !== 'string') {
        return null;
      }

      const message = userMessage.toLowerCase().trim();
      const patterns = [
      {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
        response: () => {
          const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening';
          const greeting = user?.displayName ? `Good ${timeOfDay}, ${user.displayName}! 😊` : `Good ${timeOfDay}! 😊`;
          return `${greeting} Welcome to Gifted Solutions! \n\nI'm your AI shopping assistant. I can help you with:\n\n🛍️ Product information and recommendations\n📦 Order tracking and delivery updates\n💳 Payment assistance (MTN MOMO)\n📞 Contact and support information\n🎯 Personalized shopping experience\n\nWhat can I help you with today?`;
        },
        confidence: 0.9
      },
      {
        keywords: ['product', 'electronics', 'consultation', 'services', 'what do you sell', 'what products'],
        response: () => `🛍️ **Our Product Range:**\n\n📱 **Electronics**: Latest smartphones, laptops, tablets, and tech accessories\n💼 **Project Consultation**: Custom software development, IT consulting, and technical planning\n🎁 **Premium Gifts**: Personalized items, luxury accessories, and unique collections\n🔧 **Custom Services**: Tailored business solutions and specialized projects\n\n${user ? 'Ready to browse our shop?' : 'Create an account to start shopping and get personalized recommendations!'}`,
        confidence: 0.85
      },
      {
        keywords: ['track', 'order', 'delivery', 'package', 'shipping', 'where is my order'],
        response: () => {
          if (user) {
            return `📦 **Order Tracking:**\n\n**How to track your orders:**\n1. 🔍 Visit our "Track Order" page\n2. 👤 Check your profile dashboard\n3. 📧 Use tracking links in email confirmations\n\n**Real-time updates include:**\n✅ Order confirmation\n📋 Processing status\n🚚 Shipping notifications\n📍 Delivery location updates\n✨ Delivery confirmation\n\nNeed help with a specific order? Provide your order ID!`;
          } else {
            return `📦 **Order Tracking:**\n\nTo track your orders, you'll need to log in to your account first. \n\n**Benefits of account login:**\n🔍 Real-time order tracking\n📧 Email notifications\n📱 SMS updates\n📋 Complete order history\n\nPlease log in or create an account to access order tracking features.`;
          }
        },
        confidence: 0.8
      },
      {
        keywords: ['payment', 'mtn', 'momo', 'pay', 'how to pay', 'payment methods'],
        response: () => `💳 **MTN MOMO Payment:**\n\n**We accept secure MTN MOMO payments!**\n\n**Payment Process:**\n1. 🛒 Add items to your cart\n2. 🔐 Login to your account\n3. 💳 Select MTN MOMO at checkout\n4. 📱 Enter your MTN MOMO number\n5. ✅ Confirm payment on your phone\n6. 🎉 Order confirmed instantly!\n\n**Payment Features:**\n🔒 Secure and encrypted\n⚡ Instant confirmation\n📧 Email receipts\n💰 Competitive rates\n\nNeed payment help? Call us at 0779421717!`,
        confidence: 0.8
      },
      {
        keywords: ['contact', 'phone', 'whatsapp', 'support', 'help', 'customer service'],
        response: () => `📞 **Contact Information:**\n\n📱 **Phone & WhatsApp**: 0779421717\n🕒 **Business Hours**: Monday - Friday, 9:00 AM - 6:00 PM\n🌍 **Location**: Zambia\n📧 **Email**: Available through contact form\n\n**Our Support Team Helps With:**\n🛍️ Product inquiries\n📦 Order assistance\n💳 Payment support\n🔧 Technical consultation\n🎯 Custom project planning\n\n**Response Times:**\n📱 WhatsApp: Within 1 hour\n📞 Phone: Immediate during business hours\n📧 Email: Within 24 hours`,
        confidence: 0.85
      },
      {
        keywords: ['account', 'login', 'register', 'signup', 'create account', 'profile'],
        response: () => {
          if (user) {
            return `👤 **Account Management:**\n\nWelcome back, ${user.displayName || 'valued customer'}! \n\n**Your Account Features:**\n🛍️ Personalized shopping experience\n📦 Real-time order tracking\n💾 Saved favorites and wishlist\n📋 Complete purchase history\n🎯 Tailored recommendations\n🔒 Secure payment methods\n\n**Need to update your profile or have account questions?**`;
          } else {
            return `👤 **Create Your Account:**\n\n**Why create an account with us?**\n✅ **Required for shopping** - Secure checkout process\n📦 **Order Tracking** - Real-time delivery updates\n💾 **Save Favorites** - Build your wishlist\n🎯 **Personalized Experience** - Tailored recommendations\n🔒 **Secure Payments** - Protected MTN MOMO transactions\n📋 **Order History** - Track all your purchases\n\n**Getting Started:**\n1. Click "Sign Up" \n2. Verify your email\n3. Start shopping!\n\nReady to join Gifted Solutions?`;
          }
        },
        confidence: 0.8
      }
    ];

    // Find best matching pattern
    let bestMatch = null;
    let bestScore = 0;

    patterns.forEach(pattern => {
      const matchCount = pattern.keywords.filter(keyword =>
        message.includes(keyword.toLowerCase())
      ).length;

      if (matchCount > 0) {
        const score = (matchCount / pattern.keywords.length) * pattern.confidence;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = pattern;
        }
      }
    });

    if (bestMatch && bestScore > 0.3) {
      return {
        text: bestMatch.response(),
        confidence: bestScore,
        type: 'intelligent_match'
      };
    }

    return null;
    } catch (error) {
      console.error('Error in intelligent response:', error);
      return null;
    }
  };

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();

    // Greeting responses with context
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      const greeting = user?.displayName ? `Hello ${user.displayName}! 😊` : 'Hello there! 😊';
      return `${greeting} Welcome to Gifted Solutions! I'm here to help you with your shopping experience. What can I assist you with today?`;
    }

    // Order tracking
    if (message.includes('track') || message.includes('order') || message.includes('delivery')) {
      if (user) {
        return {
          text: `📦 To track your order, please visit our Track Order page or provide your order ID. You can also check your order status in your profile.`,
          actions: [
            { text: 'Track Order', path: '/track-order', icon: Package },
            { text: 'My Profile', path: '/profile', icon: User }
          ]
        };
      } else {
        return {
          text: `📦 To track your order, you'll need to log in first. Please create an account or log in to access order tracking features.`,
          actions: [
            { text: 'Login', path: '/login', icon: User },
            { text: 'Register', path: '/register', icon: User }
          ]
        };
      }
    }

    // Payment help
    if (message.includes('payment') || message.includes('pay') || message.includes('mtn') || message.includes('momo')) {
      return `💳 We accept MTN MOMO payments! During checkout:\n1. Select MTN MOMO as payment method\n2. Enter your phone number\n3. Follow the prompts on your phone\n4. Complete the transaction\n\nNeed help? Call us at 0779421717.`;
    }

    // Cart information
    if (message.includes('cart') || message.includes('checkout')) {
      if (itemCount > 0) {
        return {
          text: `🛒 You have ${itemCount} item(s) in your cart with a total of ${total}. ${user ? 'Ready to checkout?' : 'Please log in to proceed with checkout.'}`,
          actions: user ? [
            { text: 'View Cart', path: '/cart', icon: ShoppingBag },
            { text: 'Checkout', path: '/checkout', icon: CreditCard }
          ] : [
            { text: 'View Cart', path: '/cart', icon: ShoppingBag },
            { text: 'Login', path: '/login', icon: User }
          ]
        };
      } else {
        return {
          text: `🛒 Your cart is empty. Browse our shop to discover amazing products and add them to your cart!`,
          actions: [
            { text: 'Browse Shop', path: '/shop', icon: ShoppingBag },
            { text: 'View Gallery', path: '/gallery', icon: ShoppingBag }
          ]
        };
      }
    }

    // Product information - Enhanced with consultation services
    if (message.includes('product') || message.includes('item') || message.includes('price') || message.includes('electronics') || message.includes('consultation')) {
      return {
        text: `🛍️ We offer a wide range of products and services including:\n\n📱 **Electronics**: Latest gadgets and tech accessories\n💼 **Project Consultation**: Technical planning and custom solutions\n🎁 **Premium Gifts**: Personalized and unique gift items\n🔧 **Custom Services**: Tailored solutions for your specific needs\n\nBrowse our shop or contact us for consultation services!`,
        actions: [
          { text: 'Browse Shop', path: '/shop', icon: ShoppingBag },
          { text: 'View Gallery', path: '/gallery', icon: ShoppingBag },
          { text: 'Contact for Consultation', action: 'contact' }
        ]
      };
    }
    
    // Contact information
    if (message.includes('contact') || message.includes('phone') || message.includes('support')) {
      return `📞 You can reach us at:\n• Phone: 0779421717\n• WhatsApp: Available through our cart\n• We're here to help Monday-Friday, 9AM-6PM`;
    }
    
    // Account help
    if (message.includes('account') || message.includes('login') || message.includes('register')) {
      if (user) {
        return `👤 You're logged in as ${user.displayName || user.email}. You can manage your account in the profile section.`;
      } else {
        return `👤 To create an account or login, click the user icon in the top right corner. Having an account allows you to track orders and save your preferences!`;
      }
    }
    
    // Shipping information
    if (message.includes('shipping') || message.includes('delivery') || message.includes('ship')) {
      return `🚚 We offer reliable shipping services:\n• Standard delivery: 2-5 business days\n• Express delivery: 1-2 business days\n• Shipping costs calculated at checkout\n• Free shipping on orders over $50`;
    }

    // Business hours
    if (message.includes('hours') || message.includes('open') || message.includes('time')) {
      return `🕒 Our business hours:\n• Monday-Friday: 9:00 AM - 6:00 PM\n• Saturday: 10:00 AM - 4:00 PM\n• Sunday: Closed\n\nOnline shopping is available 24/7!`;
    }

    // Returns and refunds
    if (message.includes('return') || message.includes('refund') || message.includes('exchange')) {
      return `↩️ Returns & Exchanges:\n• 30-day return policy\n• Items must be unused and in original packaging\n• Free returns on defective items\n• Contact us at 0779421717 to initiate a return`;
    }

    // Promotions and discounts
    if (message.includes('discount') || message.includes('sale') || message.includes('promo') || message.includes('offer')) {
      return `🎉 Current offers:\n• Free shipping on orders over $50\n• New customer discount: 10% off first order\n• Follow us for exclusive deals!\n• Check our homepage for latest promotions`;
    }

    // Default response
    const responses = [
      "I'd be happy to help! Could you please provide more details about what you're looking for?",
      "That's a great question! For specific inquiries, you can also contact our support team at 0779421717.",
      "I'm here to assist you! Feel free to ask about our products, orders, payments, or anything else.",
      "Thanks for reaching out! How can I make your shopping experience better today?",
      "I'm here to help! You can ask me about products, orders, payments, shipping, or anything else related to your shopping experience."
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    const currentMessage = inputMessage.trim();
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Add a small delay to show typing indicator
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      // Try AI response first
      const aiResponse = await getBotResponseFromAI(currentMessage);

      let botResponse;
      if (aiResponse && aiResponse.confidence > 0.5) {
        // Use AI response if confidence is high enough
        botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: aiResponse.text,
          confidence: aiResponse.confidence,
          aiGenerated: true,
          timestamp: new Date()
        };
      } else {
        // Try intelligent pattern matching
        const intelligentResponse = getIntelligentResponse(currentMessage);

        if (intelligentResponse && intelligentResponse.confidence > 0.4) {
          botResponse = {
            id: Date.now() + 1,
            type: 'bot',
            content: intelligentResponse.text,
            confidence: intelligentResponse.confidence,
            aiGenerated: true,
            timestamp: new Date()
          };
        } else {
          // Fallback to rule-based response
          const fallbackResponse = getBotResponse(currentMessage);
          botResponse = {
            id: Date.now() + 1,
            type: 'bot',
            content: typeof fallbackResponse === 'string' ? fallbackResponse : fallbackResponse.text,
            actions: typeof fallbackResponse === 'object' ? fallbackResponse.actions : undefined,
            aiGenerated: false,
            timestamp: new Date()
          };
        }
      }

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);

    } catch (error) {
      console.error('Chat error:', error);

      // Robust fallback response on error
      const fallbackResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: "🤖 I'm experiencing some technical difficulties right now. \n\n**For immediate assistance:**\n📱 Call/WhatsApp: 0779421717\n🕒 Business Hours: 9 AM - 6 PM\n\n**Or try asking:**\n• 'What products do you sell?'\n• 'How do I track my order?'\n• 'How do I pay with MTN MOMO?'\n\nI'll be back to full functionality shortly!",
        timestamp: new Date(),
        aiGenerated: false
      };

      setMessages(prev => [...prev, fallbackResponse]);
      setIsTyping(false);
    }
  };

  const handleQuickReply = (action) => {
    let message = '';
    switch (action) {
      case 'track_order':
        message = 'I need help tracking my order';
        break;
      case 'payment_help':
        message = 'I need help with payment';
        break;
      case 'product_info':
        message = 'Tell me about your products';
        break;
      case 'contact_support':
        message = 'I need to contact support';
        break;
      case 'check_cart':
        message = 'Show me my cart details';
        break;
      case 'business_hours':
        message = 'What are your business hours?';
        break;
      default:
        return;
    }

    setInputMessage(message);
    setTimeout(() => handleSendMessage(), 100);
  };

  const createActionButton = (text, path, IconComponent = ExternalLink) => {
    return (
      <button
        onClick={() => {
          navigate(path);
          setIsOpen(false);
        }}
        className="inline-flex items-center space-x-1 bg-primary-100 hover:bg-primary-200 text-primary-700 px-3 py-1 rounded-full text-xs transition-colors mt-2"
      >
        <IconComponent size={12} />
        <span>{text}</span>
      </button>
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-80 h-96'
    }`}>
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot size={20} />
          <div>
            <h3 className="font-semibold text-sm">Gifted Solutions Assistant</h3>
            <p className="text-xs opacity-90">Online now</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                } rounded-lg p-3 shadow-sm`}>
                  <div className="flex items-start space-x-2">
                    {message.type === 'bot' && <Bot size={16} className="mt-1 flex-shrink-0" />}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      {message.actions && message.type === 'bot' && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {message.actions.map((action, index) => {
                            const ActionIcon = action.icon || ExternalLink;
                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  if (action.action === 'login') {
                                    navigate('/login');
                                  } else if (action.action === 'register') {
                                    navigate('/register');
                                  } else if (action.path) {
                                    navigate(action.path);
                                  }
                                  setIsOpen(false);
                                }}
                                className="inline-flex items-center space-x-1 bg-primary-100 hover:bg-primary-200 text-primary-700 px-2 py-1 rounded-full text-xs transition-colors"
                              >
                                <ActionIcon size={12} />
                                <span>{action.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-primary-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    {message.type === 'user' && <User size={16} className="mt-1 flex-shrink-0" />}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Bot size={16} />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2 bg-gray-50 dark:bg-gray-900">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply.action)}
                    className="flex items-center space-x-2 p-3 text-xs bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors shadow-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200"
                  >
                    <reply.icon size={14} className="text-primary-600" />
                    <span className="font-medium">{reply.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
  } catch (error) {
    console.error('Chatbot render error:', error);
    setHasError(true);
    return null;
  }
};

export default Chatbot;
