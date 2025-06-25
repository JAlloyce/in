import { useState } from "react";
import { 
  HiSearch, HiPlus, HiX, HiPhotograph, HiGlobe, 
  HiLocationMarker, HiPhone, HiMail, HiClock,
  HiStar, HiHeart, HiShare, HiEye, HiTrendingUp
} from "react-icons/hi";
import { FaBuilding, FaStore, FaGraduationCap, FaHospital } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Pages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pageForm, setPageForm] = useState({
    name: "",
    category: "",
    description: "",
    website: "",
    phone: "",
    email: "",
    address: "",
    hours: "",
    coverImage: null,
    profileImage: null
  });
  const [createdPages, setCreatedPages] = useState([]);
  
  const followedPages = [
    { 
      id: 1, 
      name: "TechCorp", 
      category: "Software Development", 
      followers: "125K",
      isOwned: false,
      posts: 245,
      engagement: "High",
      verified: true
    },
    { 
      id: 2, 
      name: "DesignHub", 
      category: "Design Services", 
      followers: "87K",
      isOwned: true,
      posts: 189,
      engagement: "Medium",
      verified: false
    },
    { 
      id: 3, 
      name: "CloudSolutions", 
      category: "Cloud Computing", 
      followers: "64K",
      isOwned: false,
      posts: 156,
      engagement: "High",
      verified: true
    },
  ];
  
  const suggestedPages = [
    { id: 4, name: "DataTech", category: "Data Analytics", followers: "42K" },
    { id: 5, name: "EcoEnergy", category: "Renewable Energy", followers: "38K" },
    { id: 6, name: "HealthInnovate", category: "Healthcare", followers: "56K" },
    { id: 7, name: "FinTech Global", category: "Financial Services", followers: "91K" },
    { id: 8, name: "LogiChain", category: "Supply Chain", followers: "27K" },
  ];

  const pageCategories = [
    { value: "business", label: "Business", icon: FaBuilding },
    { value: "retail", label: "Retail & Shopping", icon: FaStore },
    { value: "education", label: "Education", icon: FaGraduationCap },
    { value: "healthcare", label: "Healthcare", icon: FaHospital },
    { value: "technology", label: "Technology", icon: FaBuilding },
    { value: "nonprofit", label: "Non-Profit", icon: HiHeart },
    { value: "entertainment", label: "Entertainment", icon: HiStar },
    { value: "other", label: "Other", icon: FaBuilding }
  ];

  const filteredPages = suggestedPages.filter(page => 
    page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreatePage = () => {
    if (!pageForm.name || !pageForm.category || !pageForm.description) {
      alert("Please fill in all required fields");
      return;
    }

    const newPage = {
      id: Date.now(),
      ...pageForm,
      followers: "0",
      isOwned: true,
      posts: 0,
      engagement: "New",
      verified: false,
      createdDate: new Date().toLocaleDateString()
    };

    setCreatedPages(prev => [newPage, ...prev]);
    setPageForm({
      name: "",
      category: "",
      description: "",
      website: "",
      phone: "",
      email: "",
      address: "",
      hours: "",
      coverImage: null,
      profileImage: null
    });
    setShowCreateModal(false);
    alert("Page created successfully!");
  };

  const allFollowedPages = [...followedPages, ...createdPages];

  const getCategoryIcon = (category) => {
    const categoryData = pageCategories.find(cat => cat.value === category);
    return categoryData ? categoryData.icon : FaBuilding;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Pages</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 mb-4 md:mb-0 transition-colors"
        >
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
        <h2 className="text-xl font-semibold mb-4">Your Pages</h2>
        {allFollowedPages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allFollowedPages.map(page => {
              const IconComponent = getCategoryIcon(page.category);
              return (
                <Link 
                  to={`/company/${page.id}`} 
                  key={page.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow relative"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{page.name}</h3>
                          {page.verified && (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{page.category}</p>
                        <p className="text-xs text-gray-500">{page.followers} followers</p>
                      </div>
                    </div>
                    {page.isOwned && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Owner
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center">
                        <HiEye className="w-4 h-4 mr-1" />
                        {page.posts} posts
                      </span>
                      <span className="flex items-center">
                        <HiTrendingUp className="w-4 h-4 mr-1" />
                        {page.engagement}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <FaBuilding className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No pages yet</h3>
            <p className="text-gray-500">Create or follow pages to see them here</p>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">
          {searchQuery ? "Search Results" : "Suggested Pages"}
        </h2>
        
        {filteredPages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-md font-medium transition-colors">
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

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Create Page</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Photo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <HiPhotograph className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Upload cover photo</p>
                    <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630 pixels</p>
                  </div>
                </div>

                {/* Profile Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Upload profile picture</p>
                    <p className="text-xs text-gray-500">Recommended: 400x400 pixels</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Page Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Name *
                    </label>
                    <input
                      type="text"
                      value={pageForm.name}
                      onChange={(e) => setPageForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your business name"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={pageForm.category}
                      onChange={(e) => setPageForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      {pageCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About *
                  </label>
                  <textarea
                    value={pageForm.description}
                    onChange={(e) => setPageForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell people about your business..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <HiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        value={pageForm.website}
                        onChange={(e) => setPageForm(prev => ({ ...prev, website: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <HiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={pageForm.phone}
                        onChange={(e) => setPageForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <HiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={pageForm.email}
                        onChange={(e) => setPageForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="contact@business.com"
                      />
                    </div>
                  </div>

                  {/* Hours */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Hours
                    </label>
                    <div className="relative">
                      <HiClock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={pageForm.hours}
                        onChange={(e) => setPageForm(prev => ({ ...prev, hours: e.target.value }))}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Mon-Fri 9AM-5PM"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <HiLocationMarker className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      value={pageForm.address}
                      onChange={(e) => setPageForm(prev => ({ ...prev, address: e.target.value }))}
                      rows={2}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="123 Business St, City, State 12345"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 