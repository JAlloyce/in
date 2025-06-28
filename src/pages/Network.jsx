import React, { useState, useEffect } from "react";
import { 
  HiUser, 
  HiUserGroup, 
  HiPlusCircle, 
  HiMagnifyingGlass,
  HiChevronDown, 
  HiEllipsisVertical,
  HiTrash, 
  HiFlag,
  HiOutlineExclamationTriangle,
  HiCheckCircle,
  HiXCircle,
  HiUserPlus,
  HiCalendarDays
} from 'react-icons/hi2';
import { Link } from "react-router-dom";
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

/**
 * Network Page - Real Database Connection Management
 * 
 * Features:
 * - Real connections from Supabase database
 * - Live connection suggestions
 * - Delete connection functionality
 * - Mobile-responsive design with real data
 * - Fixed authentication with useAuth hook
 */
export default function Network() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showConnectionMenu, setShowConnectionMenu] = useState(null);
  const [userConnections, setUserConnections] = useState([]);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load connections data when user is authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      initializeNetwork();
    } else if (!authLoading && !isAuthenticated) {
      setError('Please log in to view your network');
      setLoading(false);
    }
  }, [user, isAuthenticated, authLoading]);

  const initializeNetwork = async () => {
    try {
      setLoading(true);
      setError(null);

      // console.log('🌐 Loading network for user:', user.email);

      // Load connections, pending requests, and suggestions
      await Promise.all([
        loadConnections(user.id),
        loadPendingRequests(user.id),
        loadSuggestions(user.id)
      ]);

    } catch (err) {
      // console.error('Error loading network:', err);
      setError('Failed to load network data');
    } finally {
      setLoading(false);
    }
  };

  const loadConnections = async (userId) => {
    try {
      const { data: connectionsData, error: connectionsError } = await supabase
        .from('connections')
        .select(`
          id,
          created_at,
          requester:profiles!connections_requester_id_fkey(id, name, headline, avatar_url),
          receiver:profiles!connections_receiver_id_fkey(id, name, headline, avatar_url)
        `)
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'accepted')
        .limit(50);  // Limit to first 50 connections for performance
    
      if (connectionsError) {
        // console.error('Error loading connections:', connectionsError);
        setUserConnections([]); // Set empty array on error
        return;
      }

      // Transform the data to match our UI format
      const transformedConnections = connectionsData.map(conn => {
        if (!conn.requester || !conn.receiver) {
          // console.warn('Missing profile data for connection:', conn.id);
          return null;
        }
        const otherUser = conn.requester.id === userId ? conn.receiver : conn.requester;
        return {
          id: conn.id,
          userId: otherUser.id,
          name: otherUser.name || 'User',
          title: otherUser.headline || 'Professional',
          avatar_url: otherUser.avatar_url,
          connected: formatTimestamp(conn.created_at)
        };
      }).filter(Boolean);

      setUserConnections(transformedConnections);
      // console.log('✅ Loaded connections:', transformedConnections.length);
    } catch (err) {
      // console.error('Error in loadConnections:', err);
    }
  };

  const loadPendingRequests = async (userId) => {
    try {
      // Load pending requests received (incoming)
      const { data: receivedData, error: receivedError } = await supabase
        .from('connections')
        .select(`
          id,
          created_at,
          requester:profiles!connections_requester_id_fkey(id, name, headline, avatar_url)
        `)
        .eq('receiver_id', userId)
        .eq('status', 'pending');

      if (receivedError) {
        // console.error('Error loading received requests:', receivedError);
        setPendingReceived([]);
      } else {
        const transformedReceived = receivedData.map(conn => ({
          id: conn.id,
          userId: conn.requester.id,
          name: conn.requester.name || 'User',
          title: conn.requester.headline || 'Professional',
          avatar_url: conn.requester.avatar_url,
          requested: formatTimestamp(conn.created_at)
        }));
        setPendingReceived(transformedReceived);
        // console.log('✅ Loaded pending received:', transformedReceived.length);
      }

      // Load pending requests sent (outgoing)
      const { data: sentData, error: sentError } = await supabase
        .from('connections')
        .select(`
          id,
          created_at,
          receiver:profiles!connections_receiver_id_fkey(id, name, headline, avatar_url)
        `)
        .eq('requester_id', userId)
        .eq('status', 'pending');

      if (sentError) {
        // console.error('Error loading sent requests:', sentError);
        setPendingSent([]);
      } else {
        const transformedSent = sentData.map(conn => ({
          id: conn.id,
          userId: conn.receiver.id,
          name: conn.receiver.name || 'User',
          title: conn.receiver.headline || 'Professional',
          avatar_url: conn.receiver.avatar_url,
          requested: formatTimestamp(conn.created_at)
        }));
        setPendingSent(transformedSent);
        // console.log('✅ Loaded pending sent:', transformedSent.length);
      }
    } catch (err) {
      // console.error('Error in loadPendingRequests:', err);
    }
  };

  const loadSuggestions = async (userId) => {
    try {
      // Get users who are not connected to the current user
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('profiles')
        .select('id, name, headline, avatar_url')
        .neq('id', userId)
        .limit(10);  // Reduce limit for faster loading
    
      if (suggestionsError) {
        // console.error('Error loading suggestions:', suggestionsError);
        setSuggestions([]); // Set empty array on error
        return;
      }

      // Get current user's connection IDs for filtering
      const { data: existingConnections } = await supabase
        .from('connections')
        .select('requester_id, receiver_id')
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
        .in('status', ['accepted', 'pending']);

      const existingConnectionIds = new Set();
      if (existingConnections) {
        existingConnections.forEach(conn => {
          existingConnectionIds.add(conn.requester_id === userId ? conn.receiver_id : conn.requester_id);
        });
      }

      // Filter out existing connections
      const filteredSuggestions = suggestionsData.filter(
        profile => !existingConnectionIds.has(profile.id)
      );

      // Transform suggestions data
      const transformedSuggestions = filteredSuggestions.map(profile => ({
        id: profile.id,
        name: profile.name || 'User',
        title: profile.headline || 'Professional',
        avatar_url: profile.avatar_url,
        mutualConnections: 0 // TODO: Calculate mutual connections
      }));

      setSuggestions(transformedSuggestions);
      // console.log('✅ Loaded suggestions:', transformedSuggestions.length);
    } catch (err) {
      // console.error('Error in loadSuggestions:', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) > 1 ? 's' : ''} ago`;
  };

  const filteredSuggestions = suggestions.filter(person => 
    person.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    person.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteConnection = async (connectionId) => {
    if (!window.confirm("Are you sure you want to remove this connection?")) return;

    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);
      if (error) {
        // console.error('Error removing connection:', error);
        showError('Failed to remove connection');
        return;
      }

      // Remove from local state
      setUserConnections(prev => prev.filter(conn => conn.id !== connectionId));
      setShowConnectionMenu(null);
      showSuccess('Connection removed successfully');
    } catch (err) {
      // console.error('Error removing connection:', err);
      showError('Failed to remove connection');
    }
  };

  const handleAcceptConnection = async (connectionId, senderId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) {
        // console.error('Error accepting connection:', error);
        showError('Failed to accept connection');
        return;
      }

      // Move from pending to connections
      const acceptedRequest = pendingReceived.find(req => req.id === connectionId);
      if (acceptedRequest) {
        setUserConnections(prev => [...prev, { ...acceptedRequest, connected: 'Just now' }]);
        setPendingReceived(prev => prev.filter(req => req.id !== connectionId));
      }
      showSuccess('Connection request accepted!');
    } catch (err) {
      // console.error('Error in handleAcceptConnection:', err);
      showError('Failed to accept connection');
    }
  };

  const handleRejectConnection = async (connectionId) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) {
        // console.error("Error ignoring connection:", error);
        showError('Failed to ignore connection');
        return;
      }
      
      setPendingReceived(prev => prev.filter(req => req.id !== connectionId));
      showSuccess('Connection request ignored');
    } catch (err) {
      // console.error('Error in handleRejectConnection:', err);
      showError('Failed to ignore connection');
    }
  };

  const handleSendConnectionRequest = async (receiverId) => {
    if (!user) {
      showError("You must be logged in to send connection requests.");
      return;
    }
    
    // Check for duplicate requests to prevent errors
    const isAlreadyConnected = userConnections.some(c => c.userId === receiverId);
    const isAlreadySent = pendingSent.some(s => s.userId === receiverId);
    const isAlreadyReceived = pendingReceived.some(r => r.userId === receiverId);
    
    if (isAlreadyConnected || isAlreadySent || isAlreadyReceived) {
      showWarning("You're already connected or have a pending request with this user.");
      return;
    }

    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });
      
      if (error) {
        // console.error('Error creating connection request:', error);
        showError('Failed to send connection request. Please try again.');
        return;
      }

      // Optimistically add to pending sent list
      const suggestion = suggestions.find(s => s.id === receiverId);
      if (suggestion) {
        const newSentRequest = {
          id: `temp-${Date.now()}`,
          userId: suggestion.id,
          name: suggestion.name,
          title: suggestion.title,
          avatar_url: suggestion.avatar_url,
          requested: 'Just now'
        };
        setPendingSent(prev => [...prev, newSentRequest]);
      }
      
      setSuggestions(prev => prev.filter(s => s.id !== receiverId)); // Remove from suggestions
      showSuccess('Connection request sent!');
      // console.log('✅ Connection request created successfully');

    } catch (err) {
      // console.error('Error sending connection request:', err);
      showError('An unexpected error occurred. Please try again.');
    }
  };

  const ConnectionCard = ({ connection }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow relative">
      <div className="flex items-center space-x-3">
        <Link 
          to={`/profile/${connection.userId}`}
          className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 hover:ring-2 hover:ring-blue-300 transition-all overflow-hidden"
          title={`View ${connection.name}'s profile`}
        >
          {connection.avatar_url ? (
            <img 
              src={connection.avatar_url} 
              alt={connection.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-semibold">
                {connection.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </Link>
        
        <Link 
          to={`/profile/${connection.userId}`}
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
            <HiEllipsisVertical className="w-5 h-5" />
          </button>
          
          {showConnectionMenu === connection.id && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowConnectionMenu(null)}
              />
              
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
                <Link
                  to={`/profile/${connection.userId}`}
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
                    showSuccess(`Reported ${connection.name}`);
                    setShowConnectionMenu(null);
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

  if (loading) {
    return (
      <div className="space-y-6 bg-purple-50 min-h-screen p-4 rounded-lg">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your network...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 bg-purple-50 min-h-screen p-4 rounded-lg">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={initializeNetwork}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
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
          <h2 className="text-xl font-semibold">Your Connections ({userConnections.length})</h2>
          <button 
            onClick={() => loadConnections(user?.id)}
            className="text-blue-600 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
        
        <div className="space-y-4">
          {userConnections.length > 0 ? (
            userConnections.map(connection => (
              <ConnectionCard key={connection.id} connection={connection} />
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <HiUserGroup className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No connections yet</h3>
              <p className="text-gray-500">Start connecting with professionals below</p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Requests Received Section */}
      {pendingReceived.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Connection Requests ({pendingReceived.length})</h2>
            <button 
              onClick={() => loadPendingRequests(user?.id)}
              className="text-blue-600 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
          
          <div className="space-y-4">
            {pendingReceived.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <Link 
                    to={`/profile/${request.userId}`}
                    className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 hover:ring-2 hover:ring-blue-300 transition-all overflow-hidden"
                  >
                    {request.avatar_url ? (
                      <img 
                        src={request.avatar_url} 
                        alt={request.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {request.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/profile/${request.userId}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 truncate">{request.name}</h3>
                      <p className="text-sm text-gray-600 truncate mb-1">{request.title}</p>
                      <p className="text-xs text-gray-500">Sent {request.requested}</p>
                    </Link>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAcceptConnection(request.id, request.userId)}
                      className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectConnection(request.id)}
                      className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Requests Sent Section */}
      {pendingSent.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Pending Invitations ({pendingSent.length})</h2>
            <button 
              onClick={() => loadPendingRequests(user?.id)}
              className="text-blue-600 text-sm font-medium"
            >
              Refresh
            </button>
          </div>
          
          <div className="space-y-4">
            {pendingSent.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-center space-x-3">
                  <Link 
                    to={`/profile/${request.userId}`}
                    className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 hover:ring-2 hover:ring-blue-300 transition-all overflow-hidden"
                  >
                    {request.avatar_url ? (
                      <img 
                        src={request.avatar_url} 
                        alt={request.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {request.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/profile/${request.userId}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      <h3 className="font-semibold text-gray-900 truncate">{request.name}</h3>
                      <p className="text-sm text-gray-600 truncate mb-1">{request.title}</p>
                      <p className="text-xs text-gray-500">Invitation sent {request.requested}</p>
                    </Link>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-yellow-600 font-medium">Pending</span>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Suggestions Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {searchQuery ? "Search Results" : "People You May Know"}
          </h2>
          <button 
            onClick={() => loadSuggestions(user?.id)}
            className="text-blue-600 text-sm font-medium"
          >
            Refresh
          </button>
        </div>
        
        {filteredSuggestions.length > 0 ? (
          <div className="space-y-4">
            {filteredSuggestions.map((person) => (
              <div key={person.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 overflow-hidden">
                    {person.avatar_url ? (
                      <img 
                        src={person.avatar_url} 
                        alt={person.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-semibold">
                          {person.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{person.name}</h3>
                    <p className="text-sm text-gray-600 truncate mb-1">{person.title}</p>
                    <p className="text-xs text-gray-500 mb-3">{person.mutualConnections} mutual connections</p>
                    <button 
                      onClick={() => handleSendConnectionRequest(person.id)}
                      className="bg-blue-600 text-white py-1.5 px-4 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
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
            <span className="text-xl font-bold text-blue-600">{userConnections.length}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <HiUserPlus className="w-6 h-6 text-green-600" />
              <span className="font-medium">Suggestions</span>
            </div>
            <span className="text-xl font-bold text-green-600">{suggestions.length}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <HiCalendarDays className="w-6 h-6 text-purple-600" />
              <span className="font-medium">Events</span>
            </div>
            <span className="text-xl font-bold text-purple-600">3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
