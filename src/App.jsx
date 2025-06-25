import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
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
import AuthCallback from "./pages/AuthCallback"

/**
 * Main Application Component - Professional Edition
 * 
 * This is the root component that sets up the routing structure and overall layout
 * for the LinkedIn clone. It implements a clean, professional design with:
 * - LinkedIn-inspired color scheme and styling
 * - Responsive grid layout that adapts to screen size
 * - Professional glassmorphism effects
 * - Smooth transitions and modern interactions
 * - Mobile-optimized padding and spacing
 */
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        {/* Reduced padding for mobile - px-2 on mobile, px-4 on larger screens */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4 lg:py-6">
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
 * - Mobile-optimized spacing
 */
function AppContent() {
  const location = useLocation();
  const { isAuthenticated, loading, user } = useAuth();
  const isWorkspace = location.pathname.startsWith("/workspace");

  console.log('🎯 App: Render state:', { loading, isAuthenticated, userEmail: user?.email, pathname: location.pathname });

  if (loading) {
    console.log('⏳ App: Still loading, showing loading spinner...');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Loading application...</p>
      </div>
    );
  }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
        {!isWorkspace && isAuthenticated && (
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        )}
        
        <div className={`${isWorkspace ? 'lg:col-span-4' : isAuthenticated ? 'lg:col-span-2' : 'lg:col-span-3 lg:col-start-2'}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
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
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
              </div>
        
        {!isWorkspace && isAuthenticated && (
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 sticky top-20 sm:top-24">
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">LinkedIn News</h3>
            <div className="space-y-2 sm:space-y-3">
              {[
                "Tech layoffs continue",
                "AI adoption in workplace",
                "Remote work trends",
                "Startup funding news",
              ].map((news, index) => (
                <div key={index} className="text-xs sm:text-sm">
                  <p className="font-medium text-gray-900">{news}</p>
                  <p className="text-gray-500">2h ago • 1,234 readers</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App
