# Facebook Authentication Setup Guide

## Error: Firebase: Error (auth/operation-not-allowed)

This error occurs because Facebook authentication is not enabled in your Firebase project. Follow these steps to enable it:

## Step 1: Enable Facebook Authentication in Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: Choose the Gifted Solutions project
3. **Navigate to Authentication**:
   - Click on "Authentication" in the left sidebar
   - Click on "Sign-in method" tab
4. **Enable Facebook Provider**:
   - Find "Facebook" in the list of providers
   - Click on "Facebook"
   - Toggle the "Enable" switch to ON
   - You'll need to provide:
     - **App ID**: From your Facebook App
     - **App Secret**: From your Facebook App

## Step 2: Create Facebook App (if you don't have one)

1. **Go to Facebook Developers**: https://developers.facebook.com/
2. **Create a New App**:
   - Click "Create App"
   - Choose "Consumer" as the app type
   - Fill in app details:
     - App Name: "Gifted Solutions"
     - App Contact Email: Your email
     - App Purpose: Business
3. **Add Facebook Login Product**:
   - In your app dashboard, click "Add Product"
   - Find "Facebook Login" and click "Set Up"
4. **Configure Facebook Login**:
   - Go to Facebook Login > Settings
   - Add Valid OAuth Redirect URIs:
     ```
     https://your-project-id.firebaseapp.com/__/auth/handler
     ```
     Replace `your-project-id` with your actual Firebase project ID

## Step 3: Get App Credentials

1. **Get App ID and Secret**:
   - Go to Settings > Basic in your Facebook app
   - Copy the "App ID"
   - Click "Show" next to "App Secret" and copy it
2. **Add to Firebase**:
   - Return to Firebase Console > Authentication > Sign-in method
   - Click on Facebook provider
   - Paste the App ID and App Secret
   - Copy the OAuth redirect URI from Firebase
   - Add this URI to your Facebook app's Valid OAuth Redirect URIs

## Step 4: Configure App Domains (for production)

1. **In Facebook App Settings**:
   - Go to Settings > Basic
   - Add your domain to "App Domains":
     ```
     your-domain.com
     localhost (for development)
     ```
2. **Add Platform**:
   - Scroll down to "Add Platform"
   - Choose "Website"
   - Add your site URL:
     ```
     https://your-domain.com
     http://localhost:3002 (for development)
     ```

## Step 5: Test the Integration

1. **Save all settings** in both Firebase and Facebook
2. **Restart your development server**:
   ```bash
   npm run dev
   ```
3. **Test Facebook login** on your website

## Development vs Production

### Development Setup:
- Use `localhost:3002` in Facebook app settings
- OAuth redirect: `https://your-project-id.firebaseapp.com/__/auth/handler`

### Production Setup:
- Use your actual domain in Facebook app settings
- Same OAuth redirect URI
- Make sure your domain is verified in Facebook app

## Troubleshooting

### Common Issues:

1. **"App Not Setup" Error**:
   - Make sure Facebook Login product is added to your app
   - Check that OAuth redirect URI is correctly configured

2. **"Invalid OAuth access token" Error**:
   - Verify App ID and App Secret are correct in Firebase
   - Check that the Facebook app is not in development mode for production use

3. **"This app is in development mode" Error**:
   - For production, you need to make your Facebook app live
   - Go to App Review in Facebook Developer Console
   - Submit for review or add test users

### Test Users (Development):
- Add test users in Facebook Developer Console > Roles > Test Users
- Test users can use Facebook login even when app is in development mode

## Security Notes

- **Never expose App Secret** in client-side code
- **Use HTTPS** in production
- **Regularly rotate** App Secret for security
- **Review permissions** requested from users

## Firebase Configuration Check

Make sure your Firebase configuration includes the correct settings:

```javascript
// firebase.js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};
```

The `authDomain` should match the domain used in OAuth redirect URI.
