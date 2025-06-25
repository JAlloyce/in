import React, { useState, useEffect } from 'react';
import { HiOutlineBookOpen, HiOutlineCalendar, HiOutlineClipboardList, HiOutlineCog, HiOutlineLightBulb, HiOutlinePlus, HiOutlineX, HiOutlineMenu } from 'react-icons/hi';
import TopicsPanel from '../components/workspace/TopicsPanel';
import CalendarPanel from '../components/workspace/CalendarPanel';
import TasksPanel from '../components/workspace/TasksPanel';
import AIChatPanel from '../components/workspace/AIChatPanel';
import { workspace, auth } from '../lib/supabase';

export default function Workspace() {
  const [activePanel, setActivePanel] = useState('topics');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [sharedContent, setSharedContent] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Real data states
  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize workspace
  useEffect(() => {
    initializeWorkspace();
  }, []);

  const initializeWorkspace = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { session } = await auth.getSession();
      if (!session?.user) {
        setError('Please log in to access workspace');
        return;
      }

      setUser(session.user);
      
      // Load workspace data
      await Promise.all([
        loadTopics(session.user.id),
        loadTasks(session.user.id)
      ]);

    } catch (err) {
      console.error('Error initializing workspace:', err);
      setError('Failed to load workspace');
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async (userId) => {
    const { data: topicsData, error: topicsError } = await workspace.getTopics(userId);
    
    if (topicsError) {
      console.error('Error loading topics:', topicsError);
      return;
    }

    setTopics(topicsData || []);
  };

  const loadTasks = async (userId) => {
    const { data: tasksData, error: tasksError } = await workspace.getTasks(userId);
    
    if (tasksError) {
      console.error('Error loading tasks:', tasksError);
      return;
    }

    setTasks(tasksData || []);
  };

  const handleAiRequest = async (prompt) => {
    setAiLoading(true);
    setAiResponse('');
    
    try {
      // Analyze the prompt and provide contextual responses based on user data
      let response = ""
      const promptLower = prompt?.toLowerCase() || ""
      
      if (promptLower.includes('schedule') || promptLower.includes('time')) {
        const upcomingTasks = tasks.filter(task => task.status !== 'completed').length
        response = `Based on your current workload (${upcomingTasks} pending tasks), I recommend scheduling focused study sessions during your less busy periods. Consider time-blocking for deep work on your most challenging topics.`
      } else if (promptLower.includes('topic') || promptLower.includes('subject')) {
        const topicsCount = topics.length
        response = `You have ${topicsCount} topics in your workspace. I suggest prioritizing topics with upcoming deadlines or those you find most challenging. Would you like me to help organize your study materials for any specific topic?`
      } else if (promptLower.includes('task') || promptLower.includes('assignment')) {
        const completedTasks = tasks.filter(task => task.status === 'completed').length
        const pendingTasks = tasks.filter(task => task.status !== 'completed').length
        const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
        response = `Your task completion rate is ${completionRate}%. You have ${pendingTasks} pending tasks. I recommend breaking down larger tasks into smaller, manageable chunks to improve your completion rate.`
      } else if (promptLower.includes('study') || promptLower.includes('learn')) {
        response = "For effective studying, I recommend the Pomodoro Technique (25-minute focused sessions with 5-minute breaks). This works well with spaced repetition for long-term retention. Would you like me to help create a study schedule?"
      } else {
        response = "I'm here to help you organize your learning journey. I can assist with scheduling, task management, study strategies, and organizing your topics. What specific area would you like help with?"
      }
      
      // Simulate AI processing delay
      setTimeout(() => {
        setAiResponse(response);
        setAiLoading(false);
      }, 1500);
      
    } catch (error) {
      console.error('Error processing AI request:', error);
      setAiResponse('Sorry, I encountered an error processing your request. Please try again.');
      setAiLoading(false);
    }
  };

  const handleShareContent = (content) => {
    setSharedContent(content);
    // In a real app, this would generate a shareable link
    alert(`"${content.title}" has been shared! Share link: https://studyspace.ai/share/${content.id}`);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={initializeWorkspace}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Mobile header bar */}
      {isMobile && (
        <div className="bg-white shadow-sm p-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">StudySpace AI</h1>
          <button 
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="p-2 rounded-lg bg-gray-100"
          >
            {isMobileNavOpen ? <HiOutlineX size={20} /> : <HiOutlineMenu size={20} />}
          </button>
        </div>
      )}
      
      <div className="flex flex-1">
        {/* Sidebar Navigation - Always visible on desktop, conditional on mobile */}
        <div className={`bg-white shadow-md flex flex-col transition-all duration-300
          ${isMobile ? 
            (isMobileNavOpen ? 'w-64 absolute h-full z-50' : 'w-0 overflow-hidden') 
            : 'w-64'}`}>

          <div className="p-4 border-b hidden lg:block">
            <h1 className="text-xl font-bold text-blue-600">StudySpace AI</h1>
          </div>
          
          <nav className="flex-1 py-4">
            {[
              { id: 'topics', icon: HiOutlineBookOpen, label: 'Topics' },
              { id: 'calendar', icon: HiOutlineCalendar, label: 'Calendar' },
              { id: 'tasks', icon: HiOutlineClipboardList, label: 'Tasks' },
              { id: 'ai', icon: HiOutlineLightBulb, label: 'AI Assistant' },
              { id: 'settings', icon: HiOutlineCog, label: 'Settings' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePanel(item.id);
                  if (isMobile) setIsMobileNavOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 text-left transition-colors ${
                  activePanel === item.id 
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="ml-3">{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="p-4 border-t">
            <button className="w-full flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              <HiOutlinePlus className="w-5 h-5" />
              <span className="ml-2">New Topic</span>
            </button>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activePanel === 'topics' && (
            <TopicsPanel 
              topics={topics}
              onAiRequest={handleAiRequest} 
              onShareContent={handleShareContent}
            />
          )}
          {activePanel === 'calendar' && (
            <CalendarPanel 
              tasks={tasks}
              topics={topics}
              onShareContent={handleShareContent}
            />
          )}
          {activePanel === 'tasks' && (
            <TasksPanel 
              tasks={tasks}
              topics={topics}
              onShareContent={handleShareContent}
            />
          )}
          {activePanel === 'ai' && (
            <AIChatPanel 
              response={aiResponse} 
              loading={aiLoading} 
              onRequest={handleAiRequest} 
            />
          )}
          
          {activePanel === 'settings' && (
            <div className="flex-1 p-6 bg-white rounded-lg m-4 shadow">
              <h2 className="text-xl font-bold mb-4">Workspace Settings</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">AI Preferences</h3>
                  <div className="flex items-center mb-2">
                    <input type="checkbox" id="ai-suggestions" className="mr-2" defaultChecked />
                    <label htmlFor="ai-suggestions">Enable AI suggestions</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="ai-tracking" className="mr-2" defaultChecked />
                    <label htmlFor="ai-tracking">Allow progress tracking</label>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Notification Settings</h3>
                  <div className="flex items-center mb-2">
                    <input type="checkbox" id="task-reminders" className="mr-2" defaultChecked />
                    <label htmlFor="task-reminders">Task reminders</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="schedule-alerts" className="mr-2" defaultChecked />
                    <label htmlFor="schedule-alerts">Schedule alerts</label>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Sharing Preferences</h3>
                  <div className="flex items-center mb-2">
                    <input type="checkbox" id="share-topics" className="mr-2" defaultChecked />
                    <label htmlFor="share-topics">Allow topic sharing</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="share-tasks" className="mr-2" defaultChecked />
                    <label htmlFor="share-tasks">Allow task sharing</label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 