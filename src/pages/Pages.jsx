import { useState, useEffect } from "react";
import { 
  HiSearch, HiPlus, HiX, HiPhotograph, HiGlobe, 
  HiLocationMarker, HiPhone, HiMail, HiClock,
  HiStar, HiHeart, HiShare, HiEye, HiTrendingUp
} from "react-icons/hi";
import { FaBuilding, FaStore, FaGraduationCap, FaHospital } from "react-icons/fa";
import { Link } from "react-router-dom";
import { auth, companies } from '../lib/supabase';

/**
 * Pages Component - Real Database Integration
 * 
 * Features:
 * - Real company/page data from Supabase
 * - Create new company pages with database persistence
 * - Follow/unfollow functionality
 * - Search companies with database queries
 * - Authentication protection
 * - Loading states and error handling
 */
export default function Pages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followedPages, setFollowedPages] = useState([]);
  const [suggestedPages, setSuggestedPages] = useState([]);
  const [filteredPages, setFilteredPages] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [pageForm, setPageForm] = useState({
    name: "",
    category: "",
    description: "",
    website: "",
    phone: "",
    email: "",
    location: "",
    hours: "",
    coverImage: null,
    profileImage: null
  });

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

  // Initialize authentication and load data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { session, error } = await auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          setUser(null);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          await loadUserPages(session.user.id);
        } else {
          setUser(null);
        }
        
        await loadSuggestedPages();
      } catch (err) {
        console.error('Error initializing:', err);
        setError('Failed to load page data');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await loadUserPages(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setFollowedPages([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length > 0) {
        try {
          const { data, error } = await companies.search(searchQuery, '', 20);
          if (!error) {
            setFilteredPages(data || []);
          }
        } catch (err) {
          console.error('Search error:', err);
        }
      } else {
        setFilteredPages(suggestedPages);
      }
    };

    const debounce = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, suggestedPages]);

  const loadUserPages = async (userId) => {
    try {
      const { data, error } = await companies.getFollowed(userId);
      if (!error) {
        setFollowedPages(data || []);
      }
    } catch (err) {
      console.error('Error loading user pages:', err);
    }
  };

  const loadSuggestedPages = async () => {
    try {
      const { data, error } = await companies.getSuggested(10);
      if (!error) {
        setSuggestedPages(data || []);
        setFilteredPages(data || []);
      }
    } catch (err) {
      console.error('Error loading suggested pages:', err);
    }
  };

  const handleCreatePage = async () => {
    if (!user) {
      setError('Please sign in to create a page');
      return;
    }

    if (!pageForm.name || !pageForm.category || !pageForm.description) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setCreating(true);
      setError('');

      const newCompany = {
        name: pageForm.name,
        category: pageForm.category,
        description: pageForm.description,
        website: pageForm.website || null,
        phone: pageForm.phone || null,
        email: pageForm.email || null,
        location: pageForm.location || null,
        business_hours: pageForm.hours || null,
        logo_url: null, // Could handle file upload later
        cover_image_url: null, // Could handle file upload later
        verified: false
      };

      const { data, error } = await companies.create(newCompany, user.id);
      
      if (error) {
        setError(error.message);
        return;
      }

      if (data) {
        // Reload user pages to include the new one
        await loadUserPages(user.id);
        
        // Reset form and close modal
        setPageForm({
          name: "",
          category: "",
          description: "",
          website: "",
          phone: "",
          email: "",
          location: "",
          hours: "",
          coverImage: null,
          profileImage: null
        });
        setShowCreateModal(false);
        setError('');
        console.log('✅ Page created successfully:', data.name);
      }
    } catch (err) {
      console.error('Error creating page:', err);
      setError('Failed to create page. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleFollowPage = async (companyId) => {
    if (!user) {
      setError('Please sign in to follow pages');
      return;
    }

    try {
      const { error } = await companies.follow(companyId, user.id);
      if (!error) {
        await loadUserPages(user.id);
        console.log('✅ Successfully followed company');
      }
    } catch (err) {
      console.error('Error following page:', err);
      setError('Failed to follow page');
    }
  };

  const handleUnfollowPage = async (companyId) => {
    if (!user) return;

    try {
      const { error } = await companies.unfollow(companyId, user.id);
      if (!error) {
        await loadUserPages(user.id);
        console.log('✅ Successfully unfollowed company');
      }
    } catch (err) {
      console.error('Error unfollowing page:', err);
      setError('Failed to unfollow page');
    }
  };

  const getCategoryIcon = (category) => {
    const categoryData = pageCategories.find(cat => cat.value === category);
    return categoryData ? categoryData.icon : FaBuilding;
  };

  const formatFollowerCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Pages</h1>
        <button 
          onClick={() => {
            if (!user) {
              setError('Please sign in to create a page');
              return;
            }
            setShowCreateModal(true);
          }}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 mb-4 md:mb-0 transition-colors"
        >
          <HiPlus className="w-5 h-5 mr-1" />
          Create Page
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="relative mb-6">
        <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search companies and pages..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
      </div>

      {/* User's Followed Pages */}
      {user && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Pages</h2>
          {followedPages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followedPages.map(page => {
                const company = page.company;
                const IconComponent = getCategoryIcon(company.category);
                return (
                  <Link 
                    to={`/company/${company.id}`} 
                    key={company.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow relative"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          {company.logo_url ? (
                            <img 
                              src={company.logo_url} 
                              alt={company.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{company.name}</h3>
                            {company.verified && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{company.category}</p>
                          <p className="text-xs text-gray-500">
                            {formatFollowerCount(company.follower_count)} followers
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleUnfollowPage(company.id);
                        }}
                        className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full hover:bg-gray-200"
                      >
                        Following
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        {company.location && (
                          <span className="flex items-center">
                            <HiLocationMarker className="w-4 h-4 mr-1" />
                            {company.location}
                          </span>
                        )}
                        {company.website && (
                          <span className="flex items-center">
                            <HiGlobe className="w-4 h-4 mr-1" />
                            Website
                          </span>
                        )}
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
              <p className="text-gray-500">Follow pages to see them here</p>
            </div>
          )}
        </div>
      )}

      {/* Suggested/Search Results */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {searchQuery ? "Search Results" : "Suggested Pages"}
        </h2>
        
        {filteredPages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPages.map(company => {
              const IconComponent = getCategoryIcon(company.category);
              const isFollowed = followedPages.some(p => p.company.id === company.id);
              
              return (
                <div key={company.id} className="border rounded-lg p-4 hover:shadow-md">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={company.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{company.name}</h3>
                        {company.verified && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{company.category}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{company.description}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    {formatFollowerCount(company.follower_count)} followers
                  </p>
                  
                  {user ? (
                    <button 
                      onClick={() => isFollowed ? handleUnfollowPage(company.id) : handleFollowPage(company.id)}
                      className={`w-full py-2 rounded-md font-medium transition-colors ${
                        isFollowed 
                          ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      }`}
                    >
                      {isFollowed ? 'Following' : 'Follow'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => setError('Please sign in to follow pages')}
                      className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 rounded-md font-medium transition-colors"
                    >
                      Follow
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaBuilding className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No pages found</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? "No pages match your search" 
                : "No suggested pages available"}
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
                onClick={() => {
                  setShowCreateModal(false);
                  setError('');
                }}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Page Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={pageForm.name}
                      onChange={(e) => setPageForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your company name"
                      required
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
                      required
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
                    About Your Company *
                  </label>
                  <textarea
                    value={pageForm.description}
                    onChange={(e) => setPageForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell people about your company..."
                    required
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
                        placeholder="https://yourcompany.com"
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
                        placeholder="contact@company.com"
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

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <HiLocationMarker className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      value={pageForm.location}
                      onChange={(e) => setPageForm(prev => ({ ...prev, location: e.target.value }))}
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
                onClick={() => {
                  setShowCreateModal(false);
                  setError('');
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                disabled={creating}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  'Create Page'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 