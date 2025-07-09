# Deployment Guide - Gifted Solutions

Complete deployment guide for the Gifted Solutions eCommerce platform using Firebase + Vercel Blob architecture.

## 🚀 Quick Deployment

### Prerequisites
- Node.js 18+ installed
- Firebase account
- Vercel account
- Git repository access

### Step 1: Firebase Setup

1. **Create Firebase Project**
   ```bash
   # Go to https://console.firebase.google.com
   # Click "Create a project"
   # Follow the setup wizard
   ```

2. **Enable Required Services**
   - **Authentication**: Enable Email/Password provider
   - **Firestore**: Create database in production mode
   - **Security Rules**: Will be configured automatically

3. **Get Firebase Configuration**
   - Go to Project Settings → General
   - Scroll to "Your apps" section
   - Click "Web app" icon to create web app
   - Copy the configuration object

### Step 2: Vercel Deployment

1. **Deploy to Vercel**
   ```bash
   # Option 1: Import from GitHub
   # Go to https://vercel.com/dashboard
   # Click "New Project"
   # Import from GitHub: BUPE-NONDO/gifted-solutions-ecommerce
   # Set root directory to: gs/gifted-solutions
   
   # Option 2: Vercel CLI
   npm i -g vercel
   cd gs/gifted-solutions
   vercel
   ```

2. **Configure Environment Variables**
   In Vercel dashboard → Project Settings → Environment Variables:
   ```bash
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Enable Vercel Blob Storage**
   - Go to Vercel dashboard → Your Project → Storage tab
   - Click "Create Database" → "Blob"
   - The `BLOB_READ_WRITE_TOKEN` will be auto-generated

### Step 3: Initial Setup

1. **Create Admin User**
   ```bash
   # Go to Firebase Console → Authentication
   # Click "Add user"
   # Enter admin email and password
   # Note: First user becomes admin automatically
   ```

2. **Access Admin Panel**
   ```bash
   # Visit: https://your-app.vercel.app/super-admin
   # Login with admin credentials
   # Use "Fresh Start Upload" tab to add products
   ```

## 🔧 Advanced Configuration

### Custom Domain Setup

1. **Add Domain in Vercel**
   ```bash
   # Vercel Dashboard → Project → Settings → Domains
   # Add your custom domain
   # Configure DNS records as instructed
   ```

2. **Update Firebase Configuration**
   ```bash
   # Firebase Console → Authentication → Settings
   # Add your custom domain to authorized domains
   ```

### Performance Optimization

1. **Vercel Edge Functions** (Optional)
   ```javascript
   // api/edge-function.js
   export const config = {
     runtime: 'edge',
   }
   
   export default function handler(req) {
     // Custom edge logic
   }
   ```

2. **Firebase Security Rules**
   ```javascript
   // Firestore rules (auto-configured)
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /products/{document} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

## 🛡️ Security Checklist

- ✅ Firebase Security Rules configured
- ✅ Environment variables secured in Vercel
- ✅ HTTPS enforced (automatic with Vercel)
- ✅ Admin authentication required
- ✅ Vercel Blob access tokens secured

## 📊 Monitoring & Analytics

### Vercel Analytics
```bash
# Enable in Vercel dashboard
# Project → Analytics tab
# View performance metrics and user data
```

### Firebase Analytics
```bash
# Firebase Console → Analytics
# Track user engagement and app performance
```

## 🔄 Updates & Maintenance

### Deploying Updates
```bash
# Automatic deployment on git push to main branch
git add .
git commit -m "Update description"
git push origin main
# Vercel will automatically deploy
```

### Database Backup
```bash
# Firebase Console → Firestore → Import/Export
# Schedule regular backups
# Export data for local development
```

## 🆘 Troubleshooting

### Common Issues

1. **Images not loading**
   - Check `BLOB_READ_WRITE_TOKEN` in Vercel environment variables
   - Verify Blob storage is enabled in Vercel dashboard

2. **Authentication errors**
   - Verify Firebase configuration in environment variables
   - Check authorized domains in Firebase Console

3. **Build failures**
   - Check Node.js version (18+ required)
   - Verify all dependencies are installed
   - Check for TypeScript errors

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Project Repository](https://github.com/BUPE-NONDO/gifted-solutions-ecommerce)

## 🎯 Post-Deployment

1. **Test all functionality**
   - User registration and login
   - Product browsing and search
   - Admin panel access
   - Image uploads and display

2. **Performance verification**
   - Check image loading speeds
   - Test mobile responsiveness
   - Verify CDN delivery

3. **SEO optimization**
   - Submit sitemap to search engines
   - Configure meta tags
   - Set up analytics tracking

Your Gifted Solutions eCommerce platform is now live with Firebase + Vercel Blob architecture! 🎉
