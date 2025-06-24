import { useState } from "react";
import { HiSearch, HiPlus } from "react-icons/hi";
import { FaBuilding } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Pages() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const followedPages = [
    { id: 1, name: "TechCorp", category: "Software Development", followers: "125K" },
    { id: 2, name: "DesignHub", category: "Design Services", followers: "87K" },
    { id: 3, name: "CloudSolutions", category: "Cloud Computing", followers: "64K" },
  ];
  
  const suggestedPages = [
    { id: 4, name: "DataTech", category: "Data Analytics", followers: "42K" },
    { id: 5, name: "EcoEnergy", category: "Renewable Energy", followers: "38K" },
    { id: 6, name: "HealthInnovate", category: "Healthcare", followers: "56K" },
    { id: 7, name: "FinTech Global", category: "Financial Services", followers: "91K" },
    { id: 8, name: "LogiChain", category: "Supply Chain", followers: "27K" },
  ];

  const filteredPages = suggestedPages.filter(page => 
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Pages</h1>
        <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 mb-4 md:mb-0">
          <HiPlus className="w-5 h-5 mr-1" />
          Create Page
        </button>
      </div>

      <div className="relative mb-6">
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Pages You Follow</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {followedPages.map(page => (
            <Link 
              to={`/company/${page.id}`} 
              key={page.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <FaBuilding className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{page.name}</h3>
                  <p className="text-sm text-gray-600">{page.category}</p>
                  <p className="text-xs text-gray-500 mt-1">{page.followers} followers</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {searchQuery ? "Search Results" : "Suggested Pages"}
        </h2>
        
        {filteredPages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPages.map(page => (
              <div key={page.id} className="border rounded-lg p-4 hover:shadow-md">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <FaBuilding className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">{page.name}</h3>
                    <p className="text-sm text-gray-500">{page.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-3">{page.followers} followers</p>
                <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-md font-medium">
                  Follow
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaBuilding className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No pages found</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? "No pages match your search" 
                : "Follow pages to see them here"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 