import React, { createContext, useContext, useState, useEffect } from 'react';
import supabaseService from '../services/supabase';

const SiteSettingsContext = createContext();

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    // Site Identity
    siteName: 'Gifted Solutions',
    tagline: 'Your Electronics Partner',
    logo: '',
    favicon: '',
    
    // Colors & Branding
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    backgroundColor: '#F9FAFB',
    textColor: '#111827',
    
    // Header Settings
    headerText: 'Welcome to Gifted Solutions',
    headerSubtext: 'Quality Electronics Components & Solutions',
    showHeaderBanner: true,
    headerBannerText: 'Free Delivery in Lusaka | WhatsApp: 0779421717',
    
    // Footer Settings
    footerText: 'Contact: 0779421717 | 0961288156',
    footerDescription: 'Your trusted partner for quality electronics components and solutions in Zambia.',
    showSocialLinks: true,
    
    // Contact Information
    phone1: '0779421717',
    phone2: '0961288156',
    email: 'giftedsolutions20@gmail.com',
    address: 'Lusaka, Zambia',
    whatsappNumber: '260779421717',
    
    // Social Media Links
    socialLinks: {
      facebook: 'bupelifestyle',
      twitter: 'giftedsolutionz',
      tiktok: 'bupelifestyle',
      instagram: '',
      youtube: '',
      linkedin: ''
    },
    
    // Homepage Settings
    heroTitle: 'Quality Electronics Components',
    heroSubtitle: 'Find everything you need for your electronics projects',
    heroButtonText: 'Shop Now',
    showFeaturedProducts: true,
    featuredSectionTitle: 'Featured Products',
    featuredSectionSubtitle: 'Discover our most popular electronics components',
    
    // Shop Settings
    shopTitle: 'Our Products',
    shopSubtitle: 'Browse our complete catalog of electronics components',
    productsPerPage: 12,
    showFilters: true,
    showSorting: true,
    
    // Business Settings
    currency: 'K',
    currencyPosition: 'before', // before or after
    showPrices: true,
    showStock: true,
    showRatings: false,
    
    // SEO Settings
    metaTitle: 'Gifted Solutions - Electronics Components Zambia',
    metaDescription: 'Quality electronics components and solutions in Zambia. Arduino, sensors, modules and more.',
    metaKeywords: 'electronics, arduino, sensors, zambia, lusaka, components',
    
    // Features
    enableSearch: true,
    enableCart: true,
    enableWishlist: false,
    enableReviews: false,
    enableBlog: false,
    
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: 'We are currently updating our website. Please check back soon.',
    
    // Analytics
    googleAnalyticsId: '',
    facebookPixelId: '',
    
    // Custom CSS
    customCSS: '',
    customJS: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load settings from Supabase
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabaseSettings = await supabaseService.getSiteSettings();
      
      if (supabaseSettings) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...supabaseSettings
        }));
        console.log('✅ Site settings loaded from Supabase');
      } else {
        console.log('ℹ️ No site settings found in Supabase, using defaults');
        // Save default settings to Supabase
        await saveSettings(settings);
      }
    } catch (error) {
      console.error('❌ Error loading site settings:', error);
      setError('Failed to load site settings');
    } finally {
      setLoading(false);
    }
  };

  // Save settings to Supabase
  const saveSettings = async (newSettings = settings) => {
    try {
      await supabaseService.updateSiteSettings(newSettings);
      setSettings(newSettings);
      console.log('✅ Site settings saved to Supabase');
      return true;
    } catch (error) {
      console.error('❌ Error saving site settings:', error);
      setError('Failed to save site settings');
      return false;
    }
  };

  // Update specific setting
  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    return await saveSettings(newSettings);
  };

  // Update multiple settings
  const updateSettings = async (updates) => {
    const newSettings = { ...settings, ...updates };
    return await saveSettings(newSettings);
  };

  // Reset to defaults
  const resetToDefaults = async () => {
    const defaultSettings = {
      siteName: 'Gifted Solutions',
      tagline: 'Your Electronics Partner',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      // ... other defaults
    };
    return await saveSettings(defaultSettings);
  };

  // Apply custom CSS
  const applyCustomStyles = () => {
    if (settings.customCSS) {
      const styleElement = document.getElementById('custom-styles');
      if (styleElement) {
        styleElement.textContent = settings.customCSS;
      } else {
        const style = document.createElement('style');
        style.id = 'custom-styles';
        style.textContent = settings.customCSS;
        document.head.appendChild(style);
      }
    }

    // Apply color variables
    const root = document.documentElement;
    root.style.setProperty('--primary-color', settings.primaryColor);
    root.style.setProperty('--secondary-color', settings.secondaryColor);
    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--background-color', settings.backgroundColor);
    root.style.setProperty('--text-color', settings.textColor);
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Apply styles when settings change
  useEffect(() => {
    if (!loading) {
      applyCustomStyles();
    }
  }, [settings, loading]);

  const value = {
    settings,
    loading,
    error,
    loadSettings,
    saveSettings,
    updateSetting,
    updateSettings,
    resetToDefaults,
    applyCustomStyles
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export default SiteSettingsContext;
