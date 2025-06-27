import { useState, useEffect } from 'react';
import { 
  HiPencil, HiPlus, HiLocationMarker, HiMail, HiLink, HiCalendar,
  HiBriefcase, HiAcademicCap, HiSparkles, HiChatAlt2, HiEye, 
  HiHeart, HiUserGroup, HiOutlineNewspaper, HiDotsHorizontal,
  HiChevronDown, HiChevronUp, HiUser, HiOutlineBookmark, HiCog,
  HiX, HiTrash, HiChat, HiShare, HiThumbUp, HiGlobe, HiUsers,
  HiTrendingUp, HiViewGrid
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { posts, supabase } from '../lib/supabase';
import AdminSettings from "../components/profile/AdminSettings";
import { Button, Card, Avatar } from "../components/ui";
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Responsive Profile Page Component
 * 
 * Features:
 * - Mobile-first responsive design
 * - Touch-optimized controls
 * - Proper overflow handling
 * - Accessibility compliant
 * - Smooth animations optimized for mobile
 */

const ProfileSection = ({ title, children, onEdit, onAdd, isExpanded, toggleExpand }) => (
  <motion.div 
    className="bg-white rounded-lg shadow border border-gray-200 p-4 md:p-6 mb-4 md:mb-6 mobile-safe"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex justify-between items-center mb-3 md:mb-4">
      <h2 className="font-bold text-gray-900 text-base md:text-lg">{title}</h2>
      <div className="flex items-center space-x-1">
        {toggleExpand && (
          <button 
            onClick={toggleExpand} 
            className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all touch-target focus-visible"
            aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
          >
            {isExpanded ? <HiChevronUp className="w-5 h-5" /> : <HiChevronDown className="w-5 h-5" />}
          </button>
        )}
        {onAdd && (
          <button 
            onClick={onAdd} 
            className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all touch-target focus-visible"
            aria-label="Add item"
          >
            <HiPlus className="w-5 h-5" />
          </button>
        )}
        {onEdit && (
          <button 
            onClick={onEdit} 
            className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all touch-target focus-visible"
            aria-label="Edit section"
          >
            <HiPencil className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
    
    <AnimatePresence>
      {isExpanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3 md:space-y-4"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const ExperienceItem = ({ role, company, duration, description, location }) => (
  <motion.div 
    className="flex flex-col sm:flex-row pb-4 border-b border-gray-100 last:border-0 last:pb-0"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mb-3 sm:mb-0 sm:mr-4 flex-shrink-0 flex items-center justify-center shadow-sm">
      <HiBriefcase className="w-5 h-5 md:w-6 md:h-6 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-gray-900 text-base md:text-lg">{role}</h3>
      <p className="text-blue-600 font-medium text-sm md:text-base">{company}</p>
      <p className="text-gray-500 text-xs md:text-sm mt-1">{duration} · {location}</p>
      <p className="text-gray-600 mt-2 md:mt-3 leading-relaxed text-sm md:text-base">{description}</p>
    </div>
  </motion.div>
);

const EducationItem = ({ institution, degree, duration }) => (
  <motion.div 
    className="flex flex-col sm:flex-row pb-4 border-b border-gray-100 last:border-0 last:pb-0"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mb-3 sm:mb-0 sm:mr-4 flex-shrink-0 flex items-center justify-center shadow-sm">
      <HiAcademicCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-bold text-gray-900 text-base md:text-lg">{institution}</h3>
      <p className="text-green-600 font-medium text-sm md:text-base">{degree}</p>
      <p className="text-gray-500 text-xs md:text-sm mt-1">{duration}</p>
    </div>
  </motion.div>
);

const SkillItem = ({ skill, endorsements }) => (
  <motion.div 
    className="flex justify-between items-center py-3 px-3 md:px-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors mobile-safe"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex items-center flex-1 min-w-0">
      <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3 flex items-center justify-center flex-shrink-0">
        <HiSparkles className="w-3 h-3 md:w-4 md:h-4 text-white" />
      </div>
      <span className="font-medium text-gray-800 text-sm md:text-base truncate">{skill}</span>
    </div>
    <span className="text-xs md:text-sm font-bold bg-blue-100 text-blue-700 px-2 md:px-3 py-1 rounded-full ml-2 flex-shrink-0">
      {endorsements}
    </span>
  </motion.div>
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
  const [userExperiences, setUserExperiences] = useState([]);
  const [userEducation, setUserEducation] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    headline: '',
    about: '',
    location: '',
    website: ''
  });
  
  // Sidebar navigation items
  const sidebarItems = [
    { id: 'posts', label: 'Posts', icon: HiOutlineNewspaper },
    { id: 'about', label: 'About', icon: HiUser },
    { id: 'experience', label: 'Experience', icon: HiBriefcase },
    { id: 'education', label: 'Education', icon: HiAcademicCap },
    { id: 'skills', label: 'Skills', icon: HiSparkles },
  ];

  // Load user profile and related data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Load user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (profileError) console.warn('Failed to load profile:', profileError);
        
        // Load user posts with debug logging
        console.log('🔍 Profile: Loading posts for user ID:', user.id);
        const { data: userPostsData, error: postsError } = await posts.getByUser(user.id);
        console.log('📝 Profile: Raw posts data:', userPostsData);
        console.log('❌ Profile: Posts error:', postsError);
        if (postsError) {
          console.warn('⚠️ Profile: Posts error but continuing:', postsError);
          // Don't throw, just warn and continue with empty array
        }
        
        // Load user connections
        const { data: connectionsData, error: connectionsError } = await supabase
          .from('connections')
          .select('*')
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq('status', 'accepted');
        if (connectionsError) console.warn('Failed to load connections:', connectionsError);

        // Load user experiences
        const { data: experiencesData, error: experiencesError } = await supabase
          .from('experiences')
          .select('*')
          .eq('profile_id', user.id)
          .order('start_date', { ascending: false });
        if (experiencesError) console.warn('Failed to load experiences:', experiencesError);

        // Load user education
        const { data: educationData, error: educationError } = await supabase
          .from('education')
          .select('*')
          .eq('profile_id', user.id)
          .order('start_date', { ascending: false });
        if (educationError) console.warn('Failed to load education:', educationError);

        // Load user skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*')
          .eq('profile_id', user.id);
        if (skillsError) console.warn('Failed to load skills:', skillsError);

        // Set profile data with OAuth metadata
        const finalProfileData = {
          ...profile,
          name: profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture,
          headline: profile?.headline || 'Update your headline to tell others about yourself',
          location: profile?.location || 'Add your location',
          bio: profile?.bio || 'No bio available yet. Update your profile to tell others about yourself!',
          website: profile?.website || '',
          connections: connectionsData?.length || 0,
          followers: profile?.followers_count || 0,
          // Map experiences data correctly
          experience: experiencesData?.map(exp => ({
            id: exp.id,
            role: exp.title, // Database uses 'title' not 'role'
            company: exp.company,
            duration: `${exp.start_date} - ${exp.end_date || 'Present'}`,
            location: exp.location,
            description: exp.description
          })) || [],
          // Map education data correctly  
          education: educationData?.map(edu => ({
            id: edu.id,
            institution: edu.institution,
            degree: edu.degree,
            duration: `${edu.start_date} - ${edu.end_date || 'Present'}`,
            description: edu.description
          })) || [],
          // Map skills data correctly
          skills: skillsData?.map(skill => ({
            name: skill.name,
            endorsements: skill.endorsements_count // Database uses 'endorsements_count'
          })) || []
        };

        setProfileData(finalProfileData);
        
        // Initialize edit form data
        setEditFormData({
          name: finalProfileData.name,
          headline: finalProfileData.headline,
          about: finalProfileData.bio,
          location: finalProfileData.location,
          website: finalProfileData.website
        });

        // Set user posts with proper formatting and debug logging
        console.log('🔄 Mapping user posts data:', userPostsData);
        const mappedPosts = (userPostsData || []).map(post => ({
          id: post.id,
          content: post.content,
          timestamp: new Date(post.created_at).toLocaleDateString(),
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          shares: post.shares_count || 0,
          type: "user",
          source: null,
          isEdited: false,
          editedAt: null,
          author: post.author || { name: profileData?.name || 'Unknown Author' },
          media_urls: post.media_urls || [], // Include media URLs for images
          image_url: post.image_url || null // Include single image URL if exists
        }));
        console.log('✅ Setting mapped posts:', mappedPosts);
        setUserPosts(mappedPosts);

        setUserConnections(connectionsData || []);
        setUserExperiences(experiencesData || []);
        setUserEducation(educationData || []);
        setUserSkills(skillsData || []);
        
      } catch (err) {
        console.error('Error loading user data:', err);
        setError(err.message);
        
        // Fallback to OAuth data if database fails
        setProfileData({
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
          headline: 'Update your headline to tell others about yourself',
          location: 'Add your location',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          bio: 'Add a bio to tell others about yourself!',
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

  const handleEditPost = (post) => {
    setEditingPost(post.id);
    setEditContent(post.content);
  };

  const handleSaveEdit = async (postId) => {
    try {
      if (!user) throw new Error('User not authenticated')

      // Persist update in Supabase
      const { data, error } = await posts.update(postId, user.id, {
        content: editContent,
        updated_at: new Date().toISOString()
      })

      if (error) throw error

      // Reflect change in UI
      setUserPosts(prev => prev.map(post =>
        post.id === postId ? {
          ...post,
          content: data.content,
          isEdited: true,
          editedAt: new Date(data.updated_at).toLocaleString()
        } : post
      ))

      setEditingPost(null)
      setEditContent('')
    } catch (err) {
      console.error('Error updating post:', err)
      alert('Failed to update post. Please try again.')
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return

    try {
      if (!user) throw new Error('User not authenticated')

      const { error } = await posts.delete(postId, user.id)

      if (error) throw error

      // Remove from UI
      setUserPosts(prev => prev.filter(post => post.id !== postId))
    } catch (err) {
      console.error('Error deleting post:', err)
      alert('Failed to delete post. Please try again.')
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({
          name: editFormData.name,
          headline: editFormData.headline,
          about: editFormData.about,
          location: editFormData.location,
          website: editFormData.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setProfileData(prev => ({
        ...prev,
        name: editFormData.name,
        headline: editFormData.headline,
        bio: editFormData.about,
        location: editFormData.location,
        website: editFormData.website
      }));

      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile. Please try again.');
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
                <>
                  <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Post Images */}
                  {post.image_url && (
                    <div className="mt-4">
                      <img 
                        src={post.image_url} 
                        alt="Post image"
                        className="rounded-lg max-h-96 w-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', post.image_url);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Multiple Media URLs */}
                  {post.media_urls && post.media_urls.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 gap-2">
                      {post.media_urls.map((url, index) => (
                        <img 
                          key={index}
                          src={url} 
                          alt={`Post media ${index + 1}`}
                          className="rounded-lg max-h-96 w-full object-cover"
                          onError={(e) => {
                            console.error('Media failed to load:', url);
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
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
        {isEditable && !isEditingProfile && (
          <HiPencil 
            className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600" 
            onClick={() => setIsEditingProfile(true)}
          />
        )}
      </div>
      
      {isEditingProfile ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={editFormData.name}
              onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
            <input
              type="text"
              value={editFormData.headline}
              onChange={(e) => setEditFormData(prev => ({ ...prev, headline: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Software Engineer at Google"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">About</label>
            <textarea
              value={editFormData.about}
              onChange={(e) => setEditFormData(prev => ({ ...prev, about: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={editFormData.location}
              onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., San Francisco, CA"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={editFormData.website}
              onChange={(e) => setEditFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://yourwebsite.com"
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleSaveProfile}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditingProfile(false)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{profileData?.bio}</p>
      )}
    </div>
  );

  const renderExperience = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Experience</h2>
        {isEditable && <HiPlus className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600" onClick={() => alert('Add experience feature coming soon!')} />}
      </div>
      <div className="space-y-6">
        {profileData?.experience?.length > 0 ? (
          profileData.experience.map((exp, index) => (
            <ExperienceItem key={exp.id || index} role={exp.role} company={exp.company} duration={exp.duration} description={exp.description} location={exp.location} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <HiBriefcase className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No experience added yet</p>
            {isEditable && <p className="text-sm">Click the + button to add your work experience</p>}
          </div>
        )}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Education</h2>
        {isEditable && <HiPlus className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600" onClick={() => alert('Add education feature coming soon!')} />}
      </div>
      <div className="space-y-6">
        {profileData?.education?.length > 0 ? (
          profileData.education.map((edu, index) => (
            <EducationItem key={edu.id || index} institution={edu.institution} degree={edu.degree} duration={edu.duration} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <HiAcademicCap className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No education added yet</p>
            {isEditable && <p className="text-sm">Click the + button to add your education</p>}
          </div>
        )}
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Skills</h2>
        {isEditable && <HiPlus className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600" onClick={() => alert('Add skills feature coming soon!')} />}
      </div>
      <div className="space-y-4">
        {profileData?.skills?.length > 0 ? (
          profileData.skills.map((skill, index) => (
          <SkillItem key={index} skill={skill.name} endorsements={skill.endorsements} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <HiSparkles className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No skills added yet</p>
            {isEditable && <p className="text-sm">Click the + button to add your skills</p>}
          </div>
        )}
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
    <motion.div 
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mobile-safe"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Mobile-Optimized Profile Header */}
      <motion.div 
        className="bg-white rounded-lg shadow border border-gray-200 mb-6 md:mb-8 overflow-hidden"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <div className="h-40 md:h-56 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="grid grid-cols-8 gap-4 h-full opacity-30">
                {[...Array(32)].map((_, i) => (
                  <motion.div 
                    key={i} 
                    className="bg-white rounded-full w-2 h-2"
                    animate={{ 
                      opacity: [0.3, 0.7, 0.3],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      delay: i * 0.1,
                      repeat: Infinity
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <motion.div 
            className="absolute -bottom-16 md:-bottom-20 left-4 md:left-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Avatar 
              src={profileData?.avatar_url}
              name={profileData?.name}
              size="xl md:2xl"
              className="border-3 md:border-4 border-white shadow-lg"
            />
          </motion.div>
          
          {isEditable && (
            <button 
              className="absolute top-4 md:top-6 right-4 md:right-6 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-all touch-target focus-visible"
              aria-label="Edit profile"
            >
              <HiPencil className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
        </div>
        
        <motion.div 
          className="pt-20 md:pt-24 px-4 md:px-8 pb-6 md:pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 md:gap-6">
            <div className="flex-1 min-w-0">
              <motion.h1 
                className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 truncate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                {profileData?.name}
              </motion.h1>
              <motion.p 
                className="text-gray-600 text-lg md:text-xl mb-3 line-clamp-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {profileData?.headline}
              </motion.p>
              <motion.p 
                className="text-gray-500 flex items-center mb-4 text-sm md:text-base"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <HiLocationMarker className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-500 flex-shrink-0" />
                <span className="truncate">{profileData?.location}</span>
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-4 md:gap-6 text-gray-500 text-sm md:text-base"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <span className="flex items-center font-medium">
                  <HiUserGroup className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-500 flex-shrink-0" />
                  {profileData?.connections}+ connections
                </span>
                <span className="font-medium">{profileData?.followers} followers</span>
              </motion.div>
            </div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-2 md:gap-3 lg:flex-shrink-0 mt-4 lg:mt-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
            {isEditable ? (
                <>
                  <Button variant="primary" size="md" className="touch-target">
                    Open to work
                  </Button>
                  <Button 
                    variant="outline" 
                    size="md"
                    onClick={() => setShowAdminPanel(true)}
                    className="touch-target flex items-center gap-2"
                  >
                    <HiCog className="w-4 h-4 md:w-5 md:h-5" />
                    Settings
                  </Button>
                </>
            ) : (
                <>
                  <Button variant="primary" size="md" className="touch-target">
                    Connect
                  </Button>
                  <Button variant="outline" size="md" className="touch-target">
                    Message
                  </Button>
                </>
            )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Main Content with Grid Layout */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Enhanced Sidebar */}
        <motion.aside 
          className={`lg:col-span-3 transition-all duration-300 ${showSidebar ? 'block' : 'hidden lg:block'}`}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Profile Sections</h3>
            <nav className="space-y-2">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-all ${
                      activeTab === item.id 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </Card>
        </motion.aside>

        {/* Enhanced Content Area */}
        <motion.main 
          className="lg:col-span-9"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
          {renderContent()}
            </motion.div>
          </AnimatePresence>
        </motion.main>
      </motion.div>

      {/* Admin Settings Modal */}
      {showAdminPanel && (
        <AdminSettings 
          onClose={() => setShowAdminPanel(false)}
          pageAdmins={pageAdmins}
          setPageAdmins={setPageAdmins}
        />
      )}
    </motion.div>
  );
}
