import { useState, useEffect } from "react";
import { 
  HiSearch, HiUserGroup, HiPlus, HiX, HiPhotograph, 
  HiGlobe, HiLockClosed, HiEyeOff, HiUsers, HiChat,
  HiBookOpen, HiCog, HiFlag
} from "react-icons/hi";
import { Link } from "react-router-dom";
import { communities, auth } from '../lib/supabase';

export default function Communities() {
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
  const [user, setUser] = useState(null);
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
    initializeCommunities();
  }, []);

  const initializeCommunities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { session } = await auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        // Load joined communities
        await loadJoinedCommunities(session.user.id);
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
    const { data: joinedData, error: joinedError } = await communities.getJoined(userId);
    
    if (joinedError) {
      console.error('Error loading joined communities:', joinedError);
      return;
    }

    // Transform joined communities data
    const transformedJoined = joinedData.map(membership => ({
      id: membership.community.id,
      name: membership.community.name,
      members: `${membership.community.member_count || 0}`,
      description: membership.community.description,
      category: "Community",
      privacy: "public",
      isAdmin: false, // We'd need to check if user is admin
              posts: 0, // Communities table doesn't exist yet
      activity: "Active"
    }));

    setJoinedCommunities(transformedJoined);
  };

  const loadSuggestedCommunities = async () => {
    const { data: suggestedData, error: suggestedError } = await communities.getSuggested(20);
    
    if (suggestedError) {
      console.error('Error loading suggested communities:', suggestedError);
      return;
    }

    // Transform suggested communities data
    const transformedSuggested = suggestedData.map(community => ({
      id: community.id,
      name: community.name,
      members: `${community.member_count || 0}`,
      description: community.description,
      category: "Community"
    }));

    setSuggestedCommunities(transformedSuggested);
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
      const { data: newCommunity, error } = await communities.create({
        name: communityForm.name,
        description: communityForm.description,
        category: communityForm.category,
        rules: communityForm.rules,
        is_active: true
      }, user.id);

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
        privacy: "public", // Default since privacy_level doesn't exist in DB
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
      const { error } = await communities.join(communityId, user.id);
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
          posts: 0, // Communities table doesn't exist yet
          activity: "Active"
        }, ...prev]);
      }

      alert('Successfully joined community!');
    } catch (err) {
      console.error('Error joining community:', err);
      alert('Failed to join community');
    }
  };

  const allJoinedCommunities = [...joinedCommunities, ...createdCommunities];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading communities...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={initializeCommunities}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
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
          className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-full font-medium hover:bg-purple-700 mb-4 md:mb-0 transition-colors"
        >
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
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
        />
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Communities</h2>
          <button 
            onClick={() => user && loadJoinedCommunities(user.id)}
            className="text-purple-600 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
        {allJoinedCommunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allJoinedCommunities.map(community => (
              <Link 
                to={`/community/${community.id}`} 
                key={community.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                      <HiUserGroup className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{community.name}</h3>
                      <p className="text-sm text-gray-600">{community.members} members</p>
                    </div>
                  </div>
                  {community.isAdmin && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-500 mb-3">{community.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center">
                      <HiChat className="w-4 h-4 mr-1" />
                      {community.posts} posts
                    </span>
                    <span className="flex items-center">
                      {community.privacy === 'public' && <HiGlobe className="w-4 h-4 mr-1" />}
                      {community.privacy === 'private' && <HiLockClosed className="w-4 h-4 mr-1" />}
                      {community.privacy === 'secret' && <HiEyeOff className="w-4 h-4 mr-1" />}
                      {community.privacy}
                    </span>
                  </div>
                  <span className="text-green-600">{community.activity}</span>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {searchQuery ? "Search Results" : "Discover Communities"}
          </h2>
          <button 
            onClick={() => loadSuggestedCommunities()}
            className="text-purple-600 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
        
        {filteredCommunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCommunities.map(community => (
              <div key={community.id} className="border rounded-lg p-4 hover:shadow-md">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <HiUserGroup className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">{community.name}</h3>
                    <p className="text-sm text-gray-500">{community.members} members</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{community.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {community.category}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleJoinCommunity(community.id);
                    }}
                    className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-md font-medium text-sm transition-colors"
                  >
                    Join
                  </button>
                </div>
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

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Create Community</h2>
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
                    Community Cover Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <HiPhotograph className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload cover image</p>
                    <p className="text-xs text-gray-500 mt-1">Recommended: 1200x630 pixels</p>
                  </div>
                </div>

                {/* Community Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Community Name *
                  </label>
                  <input
                    type="text"
                    value={communityForm.name}
                    onChange={(e) => setCommunityForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter community name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={communityForm.description}
                    onChange={(e) => setCommunityForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Describe what this community is about..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={communityForm.category}
                    onChange={(e) => setCommunityForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Privacy Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Privacy Settings
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="privacy"
                        value="public"
                        checked={communityForm.privacy === 'public'}
                        onChange={(e) => setCommunityForm(prev => ({ ...prev, privacy: e.target.value }))}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <HiGlobe className="w-5 h-5 text-green-600 mr-2" />
                        <div>
                          <p className="font-medium">Public</p>
                          <p className="text-sm text-gray-500">Anyone can see posts and members</p>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="privacy"
                        value="private"
                        checked={communityForm.privacy === 'private'}
                        onChange={(e) => setCommunityForm(prev => ({ ...prev, privacy: e.target.value }))}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <HiLockClosed className="w-5 h-5 text-yellow-600 mr-2" />
                        <div>
                          <p className="font-medium">Private</p>
                          <p className="text-sm text-gray-500">Only members can see posts</p>
                        </div>
                      </div>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="privacy"
                        value="secret"
                        checked={communityForm.privacy === 'secret'}
                        onChange={(e) => setCommunityForm(prev => ({ ...prev, privacy: e.target.value }))}
                        className="mr-3"
                      />
                      <div className="flex items-center">
                        <HiEyeOff className="w-5 h-5 text-red-600 mr-2" />
                        <div>
                          <p className="font-medium">Secret</p>
                          <p className="text-sm text-gray-500">Only invited members can find and join</p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Community Rules */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Community Rules (Optional)
                  </label>
                  <textarea
                    value={communityForm.rules}
                    onChange={(e) => setCommunityForm(prev => ({ ...prev, rules: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Set community guidelines and rules..."
                  />
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
                onClick={handleCreateCommunity}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Community
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 