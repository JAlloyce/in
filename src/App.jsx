import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { AuthProvider } from './context/AuthContext'
import { ModalProvider, useModal } from './context/ModalContext'
// Optimized Framer Motion imports - only import what we need
import { motion, AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from './components/ui'

// Layout components (keep these imported normally as they're always needed)
import Navbar from './components/layout/Navbar'
import Sidebar from './components/layout/Sidebar'
import NewsWidget from './components/layout/NewsWidget'

// Lazy load page components for better initial loading performance
const Home = lazy(() => import('./pages/Home'))
const Profile = lazy(() => import('./pages/Profile'))
const UserProfile = lazy(() => import('./pages/UserProfile'))
const Network = lazy(() => import('./pages/Network'))
const Jobs = lazy(() => import('./pages/Jobs'))
const Messaging = lazy(() => import('./pages/Messaging'))
const Notifications = lazy(() => import('./pages/Notifications'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const DatabaseFix = lazy(() => import('./pages/DatabaseFix'))
const Communities = lazy(() => import('./pages/Communities'))
const CommunityDetail = lazy(() => import('./pages/CommunityDetail'))
// Lazy load heavy workspace component for better performance
const Workspace = lazy(() => import('./pages/Workspace'))
const CompanyPage = lazy(() => import('./pages/CompanyPage'))
const Pages = lazy(() => import('./pages/Pages'))
const Recent = lazy(() => import('./pages/Recent'))
const Saved = lazy(() => import('./pages/Saved'))
const Settings = lazy(() => import('./pages/Settings'))
const Test = lazy(() => import('./pages/Test'))

// Optimized loading skeleton component with better performance
const PageSkeleton = () => (
  <div className="animate-pulse space-y-4" role="status" aria-label="Loading content">
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
    <div className="bg-white rounded-lg shadow p-6">
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-24 bg-gray-200 rounded"></div>
    </div>
  </div>
)

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
 * - Comprehensive error boundaries for fault tolerance
 * - Optimized performance with lazy loading and selective imports
 */
function AppContent() {
  const location = useLocation();
  
  // Pages that should use full-width layout without sidebar constraints
  const fullWidthPages = ['/jobs', '/workspace'];
  const isFullWidthPage = fullWidthPages.includes(location.pathname);

  // Optimized motion variants for better performance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const sidebarVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, delay: 0.1, ease: "easeOut" }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const newsWidgetVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, delay: 0.2, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ErrorBoundary>
        <Navbar />
      </ErrorBoundary>
        
      <main className="pt-16"> {/* Account for fixed navbar */}
        {isFullWidthPage ? (
          // Full-width layout for Jobs and Workspace pages
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/workspace" element={<Workspace />} />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        ) : (
          // Standard 3-column layout for other pages
          <div className="container-system">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 py-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Left Sidebar */}
              <motion.div 
                className="hidden md:block lg:col-span-1"
                variants={sidebarVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="sticky top-20">
                  <ErrorBoundary>
                    <Sidebar />
                  </ErrorBoundary>
                </div>
              </motion.div>

              {/* Main Content */}
              <motion.div 
                className="col-span-1 md:col-span-2 lg:col-span-2"
                variants={contentVariants}
                initial="hidden"
                animate="visible"
              >
                <ErrorBoundary>
                  <Suspense fallback={<PageSkeleton />}>
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
                  </Suspense>
                </ErrorBoundary>
              </motion.div>

              {/* Right Sidebar - Conditionally rendered */}
              <NewsWidgetWrapper variants={newsWidgetVariants} />
            </motion.div>
          </div>
        )}
      </main>
    </div>
  )
}

function NewsWidgetWrapper({ variants }) {
  const { isAnyModalOpen } = useModal()
  
  // Hide news widget when any modal is open to prevent overlap
  if (isAnyModalOpen) {
    return null
  }
  
  return (
    <motion.div 
      className="hidden lg:block lg:col-span-1"
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      <div className="sticky top-20">
        <ErrorBoundary>
          <NewsWidget />
        </ErrorBoundary>
      </div>
    </motion.div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <ModalProvider>
            <AppContent />
          </ModalProvider>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}
