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
 * Main Application Component - Professional Edition
 * 
 * This is the root component that sets up the routing structure and overall layout
 * for the LinkedIn clone. It implements a clean, professional design with:
 * - LinkedIn-inspired color scheme and styling
 * - Responsive grid layout that adapts to screen size
 * - Professional glassmorphism effects
 * - Smooth transitions and modern interactions
 */
function App() {
  return (
    <BrowserRouter>
      {/* Professional main container */}
      <div className="min-h-screen bg-professional">
        {/* Global navigation bar */}
        <Navbar />
        
        {/* Content wrapper with LinkedIn-style max width */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <AppContent />
        </div>
      </div>
    </BrowserRouter>
  )
}

/**
 * AppContent Component - Layout Manager
 * 
 * Handles the main content layout logic including:
 * - Authentication-based layout variations
 * - Special handling for workspace (full-width) layout
 * - Responsive grid system for desktop/mobile
 * - Conditional sidebar and news feed rendering
 */
function AppContent() {
  const location = useLocation();
  
  // Special handling for workspace route - requires full-width layout
  const isWorkspace = location.pathname.startsWith("/workspace");
  
  // Authentication check using localStorage token
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 transition-all duration-300">
      {/* Left Sidebar - Hidden on workspace and non-authenticated views */}
      {!isWorkspace && isLoggedIn && (
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Sidebar />
          </div>
        </div>
      )}
      
      {/* Main Content Area - Dynamic width based on context */}
      <div className={`
        transition-all duration-300
        ${isWorkspace 
          ? 'lg:col-span-4 workspace-full-view' 
          : isLoggedIn 
            ? 'lg:col-span-2' 
            : 'lg:col-span-3 lg:col-start-2'
        }
      `}>
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
      
      {/* Right Sidebar - LinkedIn News Section */}
      {!isWorkspace && isLoggedIn && (
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {/* Professional News Feed */}
            <div className="card-modern p-4 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">LinkedIn News</h3>
                <span className="text-xs text-gray-500">Updated</span>
              </div>
              
              <div className="space-y-3">
                {[
                  { title: "Tech layoffs continue", readers: "12,345", time: "2h" },
                  { title: "AI adoption in workplace", readers: "8,901", time: "4h" },
                  { title: "Remote work trends", readers: "15,234", time: "6h" },
                  { title: "Startup funding news", readers: "6,789", time: "8h" },
                ].map((news, index) => (
                  <div key={index} className="group cursor-pointer">
                    <h4 className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                      {news.title}
                    </h4>
                    <p className="text-gray-500 text-xs mt-1">
                      {news.time} ago • {news.readers} readers
                    </p>
                  </div>
                ))}
              </div>
              
              <button className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
                Show more
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
