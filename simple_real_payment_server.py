#!/usr/bin/env python3
"""
Simple Real MTN MOMO Payment Server
Uses the MTN MOMO API directly without importing the full PayClass
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import uuid
from datetime import datetime
import traceback
import base64

app = Flask(__name__)
CORS(app)

# MTN MOMO Configuration
class MTNMomoConfig:
    # Collections Subscription Key
    collections_subkey = "dd541a46608d4c04840f45709d89a3b1"
    
    # Environment mode
    environment_mode = "sandbox"
    accurl = "https://sandbox.momodeveloper.mtn.com"
    
    # Generate API user for sandbox
    collections_apiuser = str(uuid.uuid4())

# In-memory storage for payment transactions
payment_transactions = {}

def get_momo_token():
    """Get MTN MOMO access token"""
    try:
        url = f"{MTNMomoConfig.accurl}/collection/token/"
        
        # Create basic auth
        auth_string = f"{MTNMomoConfig.collections_apiuser}:"
        encoded_auth = base64.b64encode(auth_string.encode()).decode()
        
        headers = {
            'Ocp-Apim-Subscription-Key': MTNMomoConfig.collections_subkey,
            'Authorization': f'Basic {encoded_auth}',
        }
        
        response = requests.post(url, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Token request failed: {response.status_code} - {response.text}")
            return None
            
    except Exception as e:
        print(f"Error getting token: {e}")
        return None

def initiate_momo_payment(amount, currency, txt_ref, phone_number, payer_message):
    """Initiate MTN MOMO payment"""
    try:
        # Get access token
        token_response = get_momo_token()
        if not token_response or 'access_token' not in token_response:
            return {'success': False, 'error': 'Failed to get access token'}
        
        access_token = token_response['access_token']
        
        # Generate UUID for the request
        reference_id = str(uuid.uuid4())
        
        url = f"{MTNMomoConfig.accurl}/collection/v1_0/requesttopay"
        
        payload = {
            "amount": str(amount),
            "currency": currency,
            "externalId": txt_ref,
            "payer": {
                "partyIdType": "MSISDN",
                "partyId": phone_number
            },
            "payerMessage": payer_message,
            "payeeNote": payer_message
        }
        
        headers = {
            'X-Reference-Id': reference_id,
            'X-Target-Environment': MTNMomoConfig.environment_mode,
            'Ocp-Apim-Subscription-Key': MTNMomoConfig.collections_subkey,
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {access_token}'
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        return {
            'success': response.status_code == 202,
            'response': response.status_code,
            'ref': reference_id,
            'status_text': response.text if response.status_code != 202 else 'Payment initiated'
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def verify_momo_payment(reference_id):
    """Verify MTN MOMO payment status"""
    try:
        # Get access token
        token_response = get_momo_token()
        if not token_response or 'access_token' not in token_response:
            return {'success': False, 'error': 'Failed to get access token'}
        
        access_token = token_response['access_token']
        
        url = f"{MTNMomoConfig.accurl}/collection/v1_0/requesttopay/{reference_id}"
        
        headers = {
            'Ocp-Apim-Subscription-Key': MTNMomoConfig.collections_subkey,
            'Authorization': f'Bearer {access_token}',
            'X-Target-Environment': MTNMomoConfig.environment_mode,
        }
        
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            return {'success': False, 'error': f'Verification failed: {response.status_code}'}
            
    except Exception as e:
        return {'success': False, 'error': str(e)}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Simple Real MTN MOMO Payment Server is running',
        'timestamp': datetime.now().isoformat(),
        'environment': MTNMomoConfig.environment_mode,
        'api_url': MTNMomoConfig.accurl
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
        payment_result = initiate_momo_payment(
            amount=amount,
            currency=currency,
            txt_ref=transaction_id,
            phone_number=phone_number,
            payer_message=payer_message
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
        if payment_result.get('success'):
            return jsonify({
                'success': True,
                'transaction_id': transaction_id,
                'order_id': order_id,
                'message': 'Payment initiated successfully. Check your phone for MTN MOMO prompt.',
                'payment_result': payment_result,
                'reference_id': payment_result.get('ref', transaction_id)
            })
        else:
            return jsonify({
                'success': False,
                'error': payment_result.get('error', 'Failed to initiate payment'),
                'details': payment_result
            }), 400
            
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
        verification_result = verify_momo_payment(reference_id)
        
        print(f'📋 Verification result: {verification_result}')
        
        # Update transaction with verification result
        transaction['verification_result'] = verification_result
        transaction['last_verified'] = datetime.now().isoformat()
        
        # Parse verification result
        if verification_result and not verification_result.get('error'):
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
            # Error in verification or no valid result
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

if __name__ == '__main__':
    print('🚀 Starting Simple Real MTN MOMO Payment Server')
    print(f'🌍 Environment: {MTNMomoConfig.environment_mode}')
    print(f'🔗 API URL: {MTNMomoConfig.accurl}')
    print(f'🔑 Collections Subscription Key: {MTNMomoConfig.collections_subkey[:8]}...')
    print(f'👤 API User: {MTNMomoConfig.collections_apiuser}')
    print('📡 Server will run on http://localhost:5000')
    print('🔄 CORS enabled for React frontend')
    print('=' * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
