import { useState } from "react";
import { 
  HiUserAdd, HiUserGroup, HiCalendar, 
  HiSearch, HiChevronDown, HiDotsVertical, HiTrash, HiUser, HiFlag
} from "react-icons/hi";
import { Link } from "react-router-dom";

/**
 * Network Page - Enhanced Connection Management
 * 
 * Features:
 * - Delete connection functionality in 3 dots menu
 * - Clickable connections that lead to user profiles
 * - Mobile-responsive design
 * - Professional LinkedIn-style interactions
 * - Connection management actions
 */
export default function Network() {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showConnectionMenu, setShowConnectionMenu] = useState(null);
  
  const suggestions = [
    { name: "Alice Johnson", title: "Product Manager at Google", mutualConnections: 12 },
    { name: "Bob Smith", title: "Software Engineer at Microsoft", mutualConnections: 8 },
    { name: "Carol Davis", title: "UX Designer at Apple", mutualConnections: 15 },
    { name: "David Wilson", title: "Data Scientist at Netflix", mutualConnections: 6 },
    { name: "Emma Brown", title: "Marketing Manager at Spotify", mutualConnections: 9 },
    { name: "Frank Miller", title: "DevOps Engineer at Amazon", mutualConnections: 11 },
  ];
  
  const [connections, setConnections] = useState([
    { id: 1, name: "Michael Chen", title: "Senior Developer at TechCorp", connected: "3 months ago" },
    { id: 2, name: "Sarah Johnson", title: "Product Lead at InnovateX", connected: "1 month ago" },
    { id: 3, name: "Alex Rodriguez", title: "UX Director at DesignHub", connected: "2 weeks ago" },
    { id: 4, name: "Emma Wilson", title: "Marketing Director at BrandBoost", connected: "1 week ago" },
  ]);
  
  const filteredSuggestions = suggestions.filter(person => 
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConnection = (connectionId) => {
    if (window.confirm("Are you sure you want to remove this connection?")) {
      setConnections(connections.filter(conn => conn.id !== connectionId));
      setShowConnectionMenu(null);
    }
  };

  const ConnectionCard = ({ connection }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow relative">
      <div className="flex items-center space-x-3">
        <Link 
          to={`/profile/${connection.id}`}
          className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 hover:ring-2 hover:ring-blue-300 transition-all"
          title={`View ${connection.name}'s profile`}
        />
        
        <Link 
          to={`/profile/${connection.id}`}
          className="flex-1 min-w-0 hover:text-blue-600 transition-colors"
        >
          <h3 className="font-semibold text-gray-900 truncate">{connection.name}</h3>
          <p className="text-sm text-gray-600 truncate mb-1">{connection.title}</p>
          <p className="text-xs text-gray-500">Connected {connection.connected}</p>
        </Link>
        
        <div className="relative">
          <button 
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-all"
            onClick={() => setShowConnectionMenu(showConnectionMenu === connection.id ? null : connection.id)}
          >
            <HiDotsVertical className="w-5 h-5" />
          </button>
          
          {/* Connection menu dropdown */}
          {showConnectionMenu === connection.id && (
            <>
              {/* Backdrop to close menu */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowConnectionMenu(null)}
              />
              
              {/* Menu content */}
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
                <Link
                  to={`/profile/${connection.id}`}
                  className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                  onClick={() => setShowConnectionMenu(null)}
                >
                  <HiUser className="w-5 h-5 mr-3 text-blue-500" />
                  <span className="font-medium">View Profile</span>
                </Link>
                
                <button
                  onClick={() => handleDeleteConnection(connection.id)}
                  className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <HiTrash className="w-5 h-5 mr-3" />
                  <span className="font-medium">Remove Connection</span>
                </button>
                
                <button
                  onClick={() => {
                    alert(`Reported ${connection.name}`)
                    setShowConnectionMenu(null)
                  }}
                  className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <HiFlag className="w-5 h-5 mr-3 text-orange-500" />
                  <span className="font-medium">Report</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 bg-purple-50 min-h-screen p-4 rounded-lg">
      {/* Network Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">My Network</h1>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <button 
                className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg w-full"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <span>Filter: {filter === "all" ? "All" : "Mutual"}</span>
                <HiChevronDown className="ml-1 w-4 h-4" />
              </button>
              {showFilterDropdown && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg shadow-lg py-2 border z-10">
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setFilter("all");
                      setShowFilterDropdown(false);
                    }}
                  >
                    All Connections
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setFilter("mutual");
                      setShowFilterDropdown(false);
                    }}
                  >
                    Mutual Connections
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative w-full sm:w-64">
              <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Connections Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Connections ({connections.length})</h2>
          <button className="text-blue-600 text-sm font-medium">See all</button>
        </div>
        
        <div className="space-y-4">
          {connections.length > 0 ? (
            connections.map(connection => (
              <ConnectionCard key={connection.id} connection={connection} />
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <HiUserGroup className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No connections</h3>
              <p className="text-gray-500">Start connecting with professionals</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Suggestions Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {searchQuery ? "Search Results" : "People You May Know"}
          </h2>
          <button className="text-blue-600 text-sm font-medium">See all</button>
        </div>
        
        {filteredSuggestions.length > 0 ? (
          <div className="space-y-4">
            {filteredSuggestions.map((person, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{person.name}</h3>
                    <p className="text-sm text-gray-600 truncate mb-1">{person.title}</p>
                    <p className="text-xs text-gray-500 mb-3">{person.mutualConnections} mutual connections</p>
                    <button className="bg-blue-600 text-white py-1.5 px-4 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <HiUserGroup className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No connections found</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? "No connections match your search" 
                : "Try adjusting your search filters"}
            </p>
          </div>
        )}
      </div>
      
      {/* Network Stats Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-lg mb-4">Your Network Stats</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <HiUserGroup className="w-6 h-6 text-blue-600" />
              <span className="font-medium">Connections</span>
            </div>
            <span className="text-xl font-bold text-blue-600">{connections.length}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <HiUserAdd className="w-6 h-6 text-green-600" />
              <span className="font-medium">Following</span>
            </div>
            <span className="text-xl font-bold text-green-600">89</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <HiCalendar className="w-6 h-6 text-purple-600" />
              <span className="font-medium">Events</span>
            </div>
            <span className="text-xl font-bold text-purple-600">3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
