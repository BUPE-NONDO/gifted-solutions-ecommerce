/**
 * Hybrid Database Service - UPDATED
 * Using both Firebase and Supabase with proper fallbacks
 */

import { db } from './firebase'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import supabaseService from './supabase'

class HybridDatabaseService {
  constructor() {
    this.useSupabase = false // Start with Firebase, migrate to Supabase gradually
  }

  /**
   * Toggle between Firebase and Supabase
   */
  setDatabaseProvider(provider) {
    this.useSupabase = provider === 'supabase'
    console.log(`Database provider set to: ${provider}`)
  }

  /**
   * Get products from either Firebase or Supabase
   */
  async getProducts() {
    try {
      if (this.useSupabase) {
        console.log('Fetching products from Supabase...')
        return await supabaseService.getProducts()
      } else {
        console.log('Fetching products from Firebase...')
        const productsRef = collection(db, 'products')
        const snapshot = await getDocs(productsRef)
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      }
    } catch (error) {
      console.error('Error fetching products:', error)

      // Fallback to the other database
      try {
        if (this.useSupabase) {
          console.log('Supabase failed, falling back to Firebase...')
          const productsRef = collection(db, 'products')
          const snapshot = await getDocs(productsRef)
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        } else {
          console.log('Firebase failed, falling back to Supabase...')
          return await supabaseService.getProducts()
        }
      } catch (fallbackError) {
        console.error('Both databases failed:', fallbackError)
        throw new Error('Unable to fetch products from any database')
      }
    }
  }

  /**
   * Add product to current database
   */
  async addProduct(product) {
    try {
      if (this.useSupabase) {
        return await supabaseService.addProduct(product)
      } else {
        const productsRef = collection(db, 'products')
        const docRef = await addDoc(productsRef, {
          ...product,
          created_at: new Date(),
          updated_at: new Date()
        })
        return { id: docRef.id, ...product }
      }
    } catch (error) {
      console.error('Error adding product:', error)
      throw error
    }
  }

  /**
   * Update product in current database
   */
  async updateProduct(id, updates) {
    try {
      if (this.useSupabase) {
        return await supabaseService.updateProduct(id, updates)
      } else {
        const productRef = doc(db, 'products', id)
        await updateDoc(productRef, {
          ...updates,
          updated_at: new Date()
        })
        return { id, ...updates }
      }
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  /**
   * Delete product from current database
   */
  async deleteProduct(id) {
    try {
      if (this.useSupabase) {
        return await supabaseService.deleteProduct(id)
      } else {
        const productRef = doc(db, 'products', id)
        await deleteDoc(productRef)
        return true
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  /**
   * Get categories from current database
   */
  async getCategories() {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabaseService.supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true })

        if (error) throw error
        return data
      } else {
        const categoriesRef = collection(db, 'categories')
        const snapshot = await getDocs(categoriesRef)
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  /**
   * Submit custom request
   */
  async submitCustomRequest(request) {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabaseService.supabase
          .from('custom_requests')
          .insert([{
            ...request,
            status: 'pending',
            created_at: new Date().toISOString()
          }])
          .select()

        if (error) throw error
        return data[0]
      } else {
        const requestsRef = collection(db, 'customRequests')
        const docRef = await addDoc(requestsRef, {
          ...request,
          status: 'pending',
          created_at: new Date(),
          updated_at: new Date()
        })
        return { id: docRef.id, ...request }
      }
    } catch (error) {
      console.error('Error submitting custom request:', error)
      throw error
    }
  }

  /**
   * Submit contact message
   */
  async submitContactMessage(message) {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabaseService.supabase
          .from('contact_messages')
          .insert([{
            ...message,
            status: 'unread',
            created_at: new Date().toISOString()
          }])
          .select()

        if (error) throw error
        return data[0]
      } else {
        const messagesRef = collection(db, 'contactMessages')
        const docRef = await addDoc(messagesRef, {
          ...message,
          status: 'unread',
          created_at: new Date(),
          updated_at: new Date()
        })
        return { id: docRef.id, ...message }
      }
    } catch (error) {
      console.error('Error submitting contact message:', error)
      throw error
    }
  }

  /**
   * Get site settings
   */
  async getSettings() {
    try {
      if (this.useSupabase) {
        const { data, error } = await supabaseService.supabase
          .from('settings')
          .select('*')

        if (error) throw error

        // Convert to key-value object
        const settings = {}
        data.forEach(setting => {
          settings[setting.key] = setting.value
        })
        return settings
      } else {
        const settingsRef = collection(db, 'settings')
        const snapshot = await getDocs(settingsRef)
        const settings = {}
        snapshot.docs.forEach(doc => {
          settings[doc.id] = doc.data()
        })
        return settings
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      throw error
    }
  }

  /**
   * Migrate data from Firebase to Supabase
   */
  async migrateToSupabase() {
    try {
      console.log('Starting migration from Firebase to Supabase...')

      // Migrate products
      console.log('Migrating products...')
      const firebaseProducts = await this.getProducts() // Will use Firebase since useSupabase is false

      this.setDatabaseProvider('supabase')

      for (const product of firebaseProducts) {
        try {
          await this.addProduct(product)
          console.log(`Migrated product: ${product.name}`)
        } catch (error) {
          console.error(`Failed to migrate product ${product.name}:`, error)
        }
      }

      console.log('Migration completed!')
      return true
    } catch (error) {
      console.error('Migration failed:', error)
      this.setDatabaseProvider('firebase') // Rollback
      throw error
    }
  }

  /**
   * Test both databases
   */
  async testDatabases() {
    const results = {
      firebase: { status: 'unknown', products: 0, error: null },
      supabase: { status: 'unknown', products: 0, error: null }
    }

    // Test Firebase
    try {
      this.setDatabaseProvider('firebase')
      const firebaseProducts = await this.getProducts()
      results.firebase = {
        status: 'working',
        products: firebaseProducts.length,
        error: null
      }
    } catch (error) {
      results.firebase = {
        status: 'error',
        products: 0,
        error: error.message
      }
    }

    // Test Supabase
    try {
      this.setDatabaseProvider('supabase')
      const supabaseProducts = await this.getProducts()
      results.supabase = {
        status: 'working',
        products: supabaseProducts.length,
        error: null
      }
    } catch (error) {
      results.supabase = {
        status: 'error',
        products: 0,
        error: error.message
      }
    }

    // Reset to Firebase as default
    this.setDatabaseProvider('firebase')

    return results
  }
}

// Create singleton instance
const hybridDb = new HybridDatabaseService()

export default hybridDb
