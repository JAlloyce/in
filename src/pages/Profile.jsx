import { useState, useEffect } from 'react';
import { 
  HiPencil, HiPlus, HiLocationMarker, HiMail, HiLink, HiCalendar,
  HiBriefcase, HiAcademicCap, HiSparkles, HiChatAlt2, HiEye, 
  HiHeart, HiUserGroup, HiOutlineNewspaper, HiDotsHorizontal,
  HiChevronDown, HiChevronUp, HiUser, HiOutlineBookmark, HiCog,
  HiX, HiTrash, HiChat, HiShare, HiThumbUp, HiGlobe, HiUsers
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { profiles, posts, connections } from '../lib/supabase';
import AdminSettings from "../components/profile/AdminSettings";

const ProfileSection = ({ title, children, onEdit, onAdd, isExpanded, toggleExpand }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
    <div className="flex justify-between items-center">
      <h2 className="font-bold text-gray-900">{title}</h2>
      <div className="flex items-center space-x-2">
        {toggleExpand && (
          <button onClick={toggleExpand} className="text-gray-500 p-1">
            {isExpanded ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
          </button>
        )}
        {onAdd && (
          <button onClick={onAdd} className="text-gray-500 hover:text-blue-600 p-1">
            <HiPlus className="w-5 h-5" />
          </button>
        )}
        {onEdit && (
          <button onClick={onEdit} className="text-gray-500 hover:text-blue-600 p-1">
            <HiPencil className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
    
    {isExpanded && (
      <div className="mt-3 space-y-4">
        {children}
      </div>
    )}
  </div>
);

const ExperienceItem = ({ role, company, duration, description, location }) => (
  <div className="flex pb-3 border-b border-gray-100 last:border-0 last:pb-0">
    <div className="w-10 h-10 bg-blue-100 rounded-lg mr-3 flex-shrink-0 flex items-center justify-center">
      <HiBriefcase className="w-5 h-5 text-blue-600" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-gray-900">{role}</h3>
      <p className="text-gray-700 text-sm">{company}</p>
      <p className="text-gray-500 text-xs mt-1">{duration} · {location}</p>
      <p className="text-gray-600 text-sm mt-2">{description}</p>
    </div>
  </div>
);

const EducationItem = ({ institution, degree, duration }) => (
  <div className="flex pb-3 border-b border-gray-100 last:border-0 last:pb-0">
    <div className="w-10 h-10 bg-green-100 rounded-lg mr-3 flex-shrink-0 flex items-center justify-center">
      <HiAcademicCap className="w-5 h-5 text-green-600" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-gray-900">{institution}</h3>
      <p className="text-gray-700 text-sm">{degree}</p>
      <p className="text-gray-500 text-xs mt-1">{duration}</p>
    </div>
  </div>
);

const SkillItem = ({ skill, endorsements }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <div className="flex items-center">
      <div className="w-6 h-6 bg-gray-200 rounded-md mr-2 flex items-center justify-center">
        <HiSparkles className="w-3 h-3 text-blue-500" />
      </div>
      <span className="font-medium text-gray-800">{skill}</span>
    </div>
    <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
      {endorsements}
    </span>
  </div>
);

export default function Profile({ isEditable = true, userData }) {
  const { user } = useAuth();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [pageAdmins, setPageAdmins] = useState(['admin@example.com']);
  const [activeTab, setActiveTab] = useState('posts');
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Real user data from database
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userConnections, setUserConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile and related data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load user profile
        const { data: profile, error: profileError } = await profiles.get(user.id);
        if (profileError) throw profileError;
        
        // Load user posts
        const { data: userPostsData, error: postsError } = await posts.getFeed(user.id);
        if (postsError) throw postsError;
        
        // Load user connections
        const { data: connectionsData, error: connectionsError } = await connections.getConnections(user.id);
        if (connectionsError) throw connectionsError;

        // Set profile data with OAuth metadata
        setProfileData({
          ...profile,
          name: profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture,
          headline: profile?.headline || 'Professional at LinkedIn Clone',
          location: profile?.location || 'Location not specified',
          bio: profile?.bio || 'No bio available yet. Update your profile to tell others about yourself!',
          website: profile?.website || '',
          connections: connectionsData?.length || 0,
          followers: profileData.followers_count || 0,
          // Default experience data - would be from a separate table in full implementation
          experience: [
            {
              id: 1,
              role: "Professional",
              company: "LinkedIn Clone",
              duration: "Recently joined",
              location: profile?.location || "Remote",
              description: "Welcome to LinkedIn Clone! Update your profile to showcase your experience."
            }
          ],
          // Default education data
          education: [
            {
              id: 1,
              institution: "Add your education",
              degree: "Click edit to add your educational background",
              duration: "Year - Year",
              description: "Add details about your educational experience."
            }
          ],
          // Default skills
          skills: [
            { name: "Add your skills", endorsements: 0 },
            { name: "Professional networking", endorsements: 1 },
            { name: "Communication", endorsements: 1 }
          ]
        });

        // Set user posts with proper formatting
        setUserPosts(userPostsData?.map(post => ({
          id: post.id,
          content: post.content,
          timestamp: new Date(post.created_at).toLocaleDateString(),
          likes: post.likes_count?.[0]?.count || 0,
          comments: post.comments_count?.[0]?.count || 0,
                      shares: post.shares_count || 0,
          type: "user",
          source: null,
          isEdited: false,
          editedAt: null,
          author: post.author
        })) || []);

        setUserConnections(connectionsData || []);
        
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err.message);
        
        // Fallback to OAuth data if database fails
        setProfileData({
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          headline: 'Professional at LinkedIn Clone',
          location: 'Location not specified',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          bio: 'Welcome to LinkedIn Clone! Complete your profile to get started.',
          website: '',
          connections: 0,
          followers: 0,
          experience: [],
          education: [],
          skills: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const sidebarItems = [
    { id: 'posts', label: 'Posts', icon: HiOutlineNewspaper },
    { id: 'about', label: 'About', icon: HiUser },
    { id: 'experience', label: 'Experience', icon: HiBriefcase },
    { id: 'education', label: 'Education', icon: HiAcademicCap },
    { id: 'skills', label: 'Skills', icon: HiSparkles }
  ];

  const handleEditPost = (post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleSaveEdit = async (postId) => {
    try {
      // Update post in database (would need to implement posts.update)
      setUserPosts(posts => posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              content: editContent, 
              isEdited: true, 
              editedAt: "Just now" 
            }
          : post
      ));
      setEditingPost(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating post:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        // Delete from database (would need to implement posts.delete)
        setUserPosts(posts => posts.filter(post => post.id !== postId));
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  const getPostSourceIndicator = (post) => {
    if (post.type === 'community') {
      return (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="flex items-center -space-x-1">
            <div className="w-4 h-4 bg-gray-300 rounded-full border border-white"></div>
            <HiUsers className="w-4 h-4 text-purple-600" />
          </div>
          <span>Posted in {post.source?.name}</span>
        </div>
      );
    }
    if (post.type === 'page') {
      return (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-xs">{post.source?.icon}</span>
            </div>
          </div>
          <span>Posted as {post.source?.name}</span>
        </div>
      );
    }
    return null;
  };

  const renderPosts = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Your Posts</h2>
        <p className="text-gray-600 text-sm mb-4">
          All your posts from your profile, communities, and pages you manage
        </p>
      </div>

      {userPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <HiOutlineNewspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-500 mb-4">Share your thoughts and connect with your network</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Create your first post
          </button>
        </div>
      ) : (
        userPosts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow p-6">
            {/* Post Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img 
                  src={profileData?.avatar_url || '/default-avatar.png'} 
                  alt={profileData?.name}
                  className="w-12 h-12 rounded-full object-cover bg-gray-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-12 h-12 bg-gray-300 rounded-full items-center justify-center hidden">
                  <HiUser className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{profileData?.name}</h3>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-500">{post.timestamp}</p>
                    {getPostSourceIndicator(post)}
                    {post.isEdited && (
                      <span className="text-xs text-gray-400 italic">
                        Edited {post.editedAt}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isEditable && (
                <div className="relative group">
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <HiDotsHorizontal className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-2 z-10 w-32 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <button
                      onClick={() => handleEditPost(post)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-50"
                    >
                      <HiPencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      <HiTrash className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Post Content */}
            <div className="mb-4">
              {editingPost === post.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveEdit(post.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPost(null)}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
              )}
            </div>

            {/* Post Actions */}
            {editingPost !== post.id && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                    <HiThumbUp className="w-5 h-5" />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                    <HiChat className="w-5 h-5" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
                    <HiShare className="w-5 h-5" />
                    <span className="text-sm">{post.shares}</span>
                  </button>
                </div>
                <button className="text-gray-500 hover:text-gray-700">
                  <HiOutlineBookmark className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderAbout = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">About</h2>
        {isEditable && <HiPencil className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600" />}
      </div>
      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{profileData?.bio}</p>
    </div>
  );

  const renderExperience = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Experience</h2>
        {isEditable && <HiPlus className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600" />}
      </div>
      <div className="space-y-6">
        {profileData?.experience?.map((exp, index) => (
          <div key={exp.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <HiBriefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{exp.role}</h3>
                  <p className="text-gray-700">{exp.company}</p>
                  <p className="text-gray-500 text-sm">{exp.duration} · {exp.location}</p>
                </div>
                {isEditable && (
                  <button className="text-gray-400 hover:text-blue-600">
                    <HiPencil className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-gray-600 mt-3">{exp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Education</h2>
        {isEditable && <HiPlus className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600" />}
      </div>
      <div className="space-y-6">
        {profileData?.education?.map((edu, index) => (
          <div key={edu.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <HiAcademicCap className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-900">{edu.institution}</h3>
                  <p className="text-gray-700">{edu.degree}</p>
                  <p className="text-gray-500 text-sm">{edu.duration}</p>
                </div>
                {isEditable && (
                  <button className="text-gray-400 hover:text-blue-600">
                    <HiPencil className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-gray-600 mt-3">{edu.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Skills</h2>
        {isEditable && <HiPlus className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600" />}
      </div>
      <div className="space-y-4">
        {profileData?.skills?.map((skill, index) => (
          <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <HiSparkles className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium text-gray-800">{skill.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">{skill.endorsements} endorsements</span>
              {isEditable && (
                <button className="text-gray-400 hover:text-blue-600">
                  <HiPencil className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'posts': return renderPosts();
      case 'about': return renderAbout();
      case 'experience': return renderExperience();
      case 'education': return renderEducation();
      case 'skills': return renderSkills();
      default: return renderPosts();
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow mb-6 animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-lg"></div>
          <div className="pt-20 px-8 pb-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error loading profile</h2>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative">
          <div className="absolute -bottom-16 left-8">
            <img 
              src={profileData?.avatar_url || '/default-avatar.png'} 
              alt={profileData?.name}
              className="w-32 h-32 rounded-full border-4 border-white object-cover bg-gray-300"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white items-center justify-center hidden">
              <HiUser className="w-16 h-16 text-gray-500" />
            </div>
          </div>
          {isEditable && (
            <button className="absolute top-4 right-4 bg-white/30 hover:bg-white/50 text-white p-2 rounded-full">
              <HiPencil className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="pt-20 px-8 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{profileData?.name}</h1>
              <p className="text-gray-600 text-lg">{profileData?.headline}</p>
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <HiLocationMarker className="w-4 h-4 mr-1" />
                {profileData?.location}
              </p>
              <div className="flex space-x-4 text-sm text-gray-500 mt-3">
                <span className="flex items-center">
                  <HiUserGroup className="w-4 h-4 mr-1" />
                  {profileData?.connections}+ connections
                </span>
                <span>{profileData?.followers} followers</span>
              </div>
            </div>
            {isEditable ? (
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                  Open to work
                </button>
                <button 
                  onClick={() => setShowAdminPanel(true)}
                  className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50"
                >
                  <HiCog className="w-4 h-4 inline mr-2" />
                  Settings
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                  Connect
                </button>
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50">
                  Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className={`transition-all duration-300 ${showSidebar ? 'w-64' : 'w-0 overflow-hidden'}`}>
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <nav className="space-y-2">
              {sidebarItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>

      {/* Admin Settings Modal */}
      {showAdminPanel && (
        <AdminSettings 
          onClose={() => setShowAdminPanel(false)}
          pageAdmins={pageAdmins}
          setPageAdmins={setPageAdmins}
        />
      )}
    </div>
  );
}
