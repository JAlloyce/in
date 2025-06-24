import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import Navbar from "./components/layout/Navbar"
import Sidebar from "./components/layout/Sidebar"
import Home from "./pages/Home"
import Profile from "./pages/Profile"
import Network from "./pages/Network"
import Notifications from "./pages/Notifications"
import Jobs from "./pages/Jobs"
import Messaging from "./pages/Messaging"
import Communities from "./pages/Communities"
import Saved from "./pages/Saved"
import Recent from "./pages/Recent"
import Pages from "./pages/Pages"
import CompanyPage from "./pages/CompanyPage"
import Workspace from "./pages/Workspace"
import CommunityDetail from "./pages/CommunityDetail"
import UserProfile from "./pages/UserProfile"

/**
 * Main Application Component - Futuristic Edition
 * 
 * Enhanced with cutting-edge design elements:
 * - Dark gradient background with animated particles
 * - Glassmorphism layout with advanced blur effects
 * - Responsive grid system with smooth transitions
 * - Neural network-inspired visual indicators
 * - Modern spacing and futuristic aesthetics
 */
function App() {
  return (
    <BrowserRouter>
      {/* Futuristic main container with animated background */}
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated background with gradient mesh */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.2),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.2),transparent_50%)]"></div>
        </div>

        {/* Floating particles effect */}
        <div className="fixed inset-0 pointer-events-none -z-5">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400 rounded-full opacity-60 animate-ping" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-3/4 right-1/3 w-0.5 h-0.5 bg-purple-400 rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-amber-400 rounded-full opacity-50 float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-green-400 rounded-full opacity-50 animate-ping" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-1/6 right-1/4 w-0.5 h-0.5 bg-pink-400 rounded-full opacity-40 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>

        {/* Global navigation with glassmorphism */}
        <div className="relative z-30">
          <Navbar />
        </div>
        
        {/* Main content area with enhanced spacing */}
        <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
          <AppContent />
        </div>
      </div>
    </BrowserRouter>
  )
}

/**
 * AppContent Component - Enhanced Layout Manager
 * 
 * Features futuristic layout management with:
 * - Adaptive grid system based on authentication and routes
 * - Smooth transitions between layout states
 * - Enhanced glassmorphism effects for content areas
 * - Advanced news feed with neural network styling
 */
function AppContent() {
  const location = useLocation();
  
  // Enhanced route detection with smooth transitions
  const isWorkspace = location.pathname.startsWith("/workspace");
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 transition-all duration-500">
      {/* Enhanced Left Sidebar with glassmorphism */}
      {!isWorkspace && isLoggedIn && (
        <div className="lg:col-span-1 transition-all duration-300">
          <div className="sticky top-24">
            <Sidebar />
          </div>
        </div>
      )}
      
      {/* Main Content Area with adaptive width and smooth transitions */}
      <div className={`
        transition-all duration-500 ease-out
        ${isWorkspace 
          ? 'lg:col-span-4 workspace-full-view' 
          : isLoggedIn 
            ? 'lg:col-span-2' 
            : 'lg:col-span-3 lg:col-start-2'
        }
      `}>
        <div className="relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/my-profile" element={<Profile />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/network" element={<Network />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/messaging" element={<Messaging />} />
            <Route path="/communities" element={<Communities />} />
            <Route path="/community/:id" element={<CommunityDetail />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/recent" element={<Recent />} />
            <Route path="/pages" element={<Pages />} />
            <Route path="/company/:id" element={<CompanyPage />} />
            <Route path="/workspace" element={<Workspace />} />
          </Routes>
        </div>
      </div>
      
      {/* Enhanced Right Sidebar - Futuristic News Feed */}
      {!isWorkspace && isLoggedIn && (
        <div className="lg:col-span-1 transition-all duration-300">
          <div className="sticky top-24">
            {/* Neural Network News Hub */}
            <div className="card-modern p-6 hover-lift">
              {/* Header with neural indicator */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-futuristic text-lg font-bold">Neural Feed</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-400">Live</span>
                </div>
              </div>
              
              {/* Enhanced news items with futuristic styling */}
              <div className="space-y-4">
                {[
                  { 
                    title: "AI Revolution in Workplace", 
                    engagement: "12.5K", 
                    trend: "trending",
                    color: "text-cyan-400"
                  },
                  { 
                    title: "Neural Network Breakthroughs", 
                    engagement: "8.9K", 
                    trend: "hot",
                    color: "text-purple-400"
                  },
                  { 
                    title: "Quantum Computing Updates", 
                    engagement: "15.2K", 
                    trend: "rising",
                    color: "text-green-400"
                  },
                  { 
                    title: "Metaverse Career Shifts", 
                    engagement: "6.7K", 
                    trend: "new",
                    color: "text-amber-400"
                  },
                ].map((news, index) => (
                  <div 
                    key={index} 
                    className="group relative p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 cursor-pointer"
                  >
                    {/* Trend indicator */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${news.color.replace('text-', 'bg-')} animate-pulse`}></div>
                      <span className={`text-xs font-medium ${news.color} uppercase tracking-wide`}>
                        {news.trend}
                      </span>
                    </div>
                    
                    <h4 className="font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {news.title}
                    </h4>
                    
                    {/* Engagement metrics */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>2h ago</span>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 opacity-60"></div>
                        <span className="font-medium">{news.engagement} views</span>
                      </div>
                    </div>
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>
              
              {/* Neural insights footer */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Neural Analysis</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-400 rounded-full animate-ping"></div>
                    <span>Real-time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
