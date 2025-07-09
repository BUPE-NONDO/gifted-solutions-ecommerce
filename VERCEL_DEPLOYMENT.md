# 🚀 Vercel Deployment Guide for Gifted Solutions eCommerce

## 📋 Prerequisites
- GitHub account
- Vercel account (free)
- Your project code ready

## 🔧 Step-by-Step Deployment

### Step 1: Push Code to GitHub
1. Create a new repository on GitHub
2. Push your project code to the repository:
```bash
git init
git add .
git commit -m "Initial commit - Gifted Solutions eCommerce"
git branch -M main
git remote add origin https://github.com/yourusername/gifted-solutions.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Sign in with GitHub
3. Import your repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Environment Variables (Optional)
If you want to use environment variables instead of hardcoded config:

1. In Vercel dashboard, go to your project
2. Navigate to Settings > Environment Variables
3. Add these variables:
```
VITE_FIREBASE_API_KEY=AIzaSyBzcS3-kg7tOCdxWTYiMxogtHoVVsftbTI
VITE_FIREBASE_AUTH_DOMAIN=gifted-solutions-shop.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gifted-solutions-shop
VITE_FIREBASE_STORAGE_BUCKET=gifted-solutions-shop.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=364632918810
VITE_FIREBASE_APP_ID=1:364632918810:web:1d16bf7738d2e723febaa3
```

### Step 4: Custom Domain (Optional)
1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## 🔥 Firebase Configuration for Production

### Update Firebase Settings
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `gifted-solutions-shop`
3. Go to Authentication > Settings > Authorized domains
4. Add your Vercel domain (e.g., `your-app.vercel.app`)

### Update Privacy Policy URLs
After deployment, update these URLs in your Firebase/Facebook settings:
- Privacy Policy: `https://your-app.vercel.app/privacy-policy`
- Data Deletion: `https://your-app.vercel.app/data-deletion`

## ✅ Deployment Checklist
- [ ] Code pushed to GitHub
- [ ] Vercel project created and deployed
- [ ] Firebase authorized domains updated
- [ ] Privacy policy URLs updated
- [ ] Google Authentication tested
- [ ] All pages loading correctly

## 🛠️ Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Ensure build command is `npm run build`
- Verify output directory is `dist`

### Authentication Issues
- Verify Firebase authorized domains include your Vercel URL
- Check that Firebase config is correct
- Test Google authentication on live site

### Routing Issues
- Vercel.json is configured for SPA routing
- All routes should work with direct URLs

## 📱 Testing Your Deployment
1. Visit your Vercel URL
2. Test all main features:
   - Homepage loading
   - Product browsing
   - User authentication
   - Shopping cart
   - Admin features (if admin)
   - Dark mode toggle
   - Mobile responsiveness

## 🎯 Performance Optimization
Your app is already optimized with:
- Vite build optimization
- Code splitting warnings addressed
- Tailwind CSS purging
- Image optimization ready

## 📞 Support
If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify Firebase configuration
4. Test locally with `npm run build && npm run preview`
