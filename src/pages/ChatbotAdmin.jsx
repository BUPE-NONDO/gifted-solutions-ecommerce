import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Bot, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  RefreshCw, 
  BarChart3, 
  MessageSquare,
  Brain,
  Database,
  Settings,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ChatbotAdmin = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('knowledge');
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    category: '',
    question: '',
    answer: '',
    keywords: '',
    priority: 1
  });

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (activeTab === 'knowledge') {
      fetchKnowledgeBase();
    } else if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchKnowledgeBase = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/admin/knowledge');
      if (response.ok) {
        const data = await response.json();
        setKnowledgeBase(data.knowledge_base);
      }
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
    }
    setLoading(false);
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/admin/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  };

  const handleAddEntry = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry)
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewEntry({
          category: '',
          question: '',
          answer: '',
          keywords: '',
          priority: 1
        });
        fetchKnowledgeBase();
      }
    } catch (error) {
      console.error('Error adding entry:', error);
    }
  };

  const handleUpdateEntry = async (id, updatedEntry) => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/knowledge/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEntry)
      });

      if (response.ok) {
        setEditingEntry(null);
        fetchKnowledgeBase();
      }
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/admin/knowledge/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          fetchKnowledgeBase();
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
  };

  const handleReindex = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/admin/reindex', {
        method: 'POST'
      });

      if (response.ok) {
        alert('Website reindexing started successfully!');
      }
    } catch (error) {
      console.error('Error triggering reindex:', error);
    }
  };

  const tabs = [
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Bot className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">AI Chatbot Administration</h1>
          </div>
          <p className="text-gray-600">
            Manage your AI chatbot's knowledge base, view analytics, and configure settings.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Knowledge Base Tab */}
        {activeTab === 'knowledge' && (
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Knowledge Base Management</h2>
              <div className="flex space-x-3">
                <button
                  onClick={handleReindex}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Reindex Website
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  <Plus size={16} className="mr-2" />
                  Add Entry
                </button>
              </div>
            </div>

            {/* Add Form Modal */}
            {showAddForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Add Knowledge Entry</h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input
                        type="text"
                        value={newEntry.category}
                        onChange={(e) => setNewEntry({...newEntry, category: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="e.g., products, services, support"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question/Trigger</label>
                      <input
                        type="text"
                        value={newEntry.question}
                        onChange={(e) => setNewEntry({...newEntry, question: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="What question should trigger this response?"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                      <textarea
                        value={newEntry.answer}
                        onChange={(e) => setNewEntry({...newEntry, answer: e.target.value})}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="The response the chatbot should give"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma-separated)</label>
                      <input
                        type="text"
                        value={newEntry.keywords}
                        onChange={(e) => setNewEntry({...newEntry, keywords: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="keywords, that, help, match, this, response"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority (1-5)</label>
                      <select
                        value={newEntry.priority}
                        onChange={(e) => setNewEntry({...newEntry, priority: parseInt(e.target.value)})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value={1}>1 - Low</option>
                        <option value={2}>2 - Below Average</option>
                        <option value={3}>3 - Average</option>
                        <option value={4}>4 - High</option>
                        <option value={5}>5 - Critical</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddEntry}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                    >
                      Add Entry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Knowledge Base List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Current Knowledge Base</h3>
              </div>
              
              {loading ? (
                <div className="p-6 text-center">
                  <RefreshCw className="animate-spin h-6 w-6 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">Loading knowledge base...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {knowledgeBase.map((entry) => (
                    <div key={entry.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {entry.category}
                            </span>
                            <span className="text-sm text-gray-500">Priority: {entry.priority}</span>
                            {entry.is_active ? (
                              <CheckCircle size={16} className="text-green-500" />
                            ) : (
                              <AlertCircle size={16} className="text-red-500" />
                            )}
                          </div>
                          <h4 className="text-sm font-medium text-gray-900 mb-1">{entry.question}</h4>
                          <p className="text-sm text-gray-600 mb-2">{entry.answer}</p>
                          {entry.keywords && (
                            <p className="text-xs text-gray-500">
                              Keywords: {entry.keywords}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => setEditingEntry(entry)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Chatbot Analytics</h2>
            
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="animate-spin h-8 w-8 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Loading analytics...</p>
              </div>
            ) : analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Response Stats */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Response Types</h3>
                  <div className="space-y-2">
                    {analytics.response_stats.map((stat, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm text-gray-600">{stat.type}</span>
                        <span className="text-sm font-medium">{stat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Queries */}
                <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Popular Queries</h3>
                  <div className="space-y-2">
                    {analytics.popular_queries.slice(0, 10).map((query, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm text-gray-600 truncate">{query.query}</span>
                        <span className="text-sm font-medium">{query.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No analytics data available</p>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Chatbot Settings</h2>
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Confidence Threshold
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    defaultValue="0.3"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum confidence required for AI responses (0.1 = low, 1.0 = high)
                  </p>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">Enable learning from user interactions</span>
                  </label>
                </div>
                
                <div>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">Auto-reindex website content daily</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatbotAdmin;
