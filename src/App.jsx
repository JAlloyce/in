import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ModalProvider, useModal } from './context/ModalContext'
import { motion, AnimatePresence } from 'framer-motion'
import Settings from './pages/Settings'

// Layout components
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import NewsWidget from './components/layout/NewsWidget'

// Page components
import Home from './pages/Home'
import Profile from './pages/Profile'
import UserProfile from './pages/UserProfile'
import Network from './pages/Network'
import Jobs from './pages/Jobs'
import Messaging from './pages/Messaging'
import Notifications from './pages/Notifications'
import AuthCallback from './pages/AuthCallback'
import DatabaseFix from './pages/DatabaseFix'
import Communities from './pages/Communities'
import CommunityDetail from './pages/CommunityDetail'
import Workspace from './pages/Workspace'
import CompanyPage from './pages/CompanyPage'
import Pages from './pages/Pages'
import Recent from './pages/Recent'
import Saved from './pages/Saved'
import Test from './pages/Test'

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
 * - Full-width layout for specific pages (Jobs, Workspace)
 */
function AppContent() {
  const location = useLocation();
  
  // Pages that should use full-width layout without sidebar constraints
  const fullWidthPages = ['/jobs', '/workspace'];
  const isFullWidthPage = fullWidthPages.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
        
      <main className="pt-16"> {/* Account for fixed navbar */}
        {isFullWidthPage ? (
          // Full-width layout for Jobs and Workspace pages
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/workspace" element={<Workspace />} />
            </Routes>
          </AnimatePresence>
        ) : (
          // Standard 3-column layout for other pages
          <div className="container-system">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 py-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {/* Left Sidebar */}
              <motion.div 
                className="hidden md:block lg:col-span-1"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <div className="sticky top-20">
                  <Sidebar />
                </div>
              </motion.div>

              {/* Main Content */}
              <motion.div 
                className="col-span-1 md:col-span-2 lg:col-span-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
              >
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:userId" element={<UserProfile />} />
                    <Route path="/network" element={<Network />} />
                    <Route path="/messaging" element={<Messaging />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/database-fix" element={<DatabaseFix />} />
                    <Route path="/communities" element={<Communities />} />
                    <Route path="/communities/:id" element={<CommunityDetail />} />
                    <Route path="/company/:slug" element={<CompanyPage />} />
                    <Route path="/pages" element={<Pages />} />
                    <Route path="/recent" element={<Recent />} />
                    <Route path="/saved" element={<Saved />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/test" element={<Test />} />
                  </Routes>
                </AnimatePresence>
              </motion.div>

              {/* Right Sidebar - Conditionally rendered */}
              <NewsWidgetWrapper />
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}

function NewsWidgetWrapper() {
  const { isAnyModalOpen } = useModal()
  
  // Hide news widget when any modal is open to prevent overlap
  if (isAnyModalOpen) {
    return null
  }
  
  return (
    <motion.div 
      className="hidden lg:block lg:col-span-1"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
    >
      <div className="sticky top-20">
        <NewsWidget />
      </div>
    </motion.div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ModalProvider>
          <AppContent />
        </ModalProvider>
      </Router>
    </AuthProvider>
  )
}
