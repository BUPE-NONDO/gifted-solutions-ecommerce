# Gifted Solutions - Premium eCommerce Platform

A full-featured eCommerce website built with React.js, TypeScript, and Firebase, featuring a secure admin panel and dynamic user shopping interface with green and black theme design.

## 🚀 Features

### 👨‍💼 Admin Panel
- Secure login with Firebase Authentication (email/password)
- Full CRUD operations for:
  - Product Categories (Electronics, Fashion, Art, Home Decor, Tech Gadgets)
  - Service Categories (Custom Gift Wrapping, Personal Shopping, Event Gifting, Bulk Orders)
  - Individual Products and Services with:
    - Title, Description, Category, Tags
    - Price, Stock Status
    - Image uploads to Firebase Storage
    - Visibility toggle (Show/Hide from store)
  - User Uploaded Requests management
- Dashboard with analytics (Total Sales, Products in Stock, Orders, Requests)
- Site preview functionality

### 🛍️ User Interface
- User Authentication via Firebase (Email/Password + Google OAuth ready)
- Categorized Products and Services browsing
- Shopping cart functionality with persistent storage
- Checkout process with order confirmation
- Custom product request feature with photo upload
- Contact/support form
- User profile with order history and request tracking
- Responsive design optimized for mobile and desktop

### 🛡️ Security Features
- Firebase Security Rules for admin/user data separation
- Firebase App Check integration ready
- Role-based authentication and route protection
- Input sanitization and XSS prevention
- Secure image storage with Firebase Storage
- HTTPS enforcement and CORS protection

### 🎨 Design & UI/UX
- **Theme Colors**: Green (#00b300) and Black (#000000)
- Tailwind CSS for responsive styling
- Custom component library with consistent design
- SEO-optimized with proper metadata
- Accessible and user-friendly interface

## 🛠️ Tech Stack

### Frontend
- **React.js 19** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **React Hook Form** for form management
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend/Services
- **Firebase Authentication** for user management
- **Firestore** for database
- **Firebase Storage** for file uploads
- **Firebase Hosting** for deployment
- **Firebase Functions** (ready for implementation)

### Development Tools
- TypeScript for type safety
- ESLint and Prettier (ready for setup)
- PostCSS and Autoprefixer

## 📁 Project Structure

```
/src
├── /components          → Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProtectedRoute.tsx
│   └── AdminRoute.tsx
├── /pages               → Main application pages
│   ├── Home.tsx
│   ├── Shop.tsx
│   ├── ProductDetail.tsx
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Contact.tsx
│   ├── CustomRequest.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   └── Profile.tsx
├── /hooks               → Custom React hooks
│   ├── useAuth.tsx
│   └── useCart.tsx
├── /services            → Firebase and API services
│   ├── firebase.ts
│   └── authService.ts
├── /utils               → Utility functions
├── App.tsx              → Main app component
└── main.tsx             → Application entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gifted-solutions
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase config and update `src/services/firebase.ts`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

### Firebase Configuration

Update `src/services/firebase.ts` with your Firebase project credentials:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🎯 Next Steps

### Immediate Implementation
1. **Firebase Setup**: Configure your Firebase project and update credentials
2. **Admin User**: Create first admin user in Firebase Console
3. **Product Data**: Add initial product categories and items
4. **Testing**: Test authentication and basic functionality

### Advanced Features (Ready for Implementation)
1. **Payment Integration**: Stripe/PayPal checkout
2. **Email Notifications**: Order confirmations and updates
3. **Search Functionality**: Product search and filtering
4. **Reviews System**: Product ratings and reviews
5. **Inventory Management**: Stock tracking and alerts
6. **Analytics**: Enhanced dashboard with charts
7. **Multi-language Support**: Internationalization
8. **PWA Features**: Offline functionality

## 🛡️ Security Considerations

- Update Firebase Security Rules before production
- Implement rate limiting for API calls
- Set up Firebase App Check for production
- Configure proper CORS policies
- Implement input validation on all forms
- Set up monitoring and logging

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎨 Theme Customization

The green and black theme can be customized in `tailwind.config.js`:
- Primary green: `#00b300`
- Secondary black: `#000000`
- Additional color variations included

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Gifted Solutions** - Making every gift special and memorable! 🎁
