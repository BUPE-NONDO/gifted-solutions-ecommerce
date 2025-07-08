import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

/**
 * Debug component to help identify issues with the UnifiedImageManager
 */
const DebugInfo = () => {
  const [debugData, setDebugData] = useState({
    supabaseConnection: 'checking...',
    databaseSchema: 'checking...',
    products: 'checking...',
    storage: 'checking...',
    errors: []
  });

  useEffect(() => {
    const runDiagnostics = async () => {
      const errors = [];
      const newDebugData = {
        supabaseConnection: 'checking...',
        databaseSchema: 'checking...',
        products: 'checking...',
        storage: 'checking...',
        errors: []
      };

      try {
        // Test Supabase connection
        console.log('🔍 Testing Supabase connection...');
        const { data: connectionTest, error: connectionError } = await supabase
          .from('products')
          .select('count')
          .limit(1);
        
        if (connectionError) {
          errors.push(`Connection Error: ${connectionError.message}`);
          newDebugData.supabaseConnection = '❌ Failed';
        } else {
          newDebugData.supabaseConnection = '✅ Connected';
        }

        // Test database schema
        console.log('🔍 Testing database schema...');
        try {
          const { data: schemaTest, error: schemaError } = await supabase
            .from('products')
            .select('id, name, description, price, category, image, inStock, badge, featured, images, visible, imageVersion')
            .limit(1);
          
          if (schemaError) {
            errors.push(`Schema Error: ${schemaError.message}`);
            newDebugData.databaseSchema = '❌ Missing columns';
          } else {
            newDebugData.databaseSchema = '✅ Complete';
          }
        } catch (schemaErr) {
          errors.push(`Schema Test Error: ${schemaErr.message}`);
          newDebugData.databaseSchema = '❌ Error';
        }

        // Test products query
        console.log('🔍 Testing products query...');
        try {
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .limit(5);
          
          if (productsError) {
            errors.push(`Products Error: ${productsError.message}`);
            newDebugData.products = '❌ Failed';
          } else {
            newDebugData.products = `✅ Found ${products?.length || 0} products`;
          }
        } catch (productsErr) {
          errors.push(`Products Test Error: ${productsErr.message}`);
          newDebugData.products = '❌ Error';
        }

        // Test storage
        console.log('🔍 Testing storage...');
        try {
          const { data: storageTest, error: storageError } = await supabase.storage
            .from('product-images')
            .list('', { limit: 1 });
          
          if (storageError) {
            errors.push(`Storage Error: ${storageError.message}`);
            newDebugData.storage = '❌ Failed';
          } else {
            newDebugData.storage = '✅ Accessible';
          }
        } catch (storageErr) {
          errors.push(`Storage Test Error: ${storageErr.message}`);
          newDebugData.storage = '❌ Error';
        }

        newDebugData.errors = errors;
        setDebugData(newDebugData);

      } catch (globalError) {
        console.error('Global diagnostic error:', globalError);
        setDebugData({
          ...newDebugData,
          errors: [...errors, `Global Error: ${globalError.message}`]
        });
      }
    };

    runDiagnostics();
  }, []);

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold text-sm mb-2">🔧 Debug Info</h3>
      <div className="text-xs space-y-1">
        <div>Supabase: {debugData.supabaseConnection}</div>
        <div>Schema: {debugData.databaseSchema}</div>
        <div>Products: {debugData.products}</div>
        <div>Storage: {debugData.storage}</div>
        
        {debugData.errors.length > 0 && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
            <div className="font-semibold text-red-800">Errors:</div>
            {debugData.errors.map((error, index) => (
              <div key={index} className="text-red-700 text-xs mt-1">
                {error}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div>URL: {window.location.pathname}</div>
          <div>Time: {new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;
