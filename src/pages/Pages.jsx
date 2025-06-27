import { useState, useEffect } from "react";
import { 
  HiSearch, HiPlus, HiX, HiPhotograph, HiGlobe, 
  HiLocationMarker, HiPhone, HiMail, HiClock,
  HiStar, HiHeart, HiShare, HiEye, HiTrendingUp,
  HiOfficeBuilding, HiUserGroup, HiBadgeCheck
} from "react-icons/hi";
import { FaBuilding, FaStore, FaGraduationCap, FaHospital } from "react-icons/fa";
import { Link } from "react-router-dom";
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Pages Component - Modern Company/Organization Directory
 * 
 * Features:
 * - Real company/page data from Supabase
 * - Create new company pages with database persistence
 * - Follow/unfollow functionality
 * - Search companies with database queries
 * - Authentication protection
 * - Modern, responsive UI design
 * - Loading states and error handling
 */
export default function Pages() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followedPages, setFollowedPages] = useState([]);
  const [suggestedPages, setSuggestedPages] = useState([]);
  const [filteredPages, setFilteredPages] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [pageForm, setPageForm] = useState({
    name: "",
    industry: "",
    description: "",
    website: "",
    phone: "",
    email: "",
    location: "",
    business_hours: "",
    logo_url: "",
    cover_image_url: ""
  });

  const pageCategories = [
    { value: "technology", label: "Technology", icon: FaBuilding },
    { value: "retail", label: "Retail & Shopping", icon: FaStore },
    { value: "education", label: "Education", icon: FaGraduationCap },
    { value: "healthcare", label: "Healthcare", icon: FaHospital },
    { value: "finance", label: "Finance & Banking", icon: FaBuilding },
    { value: "nonprofit", label: "Non-Profit", icon: HiHeart },
    { value: "entertainment", label: "Entertainment", icon: HiStar },
    { value: "manufacturing", label: "Manufacturing", icon: FaBuilding },
    { value: "consulting", label: "Consulting", icon: FaBuilding },
    { value: "other", label: "Other", icon: FaBuilding }
  ];

  // Initialize and load data
  useEffect(() => {
    if (!authLoading) {
      const initializeData = async () => {
        try {
          setLoading(true);
          
          if (user) {
            await loadUserPages(user.id);
          }
          
          await loadSuggestedPages();
        } catch (err) {
          console.error('Error initializing:', err);
          setError('Failed to load page data');
        } finally {
          setLoading(false);
        }
      };

      initializeData();
    }
  }, [user, authLoading]);

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (searchQuery.length > 0) {
        try {
          const { data, error } = await supabase
            .from('companies')
            .select('*')
            .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,industry.ilike.%${searchQuery}%`)
            .limit(20);
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
      const { data, error } = await supabase
        .from('company_followers')
        .select(`
          *,
          companies (
            id,
            name,
            description,
            industry,
            logo_url,
            follower_count,
            verified,
            location,
            website,
            created_by
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error loading user pages:', error);
        setFollowedPages([]);
        return;
      }
      
      setFollowedPages(data || []);
    } catch (err) {
      console.error('Error loading user pages:', err);
      setFollowedPages([]);
    }
  };

  const loadSuggestedPages = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);
      
      if (!error) {
        // Add follower count from the database
        const companiesWithCounts = (data || []).map(company => ({
          ...company,
          follower_count: company.follower_count || 0
        }));
        setSuggestedPages(companiesWithCounts);
        setFilteredPages(companiesWithCounts);
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

    if (!pageForm.name || !pageForm.industry || !pageForm.description) {
      setError("Please fill in all required fields (Name, Industry, Description)");
      return;
    }

    try {
      setCreating(true);
      setError('');

      const newCompany = {
        name: pageForm.name.trim(),
        description: pageForm.description.trim(),
        website: pageForm.website?.trim() || null,
        location: pageForm.location?.trim() || null,
        industry: pageForm.industry,
        phone: pageForm.phone?.trim() || null,
        email: pageForm.email?.trim() || null,
        business_hours: pageForm.business_hours?.trim() || null,
        logo_url: null, // Remove placeholder URL
        cover_image_url: null,
        verified: false,
        follower_count: 0,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('companies')
        .insert(newCompany)
        .select()
        .single();
      
      if (error) {
        console.error('Database error:', error);
        setError(error.message);
        return;
      }

      if (data) {
        // Automatically follow the created company
        await handleFollowPage(data.id);
        
        // Reset form and close modal
        setPageForm({
          name: "",
          industry: "",
          description: "",
          website: "",
          phone: "",
          email: "",
          location: "",
          business_hours: "",
          logo_url: "",
          cover_image_url: ""
        });
        setShowCreateModal(false);
        setError('');
        
        // Refresh data
        await loadSuggestedPages();
        console.log('✅ Page created successfully:', data.name);
      }
    } catch (err) {
      console.error('Error creating page:', err);
      setError('Failed to create page. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePage = async (companyId) => {
    if (!user) {
      setError('Please sign in to delete a page');
      return;
    }

    if (!window.confirm("Are you sure you want to delete this page? This action cannot be undone.")) {
        return;
    }

    try {
        await supabase
            .from('company_followers')
            .delete()
            .eq('company_id', companyId);

        const { error } = await supabase
            .from('companies')
            .delete()
            .eq('id', companyId)
            .eq('created_by', user.id); 

        if (error) {
            console.error('Error deleting page:', error);
            setError('Failed to delete page');
            return;
        }

        console.log('✅ Page deleted successfully');
        await loadUserPages(user.id);
        await loadSuggestedPages();
    } catch (err) {
        console.error('Error deleting page:', err);
        setError('Failed to delete page. Please try again.');
    }
  };

  const handleFollowPage = async (companyId) => {
    if (!user) {
      setError('Please sign in to follow pages');
      return;
    }

    try {
      const { error } = await supabase
        .from('company_followers')
        .insert({
          company_id: companyId,
          user_id: user.id
        });
      
      if (error) {
        console.error('Error following page:', error);
        setError('Failed to follow page');
        return;
      }
      
      // Update follower count
      await supabase.rpc('increment_follower_count', { p_company_id: companyId });
      
      await loadUserPages(user.id);
      await loadSuggestedPages();
      console.log('✅ Successfully followed company');
    } catch (err) {
      console.error('Error following page:', err);
      setError('Failed to follow page');
    }
  };

  const handleUnfollowPage = async (companyId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('company_followers')
        .delete()
        .eq('company_id', companyId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error unfollowing page:', error);
        setError('Failed to unfollow page');
        return;
      }
      
      // Update follower count
      await supabase.rpc('decrement_follower_count', { p_company_id: companyId });
      
      await loadUserPages(user.id);
      await loadSuggestedPages();
      console.log('✅ Successfully unfollowed company');
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
    return count?.toString() || '0';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded-lg w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Company Pages</h1>
              <p className="text-gray-600">Discover and follow companies in your industry</p>
            </div>
            <button 
              onClick={() => {
                if (!user) {
                  setError('Please sign in to create a page');
                  return;
                }
                setShowCreateModal(true);
              }}
              className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl mt-4 md:mt-0"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Create Company Page
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search companies by name, industry, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>

        {/* User's Followed Pages */}
        {user && followedPages.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <HiHeart className="w-6 h-6 mr-2 text-red-500" />
              Companies You Follow
            </h2>
            <div className="space-y-4">
              {followedPages.map(page => {
                const company = page.companies;
                const IconComponent = getCategoryIcon(company.industry);
                const isOwner = user && user.id === company.created_by;
                return (
                  <Link to={`/page/${company.id}`} key={company.id} className="block hover:bg-gray-50 rounded-xl p-4 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        {company.logo_url && company.logo_url !== 'https://via.placeholder.com/100' ? (
                          <img 
                            src={company.logo_url} 
                            alt={company.name}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          <IconComponent className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 truncate">{company.name}</h3>
                          {company.verified && (
                            <HiBadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 capitalize truncate">{company.industry}</p>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{company.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <p className="text-sm text-gray-500 flex items-center whitespace-nowrap">
                          <HiUserGroup className="w-4 h-4 mr-1" />
                          {formatFollowerCount(company.follower_count)} followers
                        </p>
                        {isOwner ? (
                          <button
                            onClick={(e) => { e.preventDefault(); handleDeletePage(company.id); }}
                            className="bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors font-medium"
                          >
                            Delete
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.preventDefault(); handleUnfollowPage(company.id); }}
                            className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                          >
                            Following
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Suggested/Search Results */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <HiTrendingUp className="w-6 h-6 mr-2 text-green-500" />
            {searchQuery ? "Search Results" : "Discover Companies"}
          </h2>
          
          {filteredPages.length > 0 ? (
            <div className="space-y-4">
              {filteredPages.map(company => {
                const IconComponent = getCategoryIcon(company.industry);
                const isFollowed = followedPages.some(p => p.companies.id === company.id);
                const isOwner = user && user.id === company.created_by;
                
                return (
                  <div key={company.id} className="border border-gray-200 rounded-xl p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <Link to={`/page/${company.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4 flex-shrink-0">
                          {company.logo_url && company.logo_url !== 'https://via.placeholder.com/100' ? (
                            <img 
                              src={company.logo_url} 
                              alt={company.name}
                              className="w-full h-full rounded-xl object-cover"
                            />
                          ) : (
                            <IconComponent className="w-8 h-8 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 truncate">{company.name}</h3>
                            {company.verified && (
                              <HiBadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 capitalize">{company.industry}</p>
                           <p className="text-sm text-gray-600 mt-1 line-clamp-2">{company.description}</p>
                        </div>
                      </Link>
                      
                      <div className="flex flex-col items-center gap-2 w-32 flex-shrink-0">
                        <p className="text-sm text-gray-500 flex items-center">
                          <HiUserGroup className="w-4 h-4 mr-1" />
                          {formatFollowerCount(company.follower_count)} followers
                        </p>
                        {user ? (
                          isOwner ? (
                            <button
                              onClick={(e) => { e.preventDefault(); handleDeletePage(company.id); }}
                              className="w-full py-2 rounded-lg font-semibold transition-all duration-200 bg-red-600 hover:bg-red-700 text-white text-sm"
                            >
                              Delete Page
                            </button>
                          ) : (
                            <button 
                              onClick={() => isFollowed ? handleUnfollowPage(company.id) : handleFollowPage(company.id)}
                              className={`w-full py-2 rounded-lg font-semibold transition-all duration-200 text-sm ${
                                isFollowed 
                                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
                                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                              }`}
                            >
                              {isFollowed ? 'Following' : 'Follow'}
                            </button>
                          )
                        ) : (
                          <button 
                            onClick={() => setError('Please sign in to follow pages')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
                          >
                            Follow
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <HiOfficeBuilding className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchQuery 
                  ? "No companies match your search criteria. Try different keywords." 
                  : "No companies available at the moment. Be the first to create one!"}
              </p>
            </div>
          )}
        </div>

        {/* Create Page Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
              <div className="flex justify-between items-center p-8 border-b border-gray-200">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Create Company Page</h2>
                  <p className="text-gray-600 mt-1">Tell the world about your company</p>
                </div>
                <button 
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                  }}
                  className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        value={pageForm.name}
                        onChange={(e) => setPageForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your company name"
                        required
                      />
                    </div>

                    {/* Industry */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Industry *
                      </label>
                      <select
                        value={pageForm.industry}
                        onChange={(e) => setPageForm(prev => ({ ...prev, industry: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select an industry</option>
                        {pageCategories.map(cat => (
                          <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Company Description *
                    </label>
                    <textarea
                      value={pageForm.description}
                      onChange={(e) => setPageForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Describe what your company does, its mission, and what makes it unique..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Website */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Website
                      </label>
                      <div className="relative">
                        <HiGlobe className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="url"
                          value={pageForm.website}
                          onChange={(e) => setPageForm(prev => ({ ...prev, website: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://yourcompany.com"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Phone Number
                      </label>
                      <div className="relative">
                        <HiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={pageForm.phone}
                          onChange={(e) => setPageForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Contact Email
                      </label>
                      <div className="relative">
                        <HiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={pageForm.email}
                          onChange={(e) => setPageForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="contact@company.com"
                        />
                      </div>
                    </div>

                    {/* Business Hours */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Business Hours
                      </label>
                      <div className="relative">
                        <HiClock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={pageForm.business_hours}
                          onChange={(e) => setPageForm(prev => ({ ...prev, business_hours: e.target.value }))}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Mon-Fri 9AM-5PM"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Company Location
                    </label>
                    <div className="relative">
                      <HiLocationMarker className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                      <textarea
                        value={pageForm.location}
                        onChange={(e) => setPageForm(prev => ({ ...prev, location: e.target.value }))}
                        rows={2}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123 Business Street, City, State, Country"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8 border-t border-gray-200 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                  }}
                  className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePage}
                  disabled={creating}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-3 font-semibold shadow-lg hover:shadow-xl"
                >
                  {creating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Company Page'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 