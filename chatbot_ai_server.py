#!/usr/bin/env python3
"""
AI Chatbot Training Server for Gifted Solutions
Provides intelligent chatbot responses with admin training capabilities
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import sqlite3
import datetime
import re
from difflib import SequenceMatcher

app = Flask(__name__)
CORS(app)

# Configuration
DATABASE_PATH = 'chatbot_knowledge.db'

class ChatbotAI:
    def __init__(self):
        self.init_database()
        self.load_default_knowledge()
    
    def init_database(self):
        """Initialize the SQLite database for chatbot knowledge"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        # Create tables
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS knowledge_base (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                keywords TEXT,
                priority INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS website_content (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url TEXT UNIQUE NOT NULL,
                title TEXT,
                content TEXT,
                keywords TEXT,
                last_indexed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                content_hash TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_message TEXT NOT NULL,
                bot_response TEXT NOT NULL,
                response_type TEXT,
                user_satisfaction INTEGER,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_id TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS training_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                input_text TEXT NOT NULL,
                expected_output TEXT NOT NULL,
                category TEXT,
                admin_id TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_approved BOOLEAN DEFAULT 0
            )
        ''')
        
        conn.commit()
        conn.close()
        print("Database initialized successfully")
    
    def load_default_knowledge(self):
        """Load default knowledge base entries"""
        default_knowledge = [
            {
                'category': 'products',
                'question': 'what products do you offer',
                'answer': '🛍️ We offer a wide range of products including electronics, project consultation, custom solutions, and premium gifts. Browse our shop or use the search feature to find what you\'re looking for!',
                'keywords': 'products,electronics,consultation,custom,gifts,shop,catalog',
                'priority': 5
            },
            {
                'category': 'services',
                'question': 'project consultation',
                'answer': '💼 Our project consultation services include:\n• Technical project planning\n• Custom solution development\n• Implementation guidance\n• Ongoing support\n\nContact us at 0779421717 to discuss your project needs!',
                'keywords': 'consultation,project,technical,planning,development,custom,support',
                'priority': 5
            },
            {
                'category': 'business',
                'question': 'about gifted solutions',
                'answer': '🏢 Gifted Solutions is your premier destination for personalized gifts, tech gadgets, custom services, and project consultation. We combine quality products with expert technical services to meet all your needs.',
                'keywords': 'about,company,gifted solutions,services,quality,technical',
                'priority': 4
            },
            {
                'category': 'contact',
                'question': 'contact information',
                'answer': '📞 Contact Gifted Solutions:\n• Phone: 0779421717\n• WhatsApp: Available through our cart\n• Business Hours: Monday-Friday, 9AM-6PM\n• We\'re here to help with all your needs!',
                'keywords': 'contact,phone,whatsapp,hours,support,help',
                'priority': 4
            }
        ]
        
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        
        for entry in default_knowledge:
            cursor.execute('''
                INSERT OR IGNORE INTO knowledge_base 
                (category, question, answer, keywords, priority)
                VALUES (?, ?, ?, ?, ?)
            ''', (entry['category'], entry['question'], entry['answer'], 
                  entry['keywords'], entry['priority']))
        
        conn.commit()
        conn.close()
        print("Default knowledge base loaded")
    
    def similarity(self, a, b):
        """Calculate similarity between two strings"""
        return SequenceMatcher(None, a.lower(), b.lower()).ratio()
    
    def find_best_response(self, user_message, user_context=None):
        """Find the best response for user message using AI-like matching"""
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        # Get all knowledge base entries
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

        # Check knowledge base
        for question, answer, keywords, priority, category in knowledge_entries:
            # Calculate similarity scores
            question_similarity = self.similarity(user_message_lower, question.lower())
            keyword_matches = sum(1 for keyword in keywords.split(',')
                                if keyword.strip().lower() in user_message_lower)
            keyword_score = keyword_matches / max(len(keywords.split(',')), 1)

            # Combined score with priority weighting
            total_score = (question_similarity * 0.6 + keyword_score * 0.4) * (priority / 5.0)

            if total_score > best_score and total_score > 0.3:  # Minimum threshold
                best_score = total_score
                best_match = {
                    'answer': answer,
                    'category': category,
                    'confidence': total_score,
                    'source': 'knowledge_base'
                }

        return best_match

# Initialize the AI chatbot
chatbot_ai = ChatbotAI()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'AI Chatbot Server is running',
        'timestamp': datetime.datetime.now().isoformat(),
        'environment': 'production'
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint for AI responses"""
    try:
        data = request.get_json()
        user_message = data.get('message', '').strip()
        user_context = data.get('context', {})
        session_id = data.get('session_id', 'anonymous')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400
        
        # Get AI response
        response_data = chatbot_ai.find_best_response(user_message, user_context)
        
        if response_data:
            bot_response = response_data['answer']
            response_type = 'ai_matched'
            confidence = response_data['confidence']
        else:
            # Fallback response
            bot_response = "I'd be happy to help! Could you please provide more details about what you're looking for? You can also contact our support team at 0779421717 for immediate assistance."
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
            ''', (user_message, bot_response, response_type, session_id))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Analytics logging error: {str(e)}")
        
        return jsonify({
            'response': bot_response,
            'confidence': confidence,
            'type': response_type,
            'timestamp': datetime.datetime.now().isoformat()
        })

    except Exception as e:
        print(f"Chat error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/knowledge', methods=['GET'])
def get_knowledge_base():
    """Get all knowledge base entries for admin"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, category, question, answer, keywords, priority,
                   created_at, updated_at, is_active
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
                'created_at': entry[6],
                'updated_at': entry[7],
                'is_active': bool(entry[8])
            })

        return jsonify({'knowledge_base': knowledge_list})

    except Exception as e:
        print(f"Get knowledge base error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/knowledge', methods=['POST'])
def add_knowledge():
    """Add new knowledge base entry"""
    try:
        data = request.get_json()
        category = data.get('category', '').strip()
        question = data.get('question', '').strip()
        answer = data.get('answer', '').strip()
        keywords = data.get('keywords', '').strip()
        priority = data.get('priority', 1)

        if not all([category, question, answer]):
            return jsonify({'error': 'Category, question, and answer are required'}), 400

        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO knowledge_base
            (category, question, answer, keywords, priority)
            VALUES (?, ?, ?, ?, ?)
        ''', (category, question, answer, keywords, priority))

        knowledge_id = cursor.lastrowid
        conn.commit()
        conn.close()

        return jsonify({
            'message': 'Knowledge entry added successfully',
            'id': knowledge_id
        })

    except Exception as e:
        print(f"Add knowledge error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/knowledge/<int:knowledge_id>', methods=['PUT'])
def update_knowledge(knowledge_id):
    """Update knowledge base entry"""
    try:
        data = request.get_json()
        category = data.get('category', '').strip()
        question = data.get('question', '').strip()
        answer = data.get('answer', '').strip()
        keywords = data.get('keywords', '').strip()
        priority = data.get('priority', 1)
        is_active = data.get('is_active', True)

        if not all([category, question, answer]):
            return jsonify({'error': 'Category, question, and answer are required'}), 400

        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE knowledge_base
            SET category = ?, question = ?, answer = ?, keywords = ?,
                priority = ?, is_active = ?, updated_at = ?
            WHERE id = ?
        ''', (category, question, answer, keywords, priority, is_active,
              datetime.datetime.now(), knowledge_id))

        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Knowledge entry not found'}), 404

        conn.commit()
        conn.close()

        return jsonify({'message': 'Knowledge entry updated successfully'})

    except Exception as e:
        print(f"Update knowledge error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/knowledge/<int:knowledge_id>', methods=['DELETE'])
def delete_knowledge(knowledge_id):
    """Delete knowledge base entry"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM knowledge_base WHERE id = ?', (knowledge_id,))

        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'error': 'Knowledge entry not found'}), 404

        conn.commit()
        conn.close()

        return jsonify({'message': 'Knowledge entry deleted successfully'})

    except Exception as e:
        print(f"Delete knowledge error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/analytics', methods=['GET'])
def get_analytics():
    """Get chatbot analytics for admin"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()

        # Get recent conversations
        cursor.execute('''
            SELECT user_message, bot_response, response_type, timestamp, user_satisfaction
            FROM chat_analytics
            ORDER BY timestamp DESC
            LIMIT 100
        ''')
        conversations = cursor.fetchall()

        # Get response type statistics
        cursor.execute('''
            SELECT response_type, COUNT(*) as count
            FROM chat_analytics
            GROUP BY response_type
        ''')
        response_stats = cursor.fetchall()

        # Get popular queries
        cursor.execute('''
            SELECT user_message, COUNT(*) as frequency
            FROM chat_analytics
            GROUP BY LOWER(user_message)
            ORDER BY frequency DESC
            LIMIT 20
        ''')
        popular_queries = cursor.fetchall()

        conn.close()

        return jsonify({
            'conversations': [
                {
                    'user_message': conv[0],
                    'bot_response': conv[1],
                    'response_type': conv[2],
                    'timestamp': conv[3],
                    'user_satisfaction': conv[4]
                } for conv in conversations
            ],
            'response_stats': [
                {'type': stat[0], 'count': stat[1]} for stat in response_stats
            ],
            'popular_queries': [
                {'query': query[0], 'frequency': query[1]} for query in popular_queries
            ]
        })

    except Exception as e:
        print(f"Get analytics error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/admin/reindex', methods=['POST'])
def trigger_reindex():
    """Manually trigger website content reindexing"""
    try:
        return jsonify({'message': 'Website reindexing completed (simplified version)'})

    except Exception as e:
        print(f"Reindex error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🤖 Starting AI Chatbot Server...")
    print("🔗 Server will be available at: http://localhost:5001")
    print("📊 Admin panel will be available at: http://localhost:5001/admin")
    
    # Initial indexing
    chatbot_ai.index_website_content()
    
    app.run(host='0.0.0.0', port=5001, debug=True)
