from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json
import uuid
from datetime import datetime

# Add the parent directory to the path to import the PayClass
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
from pay import PayClass

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store payment transactions in memory (in production, use a database)
payment_transactions = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'MTN MOMO Payment Server is running',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/payment/initiate', methods=['POST'])
def initiate_payment():
    """Initiate MTN MOMO payment"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['amount', 'phone_number', 'order_id', 'customer_name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Extract payment details
        amount = float(data['amount'])
        phone_number = str(data['phone_number'])
        order_id = str(data['order_id'])
        customer_name = str(data['customer_name'])
        currency = data.get('currency', 'EUR')  # Default to EUR for sandbox
        
        # Create payment message
        payer_message = f"Payment for Gifted Solutions order #{order_id} by {customer_name}"
        
        # Initiate MTN MOMO payment
        payment_result = PayClass.momopay(
            amount=amount,
            currency=currency,
            txt_ref=order_id,
            phone_number=phone_number,
            payermessage=payer_message
        )
        
        # Store transaction details
        transaction_id = payment_result['ref']
        payment_transactions[transaction_id] = {
            'transaction_id': transaction_id,
            'order_id': order_id,
            'amount': amount,
            'currency': currency,
            'phone_number': phone_number,
            'customer_name': customer_name,
            'status': 'PENDING',
            'created_at': datetime.now().isoformat(),
            'response_code': payment_result['response']
        }
        
        # Check if payment was initiated successfully
        if payment_result['response'] in [200, 202]:
            return jsonify({
                'success': True,
                'transaction_id': transaction_id,
                'status': 'PENDING',
                'message': 'Payment initiated successfully. Please check your phone for MTN MOMO prompt.',
                'order_id': order_id
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to initiate payment',
                'response_code': payment_result['response']
            }), 400
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Payment initiation failed: {str(e)}'
        }), 500

@app.route('/api/payment/verify/<transaction_id>', methods=['GET'])
def verify_payment(transaction_id):
    """Verify MTN MOMO payment status"""
    try:
        # Check if transaction exists in our records
        if transaction_id not in payment_transactions:
            return jsonify({
                'success': False,
                'error': 'Transaction not found'
            }), 404
        
        # Verify payment with MTN MOMO API
        verification_result = PayClass.verifymomo(transaction_id)
        
        # Update transaction status
        transaction = payment_transactions[transaction_id]
        transaction['status'] = verification_result.get('status', 'UNKNOWN')
        transaction['verified_at'] = datetime.now().isoformat()
        transaction['verification_details'] = verification_result
        
        return jsonify({
            'success': True,
            'transaction_id': transaction_id,
            'status': verification_result.get('status', 'UNKNOWN'),
            'order_id': transaction['order_id'],
            'amount': transaction['amount'],
            'currency': transaction['currency'],
            'verification_details': verification_result
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Payment verification failed: {str(e)}'
        }), 500

@app.route('/api/payment/status/<order_id>', methods=['GET'])
def get_payment_status(order_id):
    """Get payment status by order ID"""
    try:
        # Find transaction by order_id
        transaction = None
        for txn_id, txn_data in payment_transactions.items():
            if txn_data['order_id'] == order_id:
                transaction = txn_data
                break
        
        if not transaction:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404
        
        return jsonify({
            'success': True,
            'order_id': order_id,
            'transaction_id': transaction['transaction_id'],
            'status': transaction['status'],
            'amount': transaction['amount'],
            'currency': transaction['currency'],
            'created_at': transaction['created_at']
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get payment status: {str(e)}'
        }), 500

@app.route('/api/payment/transactions', methods=['GET'])
def get_all_transactions():
    """Get all payment transactions (for admin/debugging)"""
    try:
        return jsonify({
            'success': True,
            'transactions': list(payment_transactions.values())
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Failed to get transactions: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🚀 Starting MTN MOMO Payment Server...")
    print("📱 MTN MOMO API Integration: ACTIVE")
    print("🌐 Server running on: http://localhost:5000")
    print("💳 Payment endpoints available:")
    print("   - POST /api/payment/initiate")
    print("   - GET /api/payment/verify/<transaction_id>")
    print("   - GET /api/payment/status/<order_id>")
    print("   - GET /api/health")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
