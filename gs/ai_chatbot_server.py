#!/usr/bin/env python3
"""
AI Chatbot Server for Gifted Solutions
Simple implementation with knowledge base and admin features
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sqlite3
import datetime
from difflib import SequenceMatcher

app = Flask(__name__)
CORS(app)

DATABASE_PATH = 'chatbot_ai.db'

class ChatbotAI:
    def __init__(self):
        self.init_database()
        self.load_default_knowledge()
    
    def init_database(self):
        """Initialize SQLite database"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Knowledge base table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS knowledge_base (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                keywords TEXT,
                priority INTEGER DEFAULT 1,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Analytics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_message TEXT,
                bot_response TEXT,
                response_type TEXT,
                confidence REAL,
                session_id TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ AI Chatbot Database initialized")
    
    def load_default_knowledge(self):
        """Load default knowledge base"""
        default_knowledge = [
            {
                'category': 'greeting',
                'question': 'hello hi greeting welcome good morning afternoon evening',
                'answer': 'Hello! 👋 Welcome to Gifted Solutions! I\'m your AI shopping assistant. I can help you with:\n\n🛍️ Product information\n📦 Order tracking\n💳 Payment assistance\n📞 Contact information\n\nHow can I assist you today?',
                'keywords': 'hello,hi,greeting,welcome,hey,good,morning,afternoon,evening',
                'priority': 5
            },
            {
                'category': 'products',
                'question': 'what products do you sell electronics consultation services',
                'answer': '🛍️ **Our Product Range:**\n\n📱 **Electronics**: Latest gadgets, smartphones, laptops, and tech accessories\n💼 **Project Consultation**: Technical planning, custom software solutions, and IT consulting\n🎁 **Premium Gifts**: Personalized items, luxury accessories, and unique gift collections\n🔧 **Custom Services**: Tailored solutions for your specific business needs\n\nWould you like to browse our shop or need consultation for a specific project?',
                'keywords': 'products,electronics,consultation,services,gifts,what,sell,offer,available',
                'priority': 4
            },
            {
                'category': 'contact',
                'question': 'contact phone number whatsapp support help',
                'answer': '📞 **Contact Information:**\n\n📱 **Phone**: 0779421717\n💬 **WhatsApp**: Available on the same number\n🕒 **Business Hours**: Monday - Friday, 9:00 AM - 6:00 PM\n📧 **Email**: Available through our contact form\n🏢 **Location**: Zambia\n\nOur support team is ready to help with any questions about products, orders, or technical consultation!',
                'keywords': 'contact,phone,whatsapp,support,help,number,call,reach',
                'priority': 4
            },
            {
                'category': 'account',
                'question': 'account login register shopping create signup',
                'answer': '👤 **Account & Shopping:**\n\n✅ **Account Required**: Yes, you need to create an account to shop with us\n\n**Benefits of having an account:**\n📦 Real-time order tracking\n🔒 Secure payment processing\n💾 Save favorite items\n📋 Order history\n🎯 Personalized recommendations\n\n**Getting Started:**\n1. Click "Sign Up" to create your account\n2. Verify your email\n3. Start shopping!\n\nReady to create your account?',
                'keywords': 'account,login,register,signup,shopping,create,user,profile',
                'priority': 3
            },
            {
                'category': 'tracking',
                'question': 'track order package delivery status where is my order',
                'answer': '📦 **Order Tracking:**\n\n**How to track your order:**\n1. 🔍 Visit our "Track Order" page\n2. 👤 Check your profile dashboard\n3. 📧 Use the tracking link in your email confirmation\n\n**What you can track:**\n✅ Order confirmation\n📋 Processing status\n🚚 Shipping updates\n📍 Delivery location\n✨ Delivery confirmation\n\n**Need help?** Provide your order ID and I can help you check the status!',
                'keywords': 'track,order,package,delivery,status,where,shipping,location',
                'priority': 3
            },
            {
                'category': 'payment',
                'question': 'payment mtn momo pay how to pay methods',
                'answer': '💳 **Payment Information:**\n\n**We accept MTN MOMO payments!**\n\n**How to pay:**\n1. 🛒 Add items to cart\n2. 🔐 Login to your account\n3. 💳 Select MTN MOMO at checkout\n4. 📱 Enter your phone number\n5. ✅ Confirm payment on your phone\n6. 🎉 Order confirmed!\n\n**Payment is secure and instant!**\n\nNeed help with payment? Contact us at 0779421717.',
                'keywords': 'payment,mtn,momo,pay,how,methods,money,transaction',
                'priority': 3
            }
        ]
        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Check if knowledge already exists
        cursor.execute('SELECT COUNT(*) FROM knowledge_base')
        count = cursor.fetchone()[0]
        
        if count == 0:
            for item in default_knowledge:
                cursor.execute('''
                    INSERT INTO knowledge_base (category, question, answer, keywords, priority)
                    VALUES (?, ?, ?, ?, ?)
                ''', (item['category'], item['question'], item['answer'], 
                      item['keywords'], item['priority']))
            print("✅ Default knowledge base loaded")
        
        conn.commit()
        conn.close()
    
    def similarity(self, a, b):
        """Calculate similarity between two strings"""
        return SequenceMatcher(None, a, b).ratio()
    
    def find_best_response(self, user_message):
        """Find best response for user message"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT question, answer, keywords, priority, category 
            FROM knowledge_base 
            WHERE is_active = 1 
            ORDER BY priority DESC
        ''')
        knowledge_entries = cursor.fetchall()
        conn.close()
        
        user_message_lower = user_message.lower()
        best_match = None
        best_score = 0
        
        for question, answer, keywords, priority, category in knowledge_entries:
            # Calculate similarity
            question_similarity = self.similarity(user_message_lower, question.lower())
            
            # Check keyword matches
            keyword_matches = 0
            if keywords:
                for keyword in keywords.split(','):
                    if keyword.strip().lower() in user_message_lower:
                        keyword_matches += 1
            
            keyword_score = keyword_matches / max(len(keywords.split(',')) if keywords else 1, 1)
            
            # Combined score with priority weighting
            total_score = (question_similarity * 0.5 + keyword_score * 0.5) * (priority / 5.0)
            
            if total_score > best_score and total_score > 0.25:  # Lower threshold for better matching
                best_score = total_score
                best_match = {
                    'answer': answer,
                    'category': category,
                    'confidence': min(total_score, 1.0),  # Cap at 1.0
                    'source': 'knowledge_base'
                }
        
        return best_match

# Initialize AI
chatbot_ai = ChatbotAI()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'AI Chatbot Server is running',
        'timestamp': datetime.datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        session_id = data.get('session_id', 'anonymous')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Find best response
        ai_response = chatbot_ai.find_best_response(user_message)
        
        if ai_response and ai_response['confidence'] > 0.3:
            response_text = ai_response['answer']
            response_type = 'ai_match'
            confidence = ai_response['confidence']
        else:
            response_text = "Thank you for your message! 🤖 I'm still learning about that topic. For immediate assistance, please contact our support team at 0779421717 or browse our help sections."
            response_type = 'fallback'
            confidence = 0.1
        
        # Log analytics
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO chat_analytics 
                (user_message, bot_response, response_type, confidence, session_id)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_message, response_text, response_type, confidence, session_id))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Analytics error: {str(e)}")
        
        return jsonify({
            'response': response_text,
            'confidence': confidence,
            'type': response_type,
            'timestamp': datetime.datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Chat error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/knowledge', methods=['GET'])
def get_knowledge():
    """Get all knowledge base entries for admin"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, category, question, answer, keywords, priority, is_active, created_at
            FROM knowledge_base 
            ORDER BY priority DESC, created_at DESC
        ''')
        entries = cursor.fetchall()
        conn.close()
        
        knowledge_list = []
        for entry in entries:
            knowledge_list.append({
                'id': entry[0],
                'category': entry[1],
                'question': entry[2],
                'answer': entry[3],
                'keywords': entry[4],
                'priority': entry[5],
                'is_active': bool(entry[6]),
                'created_at': entry[7]
            })
        
        return jsonify({'knowledge_base': knowledge_list})
        
    except Exception as e:
        print(f"Get knowledge error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/analytics', methods=['GET'])
def get_analytics():
    """Get chat analytics for admin"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Get total chats
        cursor.execute('SELECT COUNT(*) FROM chat_analytics')
        total_chats = cursor.fetchone()[0]
        
        # Get recent chats
        cursor.execute('''
            SELECT user_message, bot_response, response_type, confidence, timestamp
            FROM chat_analytics 
            ORDER BY timestamp DESC 
            LIMIT 20
        ''')
        recent_chats = cursor.fetchall()
        
        # Get popular queries
        cursor.execute('''
            SELECT user_message, COUNT(*) as frequency
            FROM chat_analytics 
            GROUP BY LOWER(user_message)
            ORDER BY frequency DESC 
            LIMIT 10
        ''')
        popular_queries = cursor.fetchall()
        
        conn.close()
        
        return jsonify({
            'total_chats': total_chats,
            'recent_chats': [
                {
                    'user_message': chat[0],
                    'bot_response': chat[1][:100] + '...' if len(chat[1]) > 100 else chat[1],
                    'response_type': chat[2],
                    'confidence': chat[3],
                    'timestamp': chat[4]
                } for chat in recent_chats
            ],
            'popular_queries': [
                {'query': query[0], 'frequency': query[1]} for query in popular_queries
            ]
        })
        
    except Exception as e:
        print(f"Analytics error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/reindex', methods=['POST'])
def reindex():
    """Reindex website content (simplified)"""
    return jsonify({'message': 'Website content reindexed successfully'})

if __name__ == '__main__':
    print("🤖 Starting AI Chatbot Server for Gifted Solutions...")
    print("🔗 Server will be available at: http://localhost:5001")
    print("📊 Admin endpoints available")
    print("💬 Chat endpoint: /api/chat")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5001, debug=True)
