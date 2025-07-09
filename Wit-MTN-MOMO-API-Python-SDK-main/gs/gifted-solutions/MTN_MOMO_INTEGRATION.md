# MTN MOMO Payment Integration

## 🚀 Overview

This integration adds MTN MOMO payment functionality to the Gifted Solutions eCommerce platform. Customers can now pay directly using their MTN MOMO accounts with real-time payment verification.

## 🏗️ Architecture

### Components Added:

1. **Flask Payment Server** (`payment-server/app.py`)
   - Handles MTN MOMO API integration
   - Processes payment initiation and verification
   - Runs on `http://localhost:5000`

2. **MTN MOMO Checkout Component** (`src/components/MTNMomoCheckout.jsx`)
   - Multi-step checkout process
   - Customer details collection
   - Payment initiation and verification
   - Real-time status updates

3. **Updated Cart Components**
   - `ShoppingCart.jsx` - Added MTN MOMO payment option
   - `Cart.jsx` - Added MTN MOMO payment option

## 🔧 Setup Instructions

### 1. Install Python Dependencies

```bash
cd payment-server
pip install -r requirements.txt
```

### 2. Start the Payment Server

**Option A: Using the batch file (Windows)**
```bash
cd payment-server
start_server.bat
```

**Option B: Manual start**
```bash
cd payment-server
python app.py
```

### 3. Start the React Development Server

```bash
npm run dev
```

## 💳 Payment Flow

### Customer Experience:

1. **Add items to cart** - Browse and add products
2. **Open cart** - Click cart icon or go to cart page
3. **Choose MTN MOMO** - Click "Pay with MTN MOMO" button
4. **Enter details** - Fill customer information and MTN phone number
5. **Initiate payment** - System sends payment request to MTN
6. **Complete on phone** - Customer receives MTN MOMO prompt on phone
7. **Enter PIN** - Customer enters MTN MOMO PIN to confirm
8. **Verification** - System automatically verifies payment status
9. **Success** - Order confirmed and cart cleared

### Technical Flow:

1. **Frontend** → Collects customer details and cart information
2. **Flask API** → Receives payment request
3. **MTN MOMO API** → Initiates payment request
4. **Customer Phone** → Receives payment prompt
5. **MTN MOMO API** → Processes payment
6. **Flask API** → Polls for payment verification
7. **Frontend** → Displays real-time status updates
8. **Success** → Payment confirmed and order processed

## 🔌 API Endpoints

### Payment Server Endpoints:

- `GET /api/health` - Health check
- `POST /api/payment/initiate` - Initiate MTN MOMO payment
- `GET /api/payment/verify/<transaction_id>` - Verify payment status
- `GET /api/payment/status/<order_id>` - Get payment status by order ID
- `GET /api/payment/transactions` - Get all transactions (admin)

### Example Payment Request:

```json
{
  "amount": 150.00,
  "phone_number": "260779421717",
  "order_id": "GS-1234567890",
  "customer_name": "John Doe",
  "currency": "EUR"
}
```

## 🛡️ Security Features

- **CORS Protection** - Configured for frontend domain
- **Input Validation** - All payment data validated
- **Transaction Tracking** - Unique transaction IDs
- **Error Handling** - Comprehensive error responses
- **Timeout Protection** - Payment verification timeout (5 minutes)

## 🎨 UI Features

### MTN MOMO Checkout Modal:

- **Step 1: Customer Details**
  - Name, email, phone validation
  - Delivery address collection
  - Order summary display

- **Step 2: Payment Initiation**
  - Payment amount confirmation
  - MTN MOMO instructions
  - One-click payment initiation

- **Step 3: Verification**
  - Real-time status polling
  - Loading indicators
  - Transaction ID display

- **Step 4: Success**
  - Payment confirmation
  - Order details
  - Cart clearing

### Cart Integration:

- **Dual Payment Options**
  - MTN MOMO (instant payment)
  - WhatsApp (manual processing)
  - Clear option separation

- **Visual Indicators**
  - Payment method badges
  - Status indicators
  - Loading states

## 🔧 Configuration

### MTN MOMO Settings (in `pay.py`):

```python
# Sandbox Mode (for testing)
environment_mode = "sandbox"
collections_subkey = "dd541a46608d4c04840f45709d89a3b1"

# Production Mode (for live payments)
# environment_mode = "production"
# Update subscription keys and API credentials
```

### Flask Server Settings:

```python
# Server Configuration
host = '0.0.0.0'  # Accept connections from any IP
port = 5000       # Default port
debug = True      # Development mode
```

## 🧪 Testing

### Test Payment Flow:

1. **Start both servers** (React + Flask)
2. **Add items to cart**
3. **Use test phone number**: `260779421717`
4. **Use test amount**: Any amount (sandbox mode)
5. **Monitor console** for payment status updates

### Test Endpoints:

```bash
# Health check
curl http://localhost:5000/api/health

# View all transactions
curl http://localhost:5000/api/payment/transactions
```

## 🚨 Troubleshooting

### Common Issues:

1. **Payment server not starting**
   - Check Python installation
   - Install requirements: `pip install -r requirements.txt`
   - Check port 5000 availability

2. **CORS errors**
   - Ensure Flask server is running
   - Check CORS configuration in `app.py`

3. **Payment verification timeout**
   - Check MTN MOMO API connectivity
   - Verify phone number format
   - Check sandbox/production mode

4. **Frontend errors**
   - Ensure payment server is running on port 5000
   - Check browser console for errors
   - Verify component imports

## 📱 Mobile Compatibility

- **Responsive Design** - Works on all screen sizes
- **Touch Friendly** - Large buttons and inputs
- **Mobile Optimized** - Optimized for mobile checkout flow

## 🔄 Future Enhancements

- **Database Integration** - Store transactions in database
- **Email Notifications** - Send payment confirmations
- **SMS Integration** - SMS payment confirmations
- **Admin Dashboard** - Payment management interface
- **Multiple Currencies** - Support for local currencies
- **Airtel Money** - Additional payment provider

## 📞 Support

For technical support or questions:
- **Phone**: 0779421717
- **Email**: Contact through WhatsApp integration
- **Documentation**: This README file

---

**🎉 MTN MOMO integration successfully added to Gifted Solutions eCommerce platform!**
