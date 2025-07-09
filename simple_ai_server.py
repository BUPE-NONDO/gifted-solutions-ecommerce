#!/usr/bin/env python3
"""
Simple AI Chatbot Server for Gifted Solutions
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import datetime
from difflib import SequenceMatcher

app = Flask(__name__)
CORS(app)

DATABASE_PATH = 'simple_chatbot.db'

class SimpleChatbotAI:
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
                session_id TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        print("✅ Database initialized successfully")
    
    def load_default_knowledge(self):
        """Load default knowledge base"""
        default_knowledge = [
            {
                'category': 'greeting',
                'question': 'hello hi greeting welcome',
                'answer': 'Hello! Welcome to Gifted Solutions! 👋 I\'m here to help you with your shopping needs. How can I assist you today?',
                'keywords': 'hello,hi,greeting,welcome,hey',
                'priority': 5
            },
            {
                'category': 'products',
                'question': 'what products do you sell electronics consultation',
                'answer': '🛍️ We offer:\n\n📱 **Electronics**: Latest gadgets and tech accessories\n💼 **Project Consultation**: Technical planning and custom solutions\n🎁 **Premium Gifts**: Personalized and unique gift items\n🔧 **Custom Services**: Tailored solutions for your needs',
                'keywords': 'products,electronics,consultation,services,gifts',
                'priority': 4
            },
            {
                'category': 'contact',
                'question': 'contact phone number whatsapp support',
                'answer': '📞 **Contact Information:**\n\n📱 Phone: 0779421717\n💬 WhatsApp: Available\n🕒 Business Hours: 9 AM - 6 PM\n📧 We\'re here to help with any questions!',
                'keywords': 'contact,phone,whatsapp,support,help',
                'priority': 4
            },
            {
                'category': 'account',
                'question': 'account login register shopping',
                'answer': '👤 **Account Information:**\n\nTo shop with us, you need to create an account first. This helps us:\n✅ Track your orders\n✅ Provide better service\n✅ Keep your information secure\n\nClick "Sign Up" to get started!',
                'keywords': 'account,login,register,signup,shopping',
                'priority': 3
            },
            {
                'category': 'tracking',
                'question': 'track order package delivery status',
                'answer': '📦 **Order Tracking:**\n\nOnce you place an order, you can track it through:\n🔍 Track Order page\n👤 Your profile dashboard\n📧 Email notifications\n\nNeed your order ID? Check your email confirmation!',
                'keywords': 'track,order,package,delivery,status',
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
        
        conn.commit()
        conn.close()
        print("✅ Default knowledge loaded")
    
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
            
            # Combined score
            total_score = (question_similarity * 0.6 + keyword_score * 0.4) * (priority / 5.0)
            
            if total_score > best_score and total_score > 0.3:
                best_score = total_score
                best_match = {
                    'answer': answer,
                    'category': category,
                    'confidence': total_score,
                    'source': 'knowledge_base'
                }
        
        return best_match

# Initialize AI
chatbot_ai = SimpleChatbotAI()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Simple AI Chatbot Server is running',
        'timestamp': datetime.datetime.now().isoformat()
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
        
        if ai_response:
            response_text = ai_response['answer']
            response_type = 'ai_match'
            confidence = ai_response['confidence']
        else:
            response_text = "Thank you for your message! I'm still learning. For immediate assistance, please contact our support team at 0779421717."
            response_type = 'fallback'
            confidence = 0.1
        
        # Log analytics
        try:
            conn = sqlite3.connect(DATABASE_PATH)
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO chat_analytics 
                (user_message, bot_response, response_type, session_id)
                VALUES (?, ?, ?, ?)
            ''', (user_message, response_text, response_type, session_id))
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
    """Get all knowledge base entries"""
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
    """Get chat analytics"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Get total chats
        cursor.execute('SELECT COUNT(*) FROM chat_analytics')
        total_chats = cursor.fetchone()[0]
        
        # Get recent chats
        cursor.execute('''
            SELECT user_message, bot_response, response_type, timestamp
            FROM chat_analytics 
            ORDER BY timestamp DESC 
            LIMIT 10
        ''')
        recent_chats = cursor.fetchall()
        
        conn.close()
        
        return jsonify({
            'total_chats': total_chats,
            'recent_chats': [
                {
                    'user_message': chat[0],
                    'bot_response': chat[1],
                    'response_type': chat[2],
                    'timestamp': chat[3]
                } for chat in recent_chats
            ]
        })
        
    except Exception as e:
        print(f"Analytics error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🤖 Starting Simple AI Chatbot Server...")
    print("🔗 Server will be available at: http://localhost:5001")
    print("📊 Admin endpoints: /api/admin/knowledge, /api/admin/analytics")
    print("💬 Chat endpoint: /api/chat")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
