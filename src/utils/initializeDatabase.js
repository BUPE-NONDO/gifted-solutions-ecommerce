import { supabase } from '../lib/supabase';

/**
 * Initialize database tables for site settings and content management
 */
export const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database tables...');

    // Create site_settings table
    const { error: settingsTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS site_settings (
          id SERIAL PRIMARY KEY,
          site_name VARCHAR(255) DEFAULT 'Gifted Solutions',
          tagline VARCHAR(255) DEFAULT 'Your Electronics Partner',
          logo TEXT,
          favicon TEXT,
          primary_color VARCHAR(7) DEFAULT '#3B82F6',
          secondary_color VARCHAR(7) DEFAULT '#10B981',
          accent_color VARCHAR(7) DEFAULT '#F59E0B',
          background_color VARCHAR(7) DEFAULT '#F9FAFB',
          text_color VARCHAR(7) DEFAULT '#111827',
          header_text VARCHAR(255) DEFAULT 'Welcome to Gifted Solutions',
          header_subtext TEXT DEFAULT 'Quality Electronics Components & Solutions',
          show_header_banner BOOLEAN DEFAULT true,
          header_banner_text VARCHAR(255) DEFAULT 'Free Delivery in Lusaka | WhatsApp: 0779421717',
          footer_text TEXT DEFAULT 'Contact: 0779421717 | 0961288156',
          footer_description TEXT DEFAULT 'Your trusted partner for quality electronics components and solutions in Zambia.',
          show_social_links BOOLEAN DEFAULT true,
          phone1 VARCHAR(20) DEFAULT '0779421717',
          phone2 VARCHAR(20) DEFAULT '0961288156',
          email VARCHAR(255) DEFAULT 'giftedsolutions20@gmail.com',
          address TEXT DEFAULT 'Lusaka, Zambia',
          whatsapp_number VARCHAR(20) DEFAULT '260779421717',
          social_links JSONB DEFAULT '{"facebook": "bupelifestyle", "twitter": "giftedsolutionz", "tiktok": "bupelifestyle", "instagram": "", "youtube": "", "linkedin": ""}',
          hero_title VARCHAR(255) DEFAULT 'Quality Electronics Components',
          hero_subtitle TEXT DEFAULT 'Find everything you need for your electronics projects',
          hero_button_text VARCHAR(100) DEFAULT 'Shop Now',
          show_featured_products BOOLEAN DEFAULT true,
          featured_section_title VARCHAR(255) DEFAULT 'Featured Products',
          featured_section_subtitle TEXT DEFAULT 'Discover our most popular electronics components',
          shop_title VARCHAR(255) DEFAULT 'Our Products',
          shop_subtitle TEXT DEFAULT 'Browse our complete catalog of electronics components',
          products_per_page INTEGER DEFAULT 12,
          show_filters BOOLEAN DEFAULT true,
          show_sorting BOOLEAN DEFAULT true,
          currency VARCHAR(10) DEFAULT 'K',
          currency_position VARCHAR(10) DEFAULT 'before',
          show_prices BOOLEAN DEFAULT true,
          show_stock BOOLEAN DEFAULT true,
          show_ratings BOOLEAN DEFAULT false,
          meta_title VARCHAR(255) DEFAULT 'Gifted Solutions - Electronics Components Zambia',
          meta_description TEXT DEFAULT 'Quality electronics components and solutions in Zambia. Arduino, sensors, modules and more.',
          meta_keywords TEXT DEFAULT 'electronics, arduino, sensors, zambia, lusaka, components',
          enable_search BOOLEAN DEFAULT true,
          enable_cart BOOLEAN DEFAULT true,
          enable_wishlist BOOLEAN DEFAULT false,
          enable_reviews BOOLEAN DEFAULT false,
          enable_blog BOOLEAN DEFAULT false,
          maintenance_mode BOOLEAN DEFAULT false,
          maintenance_message TEXT DEFAULT 'We are currently updating our website. Please check back soon.',
          google_analytics_id VARCHAR(255),
          facebook_pixel_id VARCHAR(255),
          custom_css TEXT,
          custom_js TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (settingsTableError) {
      console.error('Error creating site_settings table:', settingsTableError);
    } else {
      console.log('✅ site_settings table created/verified');
    }

    // Create page_content table
    const { error: contentTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS page_content (
          id SERIAL PRIMARY KEY,
          page_id VARCHAR(100) UNIQUE NOT NULL,
          title VARCHAR(255),
          content TEXT,
          meta_title VARCHAR(255),
          meta_description TEXT,
          meta_keywords TEXT,
          custom_css TEXT,
          custom_js TEXT,
          published BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (contentTableError) {
      console.error('Error creating page_content table:', contentTableError);
    } else {
      console.log('✅ page_content table created/verified');
    }

    // Create trigger for updated_at
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
        CREATE TRIGGER update_site_settings_updated_at
          BEFORE UPDATE ON site_settings
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_page_content_updated_at ON page_content;
        CREATE TRIGGER update_page_content_updated_at
          BEFORE UPDATE ON page_content
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (triggerError) {
      console.error('Error creating triggers:', triggerError);
    } else {
      console.log('✅ Database triggers created/verified');
    }

    // Insert default settings if none exist
    const { data: existingSettings } = await supabase
      .from('site_settings')
      .select('id')
      .limit(1);

    if (!existingSettings || existingSettings.length === 0) {
      const { error: insertError } = await supabase
        .from('site_settings')
        .insert({
          site_name: 'Gifted Solutions',
          tagline: 'Your Electronics Partner',
          header_text: 'Welcome to Gifted Solutions',
          header_subtext: 'Quality Electronics Components & Solutions',
          footer_text: 'Contact: 0779421717 | 0961288156',
          footer_description: 'Your trusted partner for quality electronics components and solutions in Zambia.',
          social_links: {
            facebook: 'bupelifestyle',
            twitter: 'giftedsolutionz',
            tiktok: 'bupelifestyle',
            instagram: '',
            youtube: '',
            linkedin: ''
          }
        });

      if (insertError) {
        console.error('Error inserting default settings:', insertError);
      } else {
        console.log('✅ Default site settings inserted');
      }
    }

    console.log('🎉 Database initialization completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

/**
 * Alternative method using direct SQL execution
 */
export const initializeDatabaseDirect = async () => {
  try {
    console.log('🔧 Initializing database with direct SQL...');

    // Create site_settings table with direct SQL
    const createSiteSettingsSQL = `
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        site_name VARCHAR(255) DEFAULT 'Gifted Solutions',
        tagline VARCHAR(255) DEFAULT 'Your Electronics Partner',
        logo TEXT,
        primary_color VARCHAR(7) DEFAULT '#3B82F6',
        secondary_color VARCHAR(7) DEFAULT '#10B981',
        header_text VARCHAR(255) DEFAULT 'Welcome to Gifted Solutions',
        header_subtext TEXT DEFAULT 'Quality Electronics Components & Solutions',
        footer_text TEXT DEFAULT 'Contact: 0779421717 | 0961288156',
        footer_description TEXT DEFAULT 'Your trusted partner for quality electronics components and solutions in Zambia.',
        show_social_links BOOLEAN DEFAULT true,
        phone1 VARCHAR(20) DEFAULT '0779421717',
        phone2 VARCHAR(20) DEFAULT '0961288156',
        email VARCHAR(255) DEFAULT 'giftedsolutions20@gmail.com',
        address TEXT DEFAULT 'Lusaka, Zambia',
        whatsapp_number VARCHAR(20) DEFAULT '260779421717',
        social_links JSONB DEFAULT '{"facebook": "bupelifestyle", "twitter": "giftedsolutionz", "tiktok": "bupelifestyle"}',
        hero_title VARCHAR(255) DEFAULT 'Quality Electronics Components',
        hero_subtitle TEXT DEFAULT 'Find everything you need for your electronics projects',
        hero_button_text VARCHAR(100) DEFAULT 'Shop Now',
        featured_section_title VARCHAR(255) DEFAULT 'Featured Products',
        featured_section_subtitle TEXT DEFAULT 'Discover our most popular electronics components',
        currency VARCHAR(10) DEFAULT 'K',
        show_featured_products BOOLEAN DEFAULT true,
        enable_search BOOLEAN DEFAULT true,
        enable_cart BOOLEAN DEFAULT true,
        maintenance_mode BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Try to create the table using a simple insert/upsert approach
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 1,
        site_name: 'Gifted Solutions',
        tagline: 'Your Electronics Partner',
        header_text: 'Welcome to Gifted Solutions',
        header_subtext: 'Quality Electronics Components & Solutions',
        footer_text: 'Contact: 0779421717 | 0961288156',
        footer_description: 'Your trusted partner for quality electronics components and solutions in Zambia.',
        social_links: {
          facebook: 'bupelifestyle',
          twitter: 'giftedsolutionz',
          tiktok: 'bupelifestyle'
        },
        phone1: '0779421717',
        phone2: '0961288156',
        whatsapp_number: '260779421717',
        hero_title: 'Quality Electronics Components',
        hero_subtitle: 'Find everything you need for your electronics projects',
        hero_button_text: 'Shop Now',
        featured_section_title: 'Featured Products',
        featured_section_subtitle: 'Discover our most popular electronics components',
        currency: 'K',
        show_featured_products: true,
        show_social_links: true,
        enable_search: true,
        enable_cart: true,
        maintenance_mode: false
      })
      .select();

    if (error) {
      console.log('ℹ️ Table might not exist yet, this is expected on first run:', error.message);
      return false;
    }

    console.log('✅ Site settings initialized successfully');
    return true;

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

export default {
  initializeDatabase,
  initializeDatabaseDirect
};
