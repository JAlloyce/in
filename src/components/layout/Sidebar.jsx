import { Link, useLocation } from "react-router-dom"
import { HiUser, HiBookmark, HiClock, HiFlag, HiUserGroup, HiPlus, HiSparkles, HiEye, HiChartBar } from "react-icons/hi"

/**
 * Sidebar Component - Futuristic Edition
 * 
 * Enhanced with cutting-edge design elements:
 * - Glassmorphism effects with animated backgrounds
 * - Neon glow effects and gradient borders
 * - Neural network-inspired visual indicators
 * - Interactive hover states with smooth animations
 * - Modern typography and spacing
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
      path: "/my-profile",
      glow: "hover:text-cyan-400",
      gradient: "from-cyan-400 to-blue-500"
    },
    { 
      icon: HiUserGroup, 
      text: "Communities", 
      path: "/communities",
      glow: "hover:text-purple-400",
      gradient: "from-purple-400 to-pink-500"
    },
    { 
      icon: HiBookmark, 
      text: "Saved", 
      path: "/saved",
      glow: "hover:text-amber-400",
      gradient: "from-amber-400 to-orange-500"
    },
    { 
      icon: HiClock, 
      text: "Recent", 
      path: "/recent",
      glow: "hover:text-green-400",
      gradient: "from-green-400 to-emerald-500"
    },
    { 
      icon: HiFlag, 
      text: "Pages", 
      path: "/pages",
      glow: "hover:text-pink-400",
      gradient: "from-pink-400 to-rose-500"
    },
  ]

  return (
    <aside className="w-full">
      {/* Enhanced Profile Card with Glassmorphism */}
      <div className="card-modern hover-lift p-0 overflow-hidden mb-6">
        {/* Neural Background Header */}
        <div className="relative h-20 bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 overflow-hidden">
          {/* Animated background particles */}
          <div className="absolute inset-0">
            <div className="absolute top-2 right-4 w-1 h-1 bg-white rounded-full opacity-60 animate-ping" style={{animationDelay: '0s'}}></div>
            <div className="absolute top-6 left-8 w-0.5 h-0.5 bg-white rounded-full opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-3 right-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-50 float" style={{animationDelay: '2s'}}></div>
          </div>
          
          {/* Neural network pattern overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
        
        <div className="px-6 pb-6 -mt-10 relative">
          {/* Enhanced Profile Avatar */}
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 p-1">
              <div className="w-full h-full rounded-full bg-gray-900 border-4 border-white/20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500"></div>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-3 border-gray-900 flex items-center justify-center animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            
            {/* Neural activity indicator */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full animate-ping opacity-75"></div>
          </div>

          {/* Enhanced Profile Info */}
          <div className="text-center mb-4">
            <h3 className="font-bold text-xl text-white mb-1">Neural User</h3>
            <p className="text-gray-300 text-sm mb-2">Future Architect at TechCorp</p>
            <p className="text-gray-400 text-xs">Building tomorrow's digital landscapes</p>
          </div>

          {/* Enhanced Statistics */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center group cursor-pointer">
              <div className="flex items-center gap-2">
                <HiEye className="w-4 h-4 text-cyan-400" />
                <span className="text-gray-400 text-sm">Neural Views</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-cyan-400 font-bold text-sm">2.8K</span>
                <div className="w-1 h-1 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center group cursor-pointer">
              <div className="flex items-center gap-2">
                <HiChartBar className="w-4 h-4 text-purple-400" />
                <span className="text-gray-400 text-sm">Signal Strength</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-purple-400 font-bold text-sm">95%</span>
                <div className="w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex justify-between items-center group cursor-pointer">
              <div className="flex items-center gap-2">
                <HiSparkles className="w-4 h-4 text-amber-400" />
                <span className="text-gray-400 text-sm">Neural Score</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-amber-400 font-bold text-sm">A+</span>
                <div className="w-1 h-1 bg-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Menu */}
      <div className="card-modern p-0 overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h4 className="text-futuristic font-semibold">Neural Navigation</h4>
        </div>
        
        <nav className="p-2">
          <ul className="space-y-1">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link 
                  to={item.path}
                  className={`
                    group relative flex items-center gap-4 p-4 rounded-xl
                    transition-all duration-300 transform hover:scale-105
                    text-gray-300 hover:bg-white/5 ${item.glow}
                    overflow-hidden
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Icon with gradient background */}
                  <div className={`
                    relative w-10 h-10 rounded-xl 
                    bg-gradient-to-r ${item.gradient} 
                    bg-opacity-20 flex items-center justify-center
                    group-hover:bg-opacity-30 transition-all duration-300
                  `}>
                    <item.icon className="w-5 h-5 text-white drop-shadow-lg" />
                  </div>
                  
                  {/* Text with enhanced typography */}
                  <span className="font-medium text-white group-hover:text-cyan-300 transition-colors">
                    {item.text}
                  </span>
                  
                  {/* Hover effect overlay */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-r ${item.gradient} 
                    opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl
                  `}></div>
                  
                  {/* Neural activity indicator */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Enhanced Discovery Section */}
        <div className="p-4 border-t border-white/10">
          <button className="
            group w-full flex items-center justify-center gap-3
            p-4 rounded-xl
            bg-gradient-to-r from-cyan-500/20 to-purple-500/20
            hover:from-cyan-500/30 hover:to-purple-500/30
            border border-white/20 hover:border-cyan-400/50
            transition-all duration-300 transform hover:scale-105
            text-gray-300 hover:text-cyan-300
          ">
            <HiPlus className="w-5 h-5" />
            <span className="font-medium">Explore Neural Network</span>
            
            {/* Button enhancement effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    </aside>
  )
}
