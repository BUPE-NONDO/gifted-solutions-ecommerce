#!/usr/bin/env python3
"""
Simple test for AI chatbot server
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'AI Chatbot Server is running',
        'timestamp': datetime.datetime.now().isoformat(),
        'environment': 'test'
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Simple chat endpoint for testing"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Simple response logic
        if 'hello' in user_message.lower() or 'hi' in user_message.lower():
            response = "Hello! I'm the AI chatbot for Gifted Solutions. How can I help you today?"
        elif 'product' in user_message.lower():
            response = "🛍️ We offer a wide range of products including electronics, project consultation, custom solutions, and premium gifts. Browse our shop to find what you're looking for!"
        elif 'contact' in user_message.lower():
            response = "📞 You can contact us at 0779421717 or through WhatsApp. We're here to help!"
        else:
            response = "Thank you for your message! I'm still learning. For immediate assistance, please contact our support team at 0779421717."
        
        return jsonify({
            'response': response,
            'confidence': 0.8,
            'type': 'ai_test',
            'timestamp': datetime.datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🤖 Starting Test AI Chatbot Server...")
    print("🔗 Server will be available at: http://localhost:5001")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
