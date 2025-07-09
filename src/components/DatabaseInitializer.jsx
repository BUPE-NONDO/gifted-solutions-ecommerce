import { useEffect, useState } from 'react';
import supabaseService from '../services/supabase';

const DatabaseInitializer = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        console.log('🚀 Initializing database tables...');

        // Test Supabase connection first
        console.log('Testing Supabase connection...');
        const { data, error } = await supabaseService.supabase
          .from('products')
          .select('count')
          .limit(1);

        if (error) {
          console.error('Supabase connection test failed:', error);
          throw new Error(`Database connection failed: ${error.message}`);
        }

        console.log('✅ Supabase connection successful');

        // Initialize order tables
        await supabaseService.initializeOrderTables();

        console.log('✅ Database tables initialized successfully');
        setInitialized(true);
      } catch (err) {
        console.error('❌ Failed to initialize database:', err);
        setError(err.message);
        // Still allow the app to continue even if database init fails
        setInitialized(true);
      }
    };

    initializeDatabase();
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.warn('Database initialization failed, but continuing:', error);
  }

  return children;
};

export default DatabaseInitializer;
