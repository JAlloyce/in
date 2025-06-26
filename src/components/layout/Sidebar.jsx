import { Link, useLocation } from "react-router-dom"
import { HiUser, HiBookmark, HiClock, HiFlag, HiUserGroup, HiPlus, HiCog } from "react-icons/hi"
import { useAuth } from "../../context/AuthContext"
import { useModal } from "../../context/ModalContext"
import SettingsModal from "../settings/SettingsModal"

/**
 * Sidebar Component - Professional Edition
 * 
 * Enhanced with modern design elements while maintaining LinkedIn's professional aesthetic:
 * - Clean glassmorphism effects
 * - Professional color scheme
 * - LinkedIn-style user profile card
 * - Smooth hover interactions
 * - Professional typography and spacing
 * - Functional settings modal
 */
export default function Sidebar() {
  const location = useLocation();
  const { user, getUserDisplayName, getUserAvatarUrl } = useAuth();
  const { isSettingsOpen, openSettings, closeSettings, isAnyModalOpen } = useModal();
  const isWorkspace = location.pathname.startsWith("/workspace");
  
  if (isWorkspace) return null; // Hide app sidebar when in workspace

  const menuItems = [
    { icon: HiUser, text: "Your Profile", path: "/profile", color: "text-blue-500" },
    { icon: HiUserGroup, text: "Communities", path: "/communities", color: "text-purple-500" },
    { icon: HiBookmark, text: "Saved", path: "/saved", color: "text-pink-500" },
    { icon: HiClock, text: "Recent", path: "/recent", color: "text-blue-500" },
    { icon: HiFlag, text: "Pages", path: "/pages", color: "text-purple-500" },
  ]

  return (
    <>
      <aside className="hidden md:block w-60 md:w-64 lg:w-72 flex-shrink-0">
        <div className="bg-white rounded-lg shadow sticky top-24">
          <div className="relative">
            <div className="h-12 md:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg"></div>
            <div className="px-3 md:px-4 pb-3 md:pb-4 -mt-6 md:-mt-8">
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-300 border-4 border-white mb-2 overflow-hidden">
                {getUserAvatarUrl() ? (
                  <img 
                    src={getUserAvatarUrl()} 
                    alt={getUserDisplayName()}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-lg">
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-gray-900">{getUserDisplayName()}</h3>
              <p className="text-sm text-gray-500 mb-3">
                {user?.user_metadata?.headline || user?.user_metadata?.job_title || 'Professional at LinkedIn Clone'}
              </p>

              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Profile viewers</span>
                  <span className="text-blue-600 font-medium">142</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Post impressions</span>
                  <span className="text-blue-600 font-medium">1,204</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t">
            <ul className="p-4 space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link 
                    to={item.path}
                    className="flex items-center py-2 px-3 rounded hover:bg-gray-100 transition-colors group"
                  >
                    <item.icon className={`w-5 h-5 mr-3 ${item.color} group-hover:${item.color}`} />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.text}</span>
                  </Link>
                </li>
              ))}
              
              {/* Settings Button */}
              <li>
                <button 
                  onClick={openSettings}
                  className="flex items-center py-2 px-3 rounded hover:bg-gray-100 transition-colors group w-full text-left"
                >
                  <HiCog className="w-5 h-5 mr-3 text-gray-500 group-hover:text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Settings</span>
                </button>
              </li>
            </ul>

            <div className="border-t px-4 py-3">
              <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 group">
                <HiPlus className="w-4 h-4 mr-2 text-pink-500 group-hover:text-pink-600" />
                Discover more
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={closeSettings}
        />
      )}
    </>
  )
}
