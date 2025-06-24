import { useState } from "react";
import { HiSearch, HiUserGroup, HiPlus } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function Communities() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const joinedCommunities = [
    { id: 1, name: "Tech Innovators", members: "12.5K", description: "For technology enthusiasts and innovators" },
    { id: 2, name: "Digital Marketers", members: "8.2K", description: "Connect with digital marketing professionals" },
  ];
  
  const suggestedCommunities = [
    { id: 3, name: "Startup Founders", members: "5.7K", description: "Network with startup founders and investors" },
    { id: 4, name: "AI & Machine Learning", members: "15.3K", description: "Discuss the latest in AI and ML technologies" },
    { id: 5, name: "UX Design Community", members: "9.8K", description: "Share and learn UX design best practices" },
    { id: 6, name: "Cloud Architects", members: "7.1K", description: "For professionals working with cloud technologies" },
    { id: 7, name: "Data Science Hub", members: "11.4K", description: "Connect with data scientists worldwide" },
  ];

  const filteredCommunities = suggestedCommunities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Communities</h1>
        <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 mb-4 md:mb-0">
          <HiPlus className="w-5 h-5 mr-1" />
          Create Community
        </button>
      </div>

      <div className="relative mb-6">
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search communities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Communities</h2>
        {joinedCommunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinedCommunities.map(community => (
              <Link 
                to={`/community/${community.id}`} 
                key={community.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <HiUserGroup className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{community.name}</h3>
                    <p className="text-sm text-gray-600">{community.members} members</p>
                    <p className="text-sm text-gray-500 mt-1">{community.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <HiUserGroup className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No communities yet</h3>
            <p className="text-gray-500">Join communities to connect with like-minded professionals</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {searchQuery ? "Search Results" : "Discover Communities"}
        </h2>
        
        {filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommunities.map(community => (
              <div key={community.id} className="border rounded-lg p-4 hover:shadow-md">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <HiUserGroup className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">{community.name}</h3>
                    <p className="text-sm text-gray-500">{community.members} members</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{community.description}</p>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-md font-medium">
                  Join
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <HiUserGroup className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No communities found</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? "No communities match your search" 
                : "Explore popular communities below"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 