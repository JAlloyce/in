import { useState, useRef, useEffect } from "react"
import { 
  HiSearch, HiPaperClip, HiEmojiHappy, HiMicrophone, 
  HiPaperAirplane, HiDotsVertical, HiOutlinePhone, 
  HiOutlineReply, HiOutlineDuplicate, HiX, HiOutlineUserCircle,
  HiFlag, HiEyeOff, HiLogin
} from "react-icons/hi"
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ErrorBoundary } from '../components/ui';
import { Link } from 'react-router-dom';

/**
 * Messaging Page Component - Real Database Communication Hub
 * 
 * Features:
 * - Real conversations from Supabase database
 * - Live message updates with real-time subscriptions
 * - Proper user authentication and message sending
 * - Mobile-responsive design with real data
 * - Fixed authentication with useAuth hook
 */
export default function Messaging() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [conversationMessages, setConversationMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);
  
  // Real-time subscription
  const [subscription, setSubscription] = useState(null);

  // Initialize messaging when user is authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      initializeMessaging();
    } else if (!authLoading && !isAuthenticated) {
      setError('Please log in to view messages');
      setLoading(false);
    }

    return () => {
      // Cleanup subscription
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [user, isAuthenticated, authLoading]);

  const initializeMessaging = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('💬 Loading messages for user:', user.email);
      
      // Load conversations
      await loadConversations(user.id);

    } catch (err) {
      console.error('Error initializing messaging:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async (userId) => {
    try {
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          id,
          updated_at,
          last_message,
          participant_1,
          participant_2
        `)
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('updated_at', { ascending: false });
    
      if (conversationsError) {
        // If table doesn't exist, show mock data
        if (conversationsError.code === '42P01') {
          console.log('Conversations table not found, showing sample data');
          setConversations(getMockConversations());
          return;
        }
        console.error('Error loading conversations:', conversationsError);
        setError('Failed to load conversations');
        return;
      }

      // For now, if we have data but no foreign key, we'll need to fetch profiles separately
      // or use mock data until the foreign keys are properly set up
      const transformedConversations = await Promise.all(
        conversationsData.map(async (conv) => {
          const otherParticipantId = conv.participant_1 === userId ? conv.participant_2 : conv.participant_1;
          
          // Try to get other participant's profile
          let otherParticipant = { id: otherParticipantId, name: 'User', headline: 'Professional', avatar_url: null };
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, name, headline, avatar_url')
              .eq('id', otherParticipantId)
              .single();
            
            if (profileData) {
              otherParticipant = profileData;
            }
          } catch (err) {
            console.log('Could not fetch participant profile:', err);
          }

          return {
            id: conv.id,
            name: otherParticipant.name || 'User',
            position: otherParticipant.headline || "Professional",
            company: "LinkedIn Member",
            lastMessage: conv.last_message || "No messages yet",
            time: formatTimestamp(conv.updated_at),
            unread: false, // TODO: Track read status
            avatar: otherParticipant.avatar_url,
            userId: otherParticipant.id
          };
        })
      );

      setConversations(transformedConversations);
      console.log('✅ Loaded conversations:', transformedConversations.length);
    } catch (err) {
      console.error('Error in loadConversations:', err);
      // Fallback to mock data
      setConversations(getMockConversations());
    }
  };

  const getMockConversations = () => {
    return [
      {
        id: 'mock-1',
        name: 'Sarah Chen',
        position: 'Senior Software Engineer',
        company: 'TechCorp',
        lastMessage: 'Thanks for connecting! Looking forward to chatting.',
        time: '2h',
        unread: true,
        avatar: null,
        userId: 'mock-user-1'
      },
      {
        id: 'mock-2',
        name: 'John Smith',
        position: 'Product Manager',
        company: 'StartupXYZ',
        lastMessage: 'The project looks great, let\'s discuss next week.',
        time: '1d',
        unread: false,
        avatar: null,
        userId: 'mock-user-2'
      },
      {
        id: 'mock-3',
        name: 'Emma Wilson',
        position: 'UX Designer',
        company: 'DesignHub',
        lastMessage: 'I\'d love to get your feedback on this design.',
        time: '3d',
        unread: true,
        avatar: null,
        userId: 'mock-user-3'
      }
    ];
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString();
  };

  const loadMessages = async (conversationId) => {
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        content,
        created_at
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      console.error('Error loading messages:', messagesError);
      return;
    }

    // Transform messages data
    const transformedMessages = messagesData.map(msg => ({
      id: msg.id,
      sender: msg.sender_id === user.id ? 'Me' : 'Other',
      content: msg.content,
      time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: msg.sender_id === user.id,
      senderId: msg.sender_id
    }));

    setConversationMessages(transformedMessages);
  };

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeConversation || !user) return;
    
    setSendingMessage(true);
    
    try {
      const { data: newMessage, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: activeConversation.id,
            sender_id: user.id,
            content: message
          }
        ])
        .select();
      
      if (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
        return;
      }

      // Add message to local state immediately
      const localMessage = {
        id: newMessage[0].id,
        sender: "Me",
        content: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
        senderId: user.id
      };

      setConversationMessages(prev => [...prev, localMessage]);
      setMessage("");
      
      // Reset reply if we were replying to a message
      if (replyingTo) {
        setReplyingTo(null);
      }

      // Update conversation's last message
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversation.id 
          ? { ...conv, lastMessage: message, time: "now" }
          : conv
      ));

    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const markAsRead = (id) => {
    setConversations(convs => 
      convs.map(conv => 
        conv.id === id ? { ...conv, unread: false } : conv
      )
    );
  };

  const openConversation = async (conversation) => {
    setActiveConversation(conversation);
    markAsRead(conversation.id);
    setShowModal(true);
    setReplyingTo(null);
    setShowMoreMenu(false);
    
    // Load messages for this conversation
    await loadMessages(conversation.id);
    
    // Set up real-time subscription for this conversation
    if (subscription) {
      subscription.unsubscribe();
    }
    
    const newSubscription = supabase
      .channel(`messages-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        (payload) => {
          if (payload.new.sender_id !== user.id) {
            const transformedMsg = {
              id: payload.new.id,
              sender: conversation.name,
              content: payload.new.content,
              time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isMe: false,
              senderId: payload.new.sender_id
            };
            setConversationMessages(prev => [...prev, transformedMsg]);
          }
        }
      )
      .subscribe();
    
    setSubscription(newSubscription);
  };

  const closeConversation = () => {
    setShowModal(false);
    setActiveConversation(null);
    setReplyingTo(null);
    setShowMoreMenu(false);
    setConversationMessages([]);
    
    // Unsubscribe from real-time updates
    if (subscription) {
      subscription.unsubscribe();
      setSubscription(null);
    }
  };

  const handleMessageAction = (message, action) => {
    setSelectedMessage(message);
    
    switch(action) {
      case 'reply':
        setReplyingTo(message);
        break;
      case 'copy':
        navigator.clipboard.writeText(message.content);
        alert('Message copied to clipboard!');
        break;
      default:
        break;
    }
  };

  const handleAudioCall = () => {
    alert(`Starting audio call with ${activeConversation.name}...`);
  };

  const handleReport = () => {
    alert(`Reported conversation with ${activeConversation.name}`);
    setShowMoreMenu(false);
  };

  const handleBlock = () => {
    if (window.confirm(`Are you sure you want to block ${activeConversation.name}?`)) {
      alert(`Blocked ${activeConversation.name}`);
      setShowMoreMenu(false);
      closeConversation();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show login prompt for non-authenticated users
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiLogin className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Your Messages</h2>
            <p className="text-gray-600 mb-6">
              Sign in to send and receive messages from your professional network.
            </p>
            <Link 
              to="/"
              className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Sign In to Continue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-[calc(100vh-150px)] max-h-screen bg-blue-50 p-4 rounded-lg">
        <div className="w-full bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your messages...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[calc(100vh-150px)] max-h-screen bg-blue-50 p-4 rounded-lg">
        <div className="w-full bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={initializeMessaging}
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
    <div className="flex flex-col h-[calc(100vh-150px)] max-h-screen bg-blue-50 p-4 rounded-lg">
      {/* Conversations List */}
      <div className="w-full bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Messages</h2>
            <button 
              onClick={() => loadConversations(user?.id)}
              className="p-2 rounded-full hover:bg-gray-100"
              title="Refresh conversations"
            >
              <HiDotsVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="p-3 border-b">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                className={`p-4 border-b hover:bg-gray-50 cursor-pointer flex items-center ${
                  activeConversation?.id === conversation.id ? "bg-blue-50" : ""
                }`}
                onClick={() => openConversation(conversation)}
              >
                <div className="relative mr-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-lg flex-shrink-0 overflow-hidden">
                    {conversation.avatar ? (
                      <img 
                        src={conversation.avatar} 
                        alt={conversation.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      conversation.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  {conversation.unread && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold truncate">{conversation.name}</h3>
                    <span className="text-xs text-gray-500 ml-2">{conversation.time}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {conversation.position} at {conversation.company}
                  </p>
                  <p className={`text-sm truncate mt-1 ${
                    conversation.unread ? "text-gray-900 font-medium" : "text-gray-500"
                  }`}>
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <HiOutlineUserCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No conversations</h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? "No conversations match your search" 
                  : "Start networking to begin conversations"}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Conversation Modal */}
      {showModal && activeConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col">
            {/* Chat Header */}
            <div className="p-3 sm:p-4 border-b flex justify-between items-center">
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold mr-3 flex-shrink-0 overflow-hidden">
                  {activeConversation.avatar ? (
                    <img 
                      src={activeConversation.avatar} 
                      alt={activeConversation.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    activeConversation.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center">
                    <h3 className="font-semibold truncate text-sm sm:text-base">{activeConversation.name}</h3>
                    <a 
                      href={`/profile/${activeConversation.userId}`} 
                      className="ml-2 text-blue-500 hover:text-blue-700 flex-shrink-0"
                      title="View profile"
                    >
                      <HiOutlineUserCircle className="w-5 h-5" />
                    </a>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {activeConversation.position} at {activeConversation.company}
                  </p>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center space-x-1 ml-2">
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={handleAudioCall}
                  title="Audio call"
                >
                  <HiOutlinePhone className="w-5 h-5 text-gray-600" />
                </button>
                
                {/* 3 dots menu */}
                <div className="relative">
                  <button 
                    className="p-2 rounded-full hover:bg-gray-100"
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    title="More options"
                  >
                    <HiDotsVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {showMoreMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowMoreMenu(false)}
                      />
                      
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
                        <button
                          onClick={handleReport}
                          className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <HiFlag className="w-5 h-5 mr-3" />
                          <span className="font-medium">Report</span>
                        </button>
                        
                        <button 
                          onClick={handleBlock}
                          className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <HiEyeOff className="w-5 h-5 mr-3" />
                          <span className="font-medium">Block</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={closeConversation}
                  title="Close conversation"
                >
                  <HiX className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 flex flex-col">
              <div className="space-y-4 flex-1">
                {conversationMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3 relative group ${
                        msg.isMe
                          ? "bg-blue-100 rounded-br-none"
                          : "bg-white border rounded-bl-none"
                      }`}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setSelectedMessage(msg);
                      }}
                    >
                      {!msg.isMe && (
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          {msg.sender}
                        </div>
                      )}
                      
                      {replyingTo?.id === msg.id && (
                        <div className="bg-blue-50 border-l-2 border-blue-400 pl-2 py-1 mb-2 text-sm text-gray-600 italic">
                          Replying to: {replyingTo.content}
                        </div>
                      )}
                      
                      <p className="text-gray-800 text-sm sm:text-base">{msg.content}</p>
                      <p className={`text-xs text-gray-500 mt-1 ${
                        msg.isMe ? "text-right" : ""
                      }`}>
                        {msg.time}
                      </p>
                      
                      {/* Message actions - hidden on mobile for better UX */}
                      <div className={`absolute -top-2 ${msg.isMe ? '-right-8' : '-left-8'} opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex space-x-1`}>
                        <button 
                          className="p-1 rounded-full bg-white border shadow-sm hover:bg-gray-100"
                          onClick={() => handleMessageAction(msg, 'reply')}
                          title="Reply"
                        >
                          <HiOutlineReply className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          className="p-1 rounded-full bg-white border shadow-sm hover:bg-gray-100"
                          onClick={() => handleMessageAction(msg, 'copy')}
                          title="Copy"
                        >
                          <HiOutlineDuplicate className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
                
            {/* Reply Preview */}
            {replyingTo && (
              <div className="border-t bg-blue-50 p-3 flex justify-between items-center">
                <div className="text-sm text-gray-700 min-w-0 flex-1">
                  <span className="font-medium">Replying to:</span> 
                  <span className="truncate ml-1">{replyingTo.content}</span>
                </div>
                <button 
                  className="text-gray-500 hover:text-gray-700 ml-2 flex-shrink-0"
                  onClick={() => setReplyingTo(null)}
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {/* Message Input */}
            <div className="p-3 sm:p-4 border-t">
              <div className="flex items-center">
                <button className="text-gray-500 hover:text-gray-700 p-2 mr-1 hidden sm:block">
                  <HiPaperClip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm sm:text-base"
                  disabled={sendingMessage}
                />
                <button className="text-gray-500 hover:text-gray-700 p-2 ml-1 hidden sm:block">
                  <HiEmojiHappy className="w-5 h-5" />
                </button>
                <button className="text-gray-500 hover:text-gray-700 p-2 ml-1 hidden sm:block">
                  <HiMicrophone className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sendingMessage}
                  className={`ml-2 p-2 rounded-full transition-colors ${
                    message.trim() && !sendingMessage
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {sendingMessage ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <HiPaperAirplane className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Message Actions Modal for Mobile */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xs">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Message Actions</h3>
            </div>
            <div className="p-2">
              <button 
                className="w-full flex items-center p-3 hover:bg-gray-100 rounded"
                onClick={() => {
                  handleMessageAction(selectedMessage, 'reply');
                  setSelectedMessage(null);
                }}
              >
                <HiOutlineReply className="w-5 h-5 mr-2 text-gray-600" />
                <span>Reply</span>
              </button>
              <button 
                className="w-full flex items-center p-3 hover:bg-gray-100 rounded"
                onClick={() => {
                  handleMessageAction(selectedMessage, 'copy');
                  setSelectedMessage(null);
                }}
              >
                <HiOutlineDuplicate className="w-5 h-5 mr-2 text-gray-600" />
                <span>Copy Text</span>
              </button>
            </div>
            <div className="p-3 border-t">
              <button 
                className="w-full py-2 text-center text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedMessage(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
