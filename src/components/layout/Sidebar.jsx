import { Link } from "react-router-dom"
import { HiUser, HiBookmark, HiClock, HiFlag, HiUserGroup, HiPlus } from "react-icons/hi"

export default function Sidebar() {
  const menuItems = [
    { icon: HiUser, text: "Your Profile", path: "/profile" },
    { icon: HiUserGroup, text: "Communities", path: "/communities" },
    { icon: HiBookmark, text: "Saved", path: "/saved" },
    { icon: HiClock, text: "Recent", path: "/recent" },
    { icon: HiFlag, text: "Pages", path: "/pages" },
  ]

  return (
    <aside className="hidden md:block w-64 flex-shrink-0">
      <div className="bg-white rounded-lg shadow sticky top-24">
        <div className="relative">
          <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-lg"></div>
          <div className="px-4 pb-4 -mt-8">
            <div className="w-16 h-16 rounded-full bg-gray-300 border-4 border-white mb-2"></div>
            <h3 className="font-bold text-gray-900">John Doe</h3>
            <p className="text-sm text-gray-500 mb-3">Software Engineer at TechCorp</p>

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
                  className="flex items-center py-2 px-3 rounded hover:bg-gray-100 transition-colors"
                >
                  <item.icon className="w-5 h-5 text-gray-600 mr-3" />
                  <span className="text-sm font-medium text-gray-700">{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t px-4 py-3">
            <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
              <HiPlus className="w-4 h-4 mr-2" />
              Discover more
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
