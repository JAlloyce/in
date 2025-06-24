import React, { useState, useEffect } from 'react';
import { HiOutlineBookOpen, HiOutlineCalendar, HiOutlineClipboardList, HiOutlineCog, HiOutlineLightBulb, HiOutlinePlus, HiOutlineX, HiOutlineMenu } from 'react-icons/hi';
import TopicsPanel from '../components/workspace/TopicsPanel';
import CalendarPanel from '../components/workspace/CalendarPanel';
import TasksPanel from '../components/workspace/TasksPanel';
import AIChatPanel from '../components/workspace/AIChatPanel';

export default function Workspace() {
  const [activePanel, setActivePanel] = useState('topics');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [sharedContent, setSharedContent] = useState(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAiRequest = (prompt) => {
    setAiLoading(true);
    setAiResponse('');
    
    // Simulate AI processing
    setTimeout(() => {
      const responses = [
        "Based on your study schedule, I recommend focusing on Calculus next. You have an exam in 2 weeks, and you've only covered 40% of the material.",
        "I've organized your Physics notes into these subtopics: 1. Newtonian Mechanics 2. Thermodynamics 3. Electromagnetism. Would you like me to create study materials for any of these?",
        "Your biology task is behind schedule. I suggest allocating 90 minutes today to complete the cell structure exercises. I can generate practice questions if you'd like.",
        "I've analyzed your schedule and found that Wednesday afternoons are consistently free. This would be an ideal time for deep focus sessions on advanced topics.",
        "Your task completion rate for Math is 75%, which is above average. For Chemistry, it's 50%. Would you like me to suggest a revised study plan to improve chemistry performance?",
        "I've generated 5 practice questions for Derivatives based on your lecture notes. Would you like me to add them to your Calculus topic?"
      ];
      
      setAiResponse(responses[Math.floor(Math.random() * responses.length)]);
      setAiLoading(false);
    }, 1500);
  };

  const handleShareContent = (content) => {
    setSharedContent(content);
    // In a real app, this would generate a shareable link
    alert(`"${content.title}" has been shared! Share link: https://studyspace.ai/share/${content.id}`);
  };

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
              onAiRequest={handleAiRequest} 
              onShareContent={handleShareContent}
            />
          )}
          {activePanel === 'calendar' && (
            <CalendarPanel 
              onShareContent={handleShareContent}
            />
          )}
          {activePanel === 'tasks' && (
            <TasksPanel 
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