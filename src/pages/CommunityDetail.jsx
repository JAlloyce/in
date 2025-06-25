import { useState, useEffect } from "react";
import { 
  HiUserGroup, HiCalendar, HiUser, HiInformationCircle, 
  HiPlus, HiOutlineDotsHorizontal, HiOutlineBookmark, 
  HiOutlineShare, HiOutlineFlag, HiOutlineChevronDown, HiSearch,
  HiOutlineLocationMarker, HiOutlineClock, HiOutlineUserGroup,
  HiOutlineCalendar, HiOutlineTicket, HiOutlinePresentationChartLine
} from "react-icons/hi";
import { Link, useParams, useNavigate } from "react-router-dom";
import CreatePost from "../components/feed/CreatePost";
import Post from "../components/feed/Post";
import CommunityAdminPanel from '../components/community/CommunityAdminPanel';

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [showMemberOptions, setShowMemberOptions] = useState(false);
  const [isAdmin, setIsAdmin] = useState(true); // In real app, check user role
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [blockedMembers, setBlockedMembers] = useState([]);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'in-person'
  });

  // Mock community data
  useEffect(() => {
    // Simulate API call to fetch community data
    setTimeout(() => {
      setCommunity({
        id: 1,
        name: "Tech Innovators",
        description: "For technology enthusiasts and innovators. Discuss the latest trends, share knowledge, and network.",
        coverImage: null,
        icon: null,
        members: "12,500",
        isMember: true,
        rules: [
          "Be respectful to all members",
          "Stay on topic - technology discussions only",
          "No self-promotion without permission",
          "No spam or irrelevant content"
        ],
        events: [
          { 
            id: 1, 
            title: "Monthly Tech Meetup", 
            date: "June 15, 2023", 
            time: "6:00 PM",
            location: "San Francisco",
            type: "in-person",
            attendees: 45,
            description: "Join us for our monthly tech discussion and networking event."
          },
          { 
            id: 2, 
            title: "AI Workshop", 
            date: "June 22, 2023", 
            time: "2:00 PM",
            location: "Online",
            type: "online",
            attendees: 128,
            description: "Learn about the latest AI tools and techniques."
          }
        ]
      });
      
      setIsMember(true);
      
      // Mock posts data
      setPosts([
        { 
          id: 1, 
          userId: 2, 
          userName: "Alex Rodriguez", 
          userRole: "Frontend Developer",
          userCompany: "Digital Solutions",
          content: "Check out this new framework I've been using! It's amazing for state management.", 
          time: "2h ago",
          likes: 42,
          comments: 8,
          isCommunityPost: true
        },
        { 
          id: 2, 
          userId: 3, 
          userName: "Emma Wilson", 
          userRole: "Marketing Director",
          userCompany: "BrandBoost",
          content: "Anyone attending the conference next month? Let's meet up!", 
          time: "4h ago",
          likes: 24,
          comments: 5,
          isCommunityPost: true
        }
      ]);
    }, 500);
  }, [id]);

  const tabs = [
    { id: "posts", label: "Posts", icon: HiUserGroup },
    { id: "about", label: "About", icon: HiInformationCircle },
    { id: "members", label: "Members", icon: HiUser },
    { id: "events", label: "Events", icon: HiCalendar }
  ];

  const handleJoinCommunity = () => {
    setIsMember(true);
    // In a real app, this would call an API to join the community
  };

  const handleCreatePost = (postContent) => {
    const newPost = {
      id: posts.length + 1,
      userId: 1, // Current user ID
      userName: "John Doe",
      userRole: "Senior Software Engineer",
      userCompany: "TechCorp",
      content: postContent,
      time: "Just now",
      likes: 0,
      comments: 0,
      isCommunityPost: true
    };
    
    setPosts([newPost, ...posts]);
  };

  const handleCreateEvent = () => {
    if (!eventForm.title || !eventForm.date || !eventForm.time) {
      alert("Please fill in all required fields");
      return;
    }

    const newEvent = {
      id: Date.now(),
      ...eventForm,
      attendees: 0,
      createdDate: new Date().toLocaleDateString()
    };

    setCommunity(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));

    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      type: 'in-person'
    });
    setShowCreateEvent(false);
    alert("Event created successfully!");
  };

  const handleAttendEvent = (eventId) => {
    setCommunity(prev => ({
      ...prev,
      events: prev.events.map(event => 
        event.id === eventId 
          ? { ...event, attendees: event.attendees + 1, attending: true }
          : event
      )
    }));
    
    // Create notification
    alert(`You're now attending this event! You'll receive notifications about updates.`);
  };

  if (!community) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 lg:h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <button 
              className="bg-white text-blue-600 px-3 py-1 lg:px-4 lg:py-2 rounded-full font-medium text-sm lg:text-base"
              onClick={() => alert("Upload cover image")}
            >
              Add Cover Photo
            </button>
          </div>
          
          <div className="absolute bottom-4 left-3 lg:left-6 flex items-end">
            {/* Fixed community icon to be perfectly round */}
            <div className="w-20 h-20 lg:w-32 lg:h-32 rounded-full bg-white p-1 shadow-lg">
              <div className="bg-purple-100 rounded-full w-full h-full flex items-center justify-center">
                <HiUserGroup className="w-6 h-6 lg:w-12 lg:h-12 text-purple-600" />
              </div>
            </div>
            <div className="ml-2 lg:ml-4 text-white mb-2 lg:mb-4">
              <h1 className="text-lg lg:text-3xl font-bold">{community.name}</h1>
              <p className="text-sm lg:text-lg">{community.members} members</p>
            </div>
          </div>
          
          {/* Mobile-optimized action buttons */}
          <div className="absolute top-2 lg:top-4 right-2 lg:right-4 flex space-x-1 lg:space-x-2">
            <div className="relative">
              <button 
                className="bg-white text-blue-600 px-2 py-1 lg:px-4 lg:py-2 rounded-full font-medium flex items-center text-sm lg:text-base"
                onClick={() => setShowMemberOptions(!showMemberOptions)}
              >
                <span className="mr-1">{isMember ? "Member" : "Join"}</span>
                <HiOutlineChevronDown className="w-3 h-3 lg:w-4 lg:h-4" />
              </button>
              
              {showMemberOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                  {isMember ? (
                    <>
                      <button 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => alert("Notification settings")}
                      >
                        <HiOutlineBookmark className="w-4 h-4 mr-2" />
                        Notification Settings
                      </button>
                      <button 
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => alert("Invite members")}
                      >
                        <HiOutlineShare className="w-4 h-4 mr-2" />
                        Invite Members
                      </button>
                      <button 
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => setIsMember(false)}
                      >
                        <HiOutlineFlag className="w-4 h-4 mr-2" />
                        Leave Community
                      </button>
                    </>
                  ) : (
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={handleJoinCommunity}
                    >
                      Join Community
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <button className="bg-white text-blue-600 p-1 lg:p-2 rounded-full">
              <HiOutlineShare className="w-4 h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
        
        {/* Community Info */}
        <div className="p-3 lg:p-6 pt-12 lg:pt-24">
          <p className="text-gray-700 mb-4 lg:mb-6 text-sm lg:text-base">{community.description}</p>
          
          {/* Tabs */}
          <div className="flex border-b overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-3 px-6 font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Admin Panel */}
      {isAdmin && showAdminPanel && (
        <CommunityAdminPanel 
          blockedMembers={blockedMembers}
          onBlockMember={(memberId) => setBlockedMembers([...blockedMembers, memberId])}
          onUnblockMember={(memberId) => setBlockedMembers(blockedMembers.filter(id => id !== memberId))}
        />
      )}
      
      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "posts" && (
          <div className="space-y-4">
            {isMember && (
              <div className="bg-white rounded-lg shadow p-4">
                <CreatePost 
                  onSubmit={handleCreatePost} 
                  placeholder={`Share something with the ${community.name} community...`}
                />
              </div>
            )}
            
            <div className="space-y-4">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow">
                  <Post 
                    {...post} 
                    communityName={community.name}
                    onComment={() => navigate(`/post/${post.id}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === "about" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">About this community</h2>
            <p className="text-gray-700 mb-6">{community.description}</p>
            
            <h3 className="font-bold mb-3">Community Rules</h3>
            <ul className="space-y-2 mb-6">
              {community.rules.map((rule, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            
            <div className="flex space-x-4">
              <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md font-medium">
                Report Community
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium">
                See All Members
              </button>
            </div>
          </div>
        )}
        
        {activeTab === "members" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Members</h2>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search members..."
                  className="pl-9 pr-4 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 mr-3"></div>
                    <div>
                      <h3 className="font-bold">Member {i+1}</h3>
                      <p className="text-sm text-gray-500">Software Engineer</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 rounded-md text-sm">
                      Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === "events" && (
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-2 lg:space-y-0">
              <h3 className="text-lg font-semibold">Upcoming Events</h3>
              {isAdmin && (
                <button 
                  onClick={() => setShowCreateEvent(true)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center text-sm"
                >
                  <HiOutlineCalendar className="w-4 h-4 mr-1" />
                  Create Event
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {community.events.map(event => (
                <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      {/* Event type icons */}
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        {event.type === 'online' ? (
                          <HiOutlinePresentationChartLine className="w-5 h-5 text-blue-600" />
                        ) : (
                          <HiOutlineLocationMarker className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-500 flex items-center">
                          <HiOutlineClock className="w-4 h-4 mr-1" />
                          {event.date} at {event.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {event.type === 'online' ? 'Online' : 'In-Person'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <HiOutlineUserGroup className="w-4 h-4 mr-1" />
                      <span>{event.attendees} attending</span>
                      <span className="mx-2">•</span>
                      <HiOutlineLocationMarker className="w-4 h-4 mr-1" />
                      <span>{event.location}</span>
                    </div>
                    <button 
                      onClick={() => handleAttendEvent(event.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        event.attending 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      <HiOutlineTicket className="w-4 h-4 mr-1 inline" />
                      {event.attending ? 'Attending' : 'Attend'}
                    </button>
                  </div>
                  
                  {event.attending && (
                    <div className="mt-3 p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700">
                        You'll receive notifications about this event. 
                        <button className="ml-1 underline hover:no-underline">
                          View attendees
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {community.events.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <HiOutlineCalendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No upcoming events</h3>
                <p className="text-gray-500">Be the first to create an event for this community!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'members' && isAdmin && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className={`px-4 py-2 rounded-md text-sm ${
                showAdminPanel 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {showAdminPanel ? 'Exit Admin Mode' : 'Enter Admin Mode'}
            </button>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 lg:p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Create New Event</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Title *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Event description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time *</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Event location or 'Online'"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <select
                  value={eventForm.type}
                  onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="in-person">In-Person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateEvent(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityDetail; 