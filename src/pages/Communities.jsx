import { useState, useEffect } from "react";
import { 
  HiSearch, HiUserGroup, HiPlus, HiX, HiPhotograph, 
  HiGlobe, HiLockClosed, HiEyeOff, HiUsers, HiChat,
  HiBookOpen, HiCog, HiFlag
} from "react-icons/hi";
import { Link } from "react-router-dom";
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Communities() {
  const { user, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [communityForm, setCommunityForm] = useState({
    name: "",
    description: "",
    category: "",
    privacy: "public", // public, private, secret
    rules: "",
    coverImage: null
  });
  const [createdCommunities, setCreatedCommunities] = useState([]);
  
  // Real data states
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [suggestedCommunities, setSuggestedCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const categories = [
    "Technology", "Business", "Marketing", "Design", "Healthcare", 
    "Education", "Finance", "Entertainment", "Sports", "Travel", "Other"
  ];

  // Initialize communities
  useEffect(() => {
    if (!authLoading) {
      initializeCommunities();
    }
  }, [authLoading]);

  const initializeCommunities = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user) {
        // Load joined communities
        await loadJoinedCommunities(user.id);
      }

      // Load suggested communities
      await loadSuggestedCommunities();

    } catch (err) {
      console.error('Error initializing communities:', err);
      setError('Failed to load communities');
    } finally {
      setLoading(false);
    }
  };

  const loadJoinedCommunities = async (userId) => {
    try {
      const { data: joinedData, error: joinedError } = await supabase
        .from('community_members')
        .select(`
          *,
          community:communities (
            id,
            name,
            description,
            category,
            member_count
          )
        `)
        .eq('user_id', userId);
      
      if (joinedError) {
        console.error('Error loading joined communities:', joinedError);
        return;
      }

      // Transform joined communities data
      const transformedJoined = (joinedData || []).map(membership => ({
        id: membership.community?.id,
        name: membership.community?.name || 'Unknown Community',
        members: `${membership.community?.member_count || 0}`,
        description: membership.community?.description || 'No description available',
        category: membership.community?.category || "Community",
        privacy: "public",
        isAdmin: false,
        posts: 0,
        activity: "Active"
      }));

      setJoinedCommunities(transformedJoined);
    } catch (err) {
      console.error('Error loading joined communities:', err);
    }
  };

  const loadSuggestedCommunities = async () => {
    try {
      const { data: suggestedData, error: suggestedError } = await supabase
        .from('communities')
        .select('*')
        .eq('is_active', true)
        .order('member_count', { ascending: false })
        .limit(20);
      
      if (suggestedError) {
        console.error('Error loading suggested communities:', suggestedError);
        return;
      }

      // Transform suggested communities data
      const transformedSuggested = (suggestedData || []).map(community => ({
        id: community.id,
        name: community.name || 'Unknown Community',
        members: `${community.member_count || 0}`,
        description: community.description || 'No description available',
        category: community.category || "Community"
      }));

      setSuggestedCommunities(transformedSuggested);
    } catch (err) {
      console.error('Error loading suggested communities:', err);
    }
  };

  const filteredCommunities = suggestedCommunities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCommunity = async () => {
    if (!communityForm.name || !communityForm.description || !communityForm.category) {
      alert("Please fill in all required fields");
      return;
    }

    if (!user) {
      alert('Please log in to create communities');
      return;
    }

    try {
      const { data: newCommunity, error } = await supabase
        .from('communities')
        .insert({
          name: communityForm.name,
          description: communityForm.description,
          category: communityForm.category,
          rules: communityForm.rules,
          is_active: true,
          admin_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating community:', error);
        alert('Failed to create community');
        return;
      }

      // Add to local state
      const localCommunity = {
        id: newCommunity.id,
        name: newCommunity.name,
        members: "1",
        description: newCommunity.description,
        category: newCommunity.category,
        privacy: "public",
        isAdmin: true,
        posts: 0,
        activity: "New",
        createdDate: new Date().toLocaleDateString()
      };

      setCreatedCommunities(prev => [localCommunity, ...prev]);
      setCommunityForm({
        name: "",
        description: "",
        category: "",
        privacy: "public",
        rules: "",
        coverImage: null
      });
      setShowCreateModal(false);
      alert("Community created successfully!");
    } catch (err) {
      console.error('Error creating community:', err);
      alert('Failed to create community');
    }
  };

  const handleJoinCommunity = async (communityId) => {
    if (!user) {
      alert('Please log in to join communities');
      return;
    }

    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: user.id,
          role: 'member'
        });

      if (error) {
        console.error('Error joining community:', error);
        alert('Failed to join community');
        return;
      }

      // Move from suggested to joined
      const community = suggestedCommunities.find(c => c.id === communityId);
      if (community) {
        setSuggestedCommunities(prev => prev.filter(c => c.id !== communityId));
        setJoinedCommunities(prev => [{
          ...community,
          isAdmin: false,
          posts: 0,
          activity: "Active"
        }, ...prev]);
      }

      alert('Successfully joined community!');
    } catch (err) {
      console.error('Error joining community:', err);
      alert('Failed to join community');
    }
  };

  // Loading State
  if (authLoading || loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-40 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <HiUserGroup className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Communities</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={initializeCommunities}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Not Authenticated State
  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <HiUserGroup className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Join Communities</h3>
          <p className="text-gray-600 mb-4">Sign in to discover and join professional communities</p>
          <Link to="/auth" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Communities</h1>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-full font-medium hover:bg-blue-700 mb-4 md:mb-0 transition-colors"
        >
          <HiPlus className="w-5 h-5 mr-1" />
          Create Community
        </button>
      </div>

      {/* Search Bar */}
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

      {/* Joined Communities */}
      {joinedCommunities.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Communities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinedCommunities.map(community => (
              <Link to={`/communities/${community.id}`} key={community.id} className="block border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <HiUserGroup className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{community.name}</h3>
                      <p className="text-sm text-gray-600">{community.members} members</p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{community.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{community.category}</span>
                  <span className="text-xs text-green-600">{community.activity}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Communities */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {joinedCommunities.length > 0 ? 'Discover More Communities' : 'Suggested Communities'}
        </h2>
        
        {filteredCommunities.length === 0 ? (
          <div className="text-center py-12">
            <HiUserGroup className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {suggestedCommunities.length === 0 ? 'No Communities Yet' : 'No Results Found'}
            </h3>
            <p className="text-gray-600 mb-4">
              {suggestedCommunities.length === 0 
                ? 'Be the first to create a community!' 
                : 'Try adjusting your search terms'}
            </p>
            {suggestedCommunities.length === 0 && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create First Community
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCommunities.map(community => (
              <Link to={`/communities/${community.id}`} key={community.id} className="block border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <HiUserGroup className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{community.name}</h3>
                      <p className="text-sm text-gray-600">{community.members} members</p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{community.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{community.category}</span>
                  <button 
                    onClick={() => handleJoinCommunity(community.id)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Join
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Create Community</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <HiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    value={communityForm.name}
                    onChange={(e) => setCommunityForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter community name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={communityForm.category}
                    onChange={(e) => setCommunityForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={communityForm.description}
                    onChange={(e) => setCommunityForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what your community is about"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Community Rules
                  </label>
                  <textarea
                    value={communityForm.rules}
                    onChange={(e) => setCommunityForm(prev => ({ ...prev, rules: e.target.value }))}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional: Set community guidelines"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleCreateCommunity}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Create Community
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 