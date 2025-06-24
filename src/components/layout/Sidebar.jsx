import { Link, useLocation } from "react-router-dom"
import { HiUser, HiBookmark, HiClock, HiFlag, HiUserGroup, HiPlus, HiEye, HiTrendingUp } from "react-icons/hi"

/**
 * Sidebar Component - Professional Edition
 * 
 * Enhanced with modern design elements while maintaining LinkedIn's professional aesthetic:
 * - Clean glassmorphism effects
 * - Professional color scheme
 * - LinkedIn-style user profile card
 * - Smooth hover interactions
 * - Professional typography and spacing
 */
export default function Sidebar() {
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith("/workspace");
  
  // Get login status from localStorage
  const isLoggedIn = !!localStorage.getItem("token");
  
  if (isWorkspace || !isLoggedIn) return null;

  const menuItems = [
    { 
      icon: HiUser, 
      text: "Your Profile", 
      path: "/my-profile"
    },
    { 
      icon: HiUserGroup, 
      text: "Communities", 
      path: "/communities"
    },
    { 
      icon: HiBookmark, 
      text: "Saved", 
      path: "/saved"
    },
    { 
      icon: HiClock, 
      text: "Recent", 
      path: "/recent"
    },
    { 
      icon: HiFlag, 
      text: "Pages", 
      path: "/pages"
    },
  ]

  return (
    <aside className="w-full space-y-4">
      {/* Professional Profile Card */}
      <div className="card-modern hover-lift p-0 overflow-hidden">
        {/* LinkedIn-style header */}
        <div className="relative h-16 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-700/90"></div>
        </div>
        
        <div className="px-4 pb-4 -mt-8 relative">
          {/* Professional Avatar */}
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                JD
              </div>
            </div>
            
            {/* Online status indicator */}
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          {/* Professional Profile Info */}
          <div className="text-center mb-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">John Doe</h3>
            <p className="text-gray-600 text-sm mb-2">Software Engineer at TechCorp</p>
            <p className="text-gray-500 text-xs">Building innovative solutions</p>
          </div>

          {/* Professional Statistics */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <HiEye className="w-4 h-4" />
                <span>Profile views</span>
              </div>
              <span className="text-blue-600 font-semibold">142</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <HiTrendingUp className="w-4 h-4" />
                <span>Post impressions</span>
              </div>
              <span className="text-blue-600 font-semibold">1,204</span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Navigation Menu */}
      <div className="card-modern p-0 overflow-hidden">
        <nav className="p-2">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link 
                  to={item.path}
                  className="
                    group flex items-center gap-3 p-3 rounded-lg
                    transition-all duration-200
                    text-gray-700 hover:bg-gray-50 hover:text-blue-600
                  "
                >
                  <item.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                  <span className="font-medium">{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Professional Discovery Section */}
        <div className="p-4 border-t border-gray-100">
          <button className="
            group w-full flex items-center justify-center gap-2
            p-3 rounded-lg
            text-gray-600 hover:text-blue-600
            border border-gray-200 hover:border-blue-300
            hover:bg-blue-50
            transition-all duration-200
            font-medium text-sm
          ">
            <HiPlus className="w-4 h-4" />
            <span>Discover more</span>
          </button>
        </div>
      </div>

      {/* LinkedIn Premium Suggestion */}
      <div className="card-modern p-4 border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">P</span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-1">Try Premium for free</h4>
            <p className="text-gray-600 text-xs mb-2">See who's viewed your profile and access exclusive tools</p>
            <button className="text-blue-600 text-xs font-semibold hover:underline">
              Try for free
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
