"""
Demo Payment Server for Testing
Simulates MTN MOMO payments without making real API calls
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
from datetime import datetime
import time

app = Flask(__name__)
CORS(app)

# Store transactions in memory for demo
payment_transactions = {}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Demo MTN MOMO Payment Server is running',
        'timestamp': datetime.now().isoformat(),
        'environment': 'demo',
        'api_url': 'demo-server'
    })

@app.route('/api/payment/initiate', methods=['POST'])
def initiate_payment():
    """Initiate a demo payment"""
    try:
        # Get JSON data with error handling
        try:
            data = request.get_json(force=True)
            if not data:
                return jsonify({
                    'success': False,
                    'error': 'No JSON data provided'
                }), 400
        except Exception as json_error:
            return jsonify({
                'success': False,
                'error': f'Invalid JSON: {str(json_error)}'
            }), 400

        # Validate required fields
        required_fields = ['amount', 'phone_number', 'order_id', 'customer_name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Extract data
        amount = float(data['amount'])
        phone_number = str(data['phone_number']).strip()
        order_id = str(data['order_id'])
        customer_name = str(data['customer_name'])
        currency = data.get('currency', 'EUR')
        
        # Generate transaction ID
        transaction_id = str(uuid.uuid4())
        
        print(f'🚀 Demo Payment Initiated:')
        print(f'   Amount: {amount} {currency}')
        print(f'   Phone: {phone_number}')
        print(f'   Order ID: {order_id}')
        print(f'   Customer: {customer_name}')
        print(f'   Transaction ID: {transaction_id}')
        
        # Store transaction
        transaction_data = {
            'transaction_id': transaction_id,
            'order_id': order_id,
            'amount': amount,
            'currency': currency,
            'phone_number': phone_number,
            'customer_name': customer_name,
            'customer_email': data.get('customer_email', ''),
            'status': 'initiated',
            'created_at': datetime.now().isoformat(),
            'demo': True
        }
        
        payment_transactions[transaction_id] = transaction_data
        payment_transactions[order_id] = transaction_data
        
        # Simulate successful initiation
        return jsonify({
            'success': True,
            'transaction_id': transaction_id,
            'order_id': order_id,
            'message': 'Demo payment initiated successfully. Will auto-complete in 10 seconds.',
            'payment_result': {
                'success': True,
                'ref': transaction_id,
                'demo': True
            }
        })
        
    except Exception as e:
        print(f'❌ Demo payment error: {str(e)}')
        return jsonify({
            'success': False, 
            'error': f'Demo payment failed: {str(e)}'
        }), 500

@app.route('/api/payment/verify/<transaction_id>', methods=['GET'])
def verify_payment(transaction_id):
    """Verify a demo payment"""
    try:
        if transaction_id not in payment_transactions:
            return jsonify({
                'success': False, 
                'error': 'Transaction not found'
            }), 404
        
        transaction = payment_transactions[transaction_id]
        
        # Calculate time since creation
        created_time = datetime.fromisoformat(transaction['created_at'])
        current_time = datetime.now()
        time_diff = (current_time - created_time).total_seconds()
        
        print(f'🔍 Verifying demo payment: {transaction_id}')
        print(f'   Time elapsed: {time_diff:.1f} seconds')
        
        # Auto-complete after 10 seconds for demo
        if time_diff > 10:
            transaction['status'] = 'completed'
            transaction['completed_at'] = current_time.isoformat()
            
            return jsonify({
                'success': True,
                'status': 'completed',
                'transaction_id': transaction_id,
                'message': 'Demo payment completed successfully!',
                'verification_result': {
                    'status': 'SUCCESSFUL',
                    'demo': True,
                    'completed_at': transaction['completed_at']
                }
            })
        else:
            # Still pending
            remaining_time = 10 - time_diff
            return jsonify({
                'success': False,
                'status': 'pending',
                'transaction_id': transaction_id,
                'message': f'Demo payment pending. Will complete in {remaining_time:.1f} seconds.',
                'verification_result': {
                    'status': 'PENDING',
                    'demo': True,
                    'remaining_seconds': remaining_time
                }
            })
            
    except Exception as e:
        print(f'❌ Demo verification error: {str(e)}')
        return jsonify({
            'success': False, 
            'error': f'Demo verification failed: {str(e)}'
        }), 500

@app.route('/api/transactions', methods=['GET'])
def list_transactions():
    """List all demo transactions"""
    return jsonify({
        'transactions': list(payment_transactions.values()),
        'count': len(payment_transactions)
    })

if __name__ == '__main__':
    print('🚀 Starting Demo MTN MOMO Payment Server')
    print('🌍 Environment: demo (no real payments)')
    print('📡 Server will run on http://localhost:5000')
    print('🔄 CORS enabled for React frontend')
    print('⏱️  Demo payments auto-complete after 10 seconds')
    print('=' * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
