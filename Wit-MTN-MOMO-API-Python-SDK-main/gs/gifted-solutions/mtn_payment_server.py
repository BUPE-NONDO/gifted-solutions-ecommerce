from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json
import uuid
from datetime import datetime

# Add the parent directory to the path to import the PayClass
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
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
        payer_message = f"Payment for order {order_id} by {customer_name}"
        
        # Generate unique transaction ID
        transaction_id = str(uuid.uuid4())
        
        print(f"Initiating payment: Amount={amount}, Phone={phone_number}, Order={order_id}")
        
        # Call MTN MOMO API
        payment_result = PayClass.momopay(
            amount=amount,
            currency=currency,
            txt_ref=order_id,
            phone_number=phone_number,
            payermessage=payer_message
        )
        
        print(f"Payment result: {payment_result}")
        
        # Store transaction details
        payment_transactions[transaction_id] = {
            'order_id': order_id,
            'amount': amount,
            'currency': currency,
            'phone_number': phone_number,
            'customer_name': customer_name,
            'payment_result': payment_result,
            'status': 'initiated',
            'created_at': datetime.now().isoformat(),
            'transaction_id': transaction_id
        }
        
        # Also store by order_id for easy lookup
        payment_transactions[order_id] = payment_transactions[transaction_id]
        
        if payment_result and 'success' in payment_result and payment_result['success']:
            return jsonify({
                'success': True,
                'transaction_id': transaction_id,
                'order_id': order_id,
                'message': 'Payment initiated successfully',
                'payment_result': payment_result
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Failed to initiate payment',
                'details': payment_result
            }), 400
            
    except Exception as e:
        print(f"Error initiating payment: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Payment initiation failed: {str(e)}'
        }), 500

@app.route('/api/payment/verify/<transaction_id>', methods=['GET'])
def verify_payment(transaction_id):
    """Verify MTN MOMO payment status"""
    try:
        if transaction_id not in payment_transactions:
            return jsonify({
                'success': False,
                'error': 'Transaction not found'
            }), 404
        
        transaction = payment_transactions[transaction_id]
        order_id = transaction['order_id']
        
        print(f"Verifying payment for transaction: {transaction_id}, order: {order_id}")
        
        # Call MTN MOMO verification API
        verification_result = PayClass.verifymomo(order_id)
        
        print(f"Verification result: {verification_result}")
        
        # Update transaction status
        transaction['verification_result'] = verification_result
        transaction['last_verified'] = datetime.now().isoformat()
        
        if verification_result and 'success' in verification_result:
            if verification_result['success']:
                transaction['status'] = 'completed'
                return jsonify({
                    'success': True,
                    'status': 'completed',
                    'transaction_id': transaction_id,
                    'verification_result': verification_result
                })
            else:
                transaction['status'] = 'failed'
                return jsonify({
                    'success': False,
                    'status': 'failed',
                    'transaction_id': transaction_id,
                    'verification_result': verification_result
                })
        else:
            transaction['status'] = 'pending'
            return jsonify({
                'success': False,
                'status': 'pending',
                'transaction_id': transaction_id,
                'message': 'Payment still pending'
            })
            
    except Exception as e:
        print(f"Error verifying payment: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Payment verification failed: {str(e)}'
        }), 500

@app.route('/api/payment/status/<order_id>', methods=['GET'])
def get_payment_status(order_id):
    """Get payment status by order ID"""
    try:
        if order_id not in payment_transactions:
            return jsonify({
                'success': False,
                'error': 'Order not found'
            }), 404
        
        transaction = payment_transactions[order_id]
        
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
        print(f"Error getting payment status: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to get payment status: {str(e)}'
        }), 500

@app.route('/api/payment/transactions', methods=['GET'])
def get_all_transactions():
    """Get all payment transactions (for admin/debugging)"""
    try:
        # Filter out duplicate entries (we store by both transaction_id and order_id)
        unique_transactions = {}
        for key, transaction in payment_transactions.items():
            if 'transaction_id' in transaction:
                unique_transactions[transaction['transaction_id']] = transaction
        
        return jsonify({
            'success': True,
            'transactions': list(unique_transactions.values()),
            'count': len(unique_transactions)
        })
        
    except Exception as e:
        print(f"Error getting transactions: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Failed to get transactions: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("Starting MTN MOMO Payment Server...")
    print("Server will run on http://localhost:5000")
    print("Health check: http://localhost:5000/api/health")
    print("Press Ctrl+C to stop the server")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
