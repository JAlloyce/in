import React, { useState, useEffect } from 'react';
import { 
  HiOutlineSparkles, 
  HiOutlinePlus,
  HiOutlineChartBar,
  HiOutlineCalendar,
  HiOutlineClipboardCheck,
  HiOutlineBookOpen,
  HiOutlineLightBulb,
  HiOutlineChat,
  HiOutlineX,
  HiOutlineMenu,
  HiOutlineLogin,
  HiOutlineHome
} from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import TopicsPanel from '../components/workspace/TopicsPanel';
import CalendarPanel from '../components/workspace/CalendarPanel';
import TasksPanel from '../components/workspace/TasksPanel';
import AIChatPanel from '../components/workspace/AIChatPanel';
import workspaceService from '../services/workspace';
import perplexityService from '../services/perplexity';
import { useAuth } from '../context/AuthContext';

/**
 * Responsive Workspace Component
 * 
 * Features:
 * - Mobile-first responsive design
 * - Touch-optimized navigation
 * - Proper overflow handling
 * - Accessibility compliant
 * - Performance optimized
 */
export default function Workspace() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  // Core data states
  const [topics, setTopics] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mobile-optimized UI states
  const [activeView, setActiveView] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  
  // AI states
  const [chatMessages, setChatMessages] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Mobile menu views configuration
  const mobileViews = [
    { id: 'overview', label: 'Overview', icon: HiOutlineChartBar },
    { id: 'topics', label: 'Topics', icon: HiOutlineBookOpen },
    { id: 'tasks', label: 'Tasks', icon: HiOutlineClipboardCheck },
    { id: 'calendar', label: 'Calendar', icon: HiOutlineCalendar },
    { id: 'chat', label: 'AI Chat', icon: HiOutlineChat },
  ];

  // Initialize workspace with proper data persistence
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        initializeWorkspace();
      } else {
        setLoading(false); // Stop loading if not authenticated
      }
    }
  }, [user, authLoading, isAuthenticated]);

  // Close mobile menu on view change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeView]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Show login prompt for non-authenticated users
  if (!authLoading && !isAuthenticated) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center mobile-safe"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineLogin className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Access Your Workspace</h2>
            <p className="text-gray-600 mb-6 text-base">
              Sign in to access your personalized learning workspace with topics, tasks, and AI assistance.
            </p>
            <Link 
              to="/"
              className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors touch-target focus-visible"
            >
              Sign In to Continue
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              Join thousands of learners organizing their studies with AI
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  const initializeWorkspace = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError('Please log in to access workspace');
        setLoading(false);
        return;
      }

      // Load workspace data with timeout and error handling
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const dataPromise = workspaceService.fetchWorkspaceData();
      
      const workspaceData = await Promise.race([dataPromise, timeout]);
      
      setTopics(workspaceData.topics || []);
      setTasks(workspaceData.tasks || []);
      setActivities(workspaceData.activities || []);

    } catch (err) {
      console.error('Error initializing workspace:', err);
      setError(err.message === 'Request timeout' ? 'Loading took too long. Please try again.' : 'Failed to load workspace data');
      
      // Set empty arrays as fallback
      setTopics([]);
      setTasks([]);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkspace = async () => {
    if (user) {
      try {
        const workspaceData = await workspaceService.fetchWorkspaceData();
        setTopics(workspaceData.topics);
        setTasks(workspaceData.tasks);
        setActivities(workspaceData.activities);
      } catch (err) {
        console.error('Error refreshing workspace:', err);
      }
    }
  };

  // Handler functions with persistence
  const handleTaskComplete = async (taskId) => {
    try {
      await workspaceService.updateTask(taskId, { 
        status: 'completed',
        completed_at: new Date().toISOString()
      });
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: 'completed' } : task
        )
      );
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const handleScheduleUpdate = async (eventData) => {
    try {
      // Log activity for calendar interaction
      await workspaceService.logActivity('calendar_event_created', null, {
        event_title: eventData.title,
        event_date: eventData.date
      });
      
      await refreshWorkspace();
    } catch (err) {
      console.error('Error updating schedule:', err);
    }
  };

  const handleSendMessage = async (message) => {
    try {
      setIsAiLoading(true);
      
      const userMessage = {
        id: Date.now(),
        text: message,
        sender: 'user',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      
      // Use Perplexity API for intelligent responses
      const response = await handleAiRequest(message);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: response.content || 'I apologize, but I encountered an error processing your request.',
        sender: 'ai',
        timestamp: new Date(),
        citations: response.citations || []
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'I apologize, but I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiRequest = async (prompt) => {
    try {
      // Log AI interaction
      await workspaceService.logActivity('ai_chat_query', null, {
        query: prompt.substring(0, 100)
      });

      // Enhanced AI responses based on workspace context
      const workspaceContext = `
        Current workspace context:
        - Topics: ${topics.length} (${topics.map(t => t.title).join(', ')})
        - Tasks: ${tasks.length} total, ${tasks.filter(t => t.status === 'completed').length} completed
        - Recent activities: ${activities.slice(0, 5).map(a => a.action).join(', ')}
      `;

      const messages = [
        {
          role: 'system',
          content: 'You are an AI learning assistant helping students organize their studies. Be helpful, encouraging, and provide actionable advice.'
        },
        {
          role: 'user',
          content: `${prompt}\n\n${workspaceContext}`
        }
      ];

      const response = await perplexityService.makeRequest(messages, {
        maxTokens: 1000,
        temperature: 0.7
      });

      return response;
      
    } catch (err) {
      console.error('Error with AI request:', err);
      return {
        content: "I'm here to help you with your learning journey. What would you like to work on today?",
        citations: []
      };
    }
  };

  // Calculate stats for dashboard
  const stats = {
    totalTopics: topics.length,
    completedTasks: tasks.filter(task => task.status === 'completed').length,
    pendingTasks: tasks.filter(task => task.status !== 'completed').length,
    upcomingEvents: activities.length,
    completionRate: tasks.length > 0 ? Math.round((tasks.filter(task => task.status === 'completed').length / tasks.length) * 100) : 0
  };

  // Mobile Header Component
  const MobileHeader = () => (
    <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-header">
      <div className="flex items-center space-x-3">
        <Link to="/" className="text-gray-500 hover:text-gray-700 touch-target">
          <HiOutlineHome className="w-6 h-6" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">
          {mobileViews.find(v => v.id === activeView)?.label || 'Workspace'}
        </h1>
      </div>
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target focus-visible"
        aria-label="Toggle menu"
      >
        <HiOutlineMenu className="w-6 h-6" />
      </button>
    </div>
  );

  // Mobile Navigation Menu
  const MobileMenu = () => (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-modal-backdrop bg-black/50 backdrop-blur-sm md:hidden"
          />
          
          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-modal w-80 max-w-[80vw] bg-white shadow-xl md:hidden overflow-hidden"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors touch-target focus-visible"
                aria-label="Close menu"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {mobileViews.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => {
                      if (view.id === 'chat') {
                        setShowAiChat(true);
                      } else {
                        setActiveView(view.id);
                      }
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors touch-target focus-visible ${
                      activeView === view.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <view.icon className="w-5 h-5 mr-3" />
                    <span className="text-base font-medium">{view.label}</span>
                  </button>
                ))}
              </nav>
              
              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setActiveView('topics');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                  >
                    <HiOutlinePlus className="w-4 h-4 mr-3 text-green-500" />
                    <span className="text-sm">Add Topic</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('tasks');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors touch-target"
                  >
                    <HiOutlineClipboardCheck className="w-4 h-4 mr-3 text-blue-500" />
                    <span className="text-sm">Add Task</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Desktop Sidebar Component
  const DesktopSidebar = () => (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link to="/" className="flex items-center space-x-3">
              <HiOutlineSparkles className="w-8 h-8 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">Workspace</span>
            </Link>
          </div>
          <nav className="mt-8 flex-1 px-4 space-y-1">
            {mobileViews.map((view) => (
              <button
                key={view.id}
                onClick={() => {
                  if (view.id === 'chat') {
                    setShowAiChat(true);
                  } else {
                    setActiveView(view.id);
                  }
                }}
                className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === view.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <view.icon className="mr-3 flex-shrink-0 h-6 w-6" />
                {view.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center py-16">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Workspace</h2>
          <p className="text-gray-600">Setting up your personalized learning environment...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center py-16 border border-red-200 bg-red-50 rounded-2xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HiOutlineX className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Workspace Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={initializeWorkspace}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Enhanced Workspace Header */}
        <motion.div 
          className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-6 mb-8 overflow-hidden relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-10 gap-4 h-full">
              {[...Array(30)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="bg-white rounded-full w-2 h-2"
                  animate={{ 
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    delay: i * 0.1,
                    repeat: Infinity
                  }}
                />
              ))}
            </div>
          </div>

          <div className="relative z-10 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <motion.h1 
                  className="text-3xl md:text-4xl font-bold mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Welcome back, {user?.user_metadata?.name || 'Learner'}!
                </motion.h1>
                <motion.p 
                  className="text-blue-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Ready to continue your learning journey? Here's what's happening today.
                </motion.p>
        </div>
              
              <motion.button
                onClick={() => setShowAiChat(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <HiOutlineSparkles className="w-5 h-5" />
                <span className="font-medium">AI Assistant</span>
              </motion.button>
            </div>
            
            {/* Compact Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="bg-white/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stats.totalTopics}</div>
                <div className="text-blue-100 text-sm">Active Topics</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stats.pendingTasks}</div>
                <div className="text-blue-100 text-sm">Pending Tasks</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
                <div className="text-blue-100 text-sm">Upcoming Events</div>
              </div>
              <div className="bg-white/20 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stats.completionRate}%</div>
                <div className="text-blue-100 text-sm">Completion Rate</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Navigation Tabs - Enhanced for Mobile */}
        <motion.div 
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Mobile Menu Button */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              <HiOutlineMenu className="w-5 h-5" />
              <span>Menu</span>
            </button>
          </div>
          
          {/* Navigation Items */}
          <div className={`flex flex-col md:flex-row md:flex-wrap gap-2 ${mobileMenuOpen ? 'block' : 'hidden md:flex'}`}>
            {mobileViews.map((item) => {
              const Icon = item.icon;
              return (
              <button
                key={item.id}
                onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false); // Close mobile menu after selection
                  }}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeView === item.id
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
              </button>
              );
            })}
          </div>
        </motion.div>
        
        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {activeView === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Topics */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Recent Topics</h3>
                    <button
                      onClick={() => setActiveView('topics')}
                      className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {topics.slice(0, 4).map((topic) => (
                      <div key={topic.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <HiOutlineBookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{topic.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">Progress: {topic.progress || 0}%</p>
                        </div>
                      </div>
                    ))}
                    {topics.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No topics yet. Create your first topic to get started!</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Upcoming Tasks</h3>
                    <button
                      onClick={() => setActiveView('tasks')}
                      className="text-blue-600 hover:text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {tasks.filter(task => task.status !== 'completed').slice(0, 4).map((task) => (
                      <div key={task.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          <HiOutlineClipboardCheck className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{task.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">Due: {task.due_date || 'No due date'}</p>
                        </div>
                      </div>
                    ))}
                    {tasks.filter(task => task.status !== 'completed').length === 0 && (
                      <p className="text-gray-500 text-center py-8">All caught up! No pending tasks.</p>
                    )}
                  </div>
                  </div>
                </div>
                
              {/* Quick Stats Sidebar */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Topics</span>
                      <span className="font-bold text-blue-600">{stats.totalTopics}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Completed Tasks</span>
                      <span className="font-bold text-green-600">{stats.completedTasks}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Pending Tasks</span>
                      <span className="font-bold text-orange-600">{stats.pendingTasks}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="font-bold text-gray-900">{stats.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stats.completionRate}%` }}
                        />
                      </div>
                  </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Tips</h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Break large topics into smaller, manageable chunks</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Set specific deadlines for each learning goal</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Use the AI assistant for personalized guidance</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Schedule regular review sessions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeView === 'topics' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[600px] p-2">
              <TopicsPanel 
                topics={topics} 
                onAiRequest={handleAiRequest}
                onShareContent={(content) => alert(`Shared: ${content.title}`)}
                onRefresh={refreshWorkspace}
                user={user}
              />
            </div>
          )}

          {activeView === 'tasks' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[600px] p-2">
              <TasksPanel 
                tasks={tasks} 
                onTaskComplete={handleTaskComplete}
                onAiRequest={handleAiRequest}
              />
            </div>
          )}

          {activeView === 'calendar' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[600px] p-2">
              <CalendarPanel 
                activities={activities}
                onScheduleUpdate={handleScheduleUpdate}
                onAiRequest={handleAiRequest}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* AI Chat Modal */}
      {showAiChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <HiOutlineSparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
                  <p className="text-sm text-gray-600">Your learning companion</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiChat(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <div className="h-96">
              <AIChatPanel 
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                onClose={() => setShowAiChat(false)}
                isLoading={isAiLoading}
              />
        </div>
      </div>
    </div>
      )}
    </motion.div>
  );
} 