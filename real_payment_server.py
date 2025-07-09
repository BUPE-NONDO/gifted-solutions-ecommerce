#!/usr/bin/env python3
"""
Real MTN MOMO Payment Server
Integrates with the actual MTN MOMO API using the Python SDK
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import json
import uuid
from datetime import datetime
import traceback

# Add current directory to Python path to import pay module
sys.path.append(os.path.dirname(__file__))

try:
    from pay import PayClass
    print("✅ Successfully imported PayClass from pay.py")
except ImportError as e:
    print(f"❌ Failed to import PayClass: {e}")
    print("Make sure pay.py is in the same directory")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

# In-memory storage for payment transactions
payment_transactions = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Real MTN MOMO Payment Server is running',
        'timestamp': datetime.now().isoformat(),
        'environment': PayClass.environment_mode,
        'api_url': PayClass.accurl
    })

@app.route('/api/payment/initiate', methods=['POST'])
def initiate_payment():
    """Initiate a new MTN MOMO payment"""
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
        
        # Extract and validate data
        amount = float(data['amount'])
        phone_number = str(data['phone_number']).strip()
        order_id = str(data['order_id'])
        customer_name = str(data['customer_name'])
        currency = data.get('currency', 'EUR')  # Default to EUR for sandbox
        
        # Create payer message
        payer_message = f'Payment for order {order_id} by {customer_name}'
        
        # Generate unique transaction ID
        transaction_id = str(uuid.uuid4())
        
        print(f'🚀 Initiating MTN MOMO payment:')
        print(f'   Amount: {amount} {currency}')
        print(f'   Phone: {phone_number}')
        print(f'   Order ID: {order_id}')
        print(f'   Customer: {customer_name}')
        print(f'   Transaction ID: {transaction_id}')
        
        # Call MTN MOMO API
        payment_result = PayClass.momopay(
            amount=amount,
            currency=currency,
            txt_ref=transaction_id,  # Use transaction_id as reference
            phone_number=phone_number,
            payermessage=payer_message
        )
        
        print(f'📱 MTN MOMO API Response: {payment_result}')
        
        # Store transaction details
        transaction_data = {
            'transaction_id': transaction_id,
            'order_id': order_id,
            'amount': amount,
            'currency': currency,
            'phone_number': phone_number,
            'customer_name': customer_name,
            'customer_email': data.get('customer_email', ''),
            'payer_message': payer_message,
            'payment_result': payment_result,
            'status': 'initiated',
            'created_at': datetime.now().isoformat(),
            'last_verified': None
        }
        
        # Store by both transaction_id and order_id for easy lookup
        payment_transactions[transaction_id] = transaction_data
        payment_transactions[order_id] = transaction_data
        
        # Check if payment initiation was successful
        if payment_result and isinstance(payment_result, dict):
            if payment_result.get('response') == 202:  # MTN MOMO success response code
                return jsonify({
                    'success': True,
                    'transaction_id': transaction_id,
                    'order_id': order_id,
                    'message': 'Payment initiated successfully. Check your phone for MTN MOMO prompt.',
                    'payment_result': payment_result,
                    'reference_id': payment_result.get('ref', transaction_id)
                })
            else:
                error_msg = f"MTN MOMO API returned status code: {payment_result.get('response', 'unknown')}"
                return jsonify({
                    'success': False,
                    'error': error_msg,
                    'details': payment_result
                }), 400
        else:
            return jsonify({
                'success': False,
                'error': 'Invalid response from MTN MOMO API',
                'details': payment_result
            }), 500
            
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': f'Invalid data format: {str(e)}'
        }), 400
    except Exception as e:
        print(f'❌ Payment initiation error: {str(e)}')
        print(f'❌ Traceback: {traceback.format_exc()}')
        return jsonify({
            'success': False,
            'error': f'Payment initiation failed: {str(e)}'
        }), 500

@app.route('/api/payment/verify/<transaction_id>', methods=['GET'])
def verify_payment(transaction_id):
    """Verify the status of a payment transaction"""
    try:
        # Check if transaction exists
        if transaction_id not in payment_transactions:
            return jsonify({
                'success': False,
                'error': 'Transaction not found'
            }), 404
        
        transaction = payment_transactions[transaction_id]
        
        # Get the reference ID from the original payment result
        reference_id = transaction['payment_result'].get('ref', transaction_id)
        
        print(f'🔍 Verifying payment for transaction: {transaction_id}')
        print(f'🔍 Using reference ID: {reference_id}')
        
        # Call MTN MOMO verification API
        verification_result = PayClass.verifymomo(reference_id)
        
        print(f'📋 Verification result: {verification_result}')
        
        # Update transaction with verification result
        transaction['verification_result'] = verification_result
        transaction['last_verified'] = datetime.now().isoformat()
        
        # Parse verification result
        if verification_result and isinstance(verification_result, dict):
            status = verification_result.get('status', '').upper()
            
            if status == 'SUCCESSFUL':
                transaction['status'] = 'completed'
                return jsonify({
                    'success': True,
                    'status': 'completed',
                    'transaction_id': transaction_id,
                    'message': 'Payment completed successfully!',
                    'verification_result': verification_result
                })
            elif status == 'FAILED':
                transaction['status'] = 'failed'
                return jsonify({
                    'success': False,
                    'status': 'failed',
                    'transaction_id': transaction_id,
                    'message': 'Payment failed',
                    'verification_result': verification_result
                })
            elif status == 'PENDING':
                transaction['status'] = 'pending'
                return jsonify({
                    'success': False,
                    'status': 'pending',
                    'transaction_id': transaction_id,
                    'message': 'Payment is still pending. Please complete the transaction on your phone.',
                    'verification_result': verification_result
                })
            else:
                # Unknown status, treat as pending
                transaction['status'] = 'pending'
                return jsonify({
                    'success': False,
                    'status': 'pending',
                    'transaction_id': transaction_id,
                    'message': f'Payment status: {status}. Please check your phone.',
                    'verification_result': verification_result
                })
        else:
            # No valid verification result, treat as pending
            transaction['status'] = 'pending'
            return jsonify({
                'success': False,
                'status': 'pending',
                'transaction_id': transaction_id,
                'message': 'Unable to verify payment status. Please try again.',
                'verification_result': verification_result
            })
            
    except Exception as e:
        print(f'❌ Payment verification error: {str(e)}')
        print(f'❌ Traceback: {traceback.format_exc()}')
        return jsonify({
            'success': False,
            'error': f'Payment verification failed: {str(e)}'
        }), 500

@app.route('/api/payment/status/<transaction_id>', methods=['GET'])
def get_payment_status(transaction_id):
    """Get the current status of a payment transaction"""
    if transaction_id not in payment_transactions:
        return jsonify({
            'success': False,
            'error': 'Transaction not found'
        }), 404
    
    transaction = payment_transactions[transaction_id]
    return jsonify({
        'success': True,
        'transaction': {
            'transaction_id': transaction['transaction_id'],
            'order_id': transaction['order_id'],
            'amount': transaction['amount'],
            'currency': transaction['currency'],
            'status': transaction['status'],
            'created_at': transaction['created_at'],
            'last_verified': transaction['last_verified']
        }
    })

@app.route('/api/transactions', methods=['GET'])
def list_transactions():
    """List all payment transactions (for debugging)"""
    transactions = []
    seen_ids = set()
    
    for tid, transaction in payment_transactions.items():
        if tid not in seen_ids:
            transactions.append({
                'transaction_id': transaction['transaction_id'],
                'order_id': transaction['order_id'],
                'amount': transaction['amount'],
                'currency': transaction['currency'],
                'status': transaction['status'],
                'created_at': transaction['created_at']
            })
            seen_ids.add(transaction['transaction_id'])
    
    return jsonify({
        'success': True,
        'transactions': transactions,
        'total': len(transactions)
    })

if __name__ == '__main__':
    print('🚀 Starting Real MTN MOMO Payment Server')
    print(f'🌍 Environment: {PayClass.environment_mode}')
    print(f'🔗 API URL: {PayClass.accurl}')
    print(f'🔑 Collections Subscription Key: {PayClass.collections_subkey[:8]}...')
    print('📡 Server will run on http://localhost:5000')
    print('🔄 CORS enabled for React frontend')
    print('=' * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
