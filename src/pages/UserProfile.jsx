import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  HiUserPlus, 
  HiChatBubbleLeftRight, 
  HiUsers, 
  HiClock, 
  HiMapPin, 
  HiAcademicCap,
  HiBriefcase,
  HiStar
} from 'react-icons/hi2';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('none'); // 'none', 'pending', 'connected'
  const [sendingRequest, setSendingRequest] = useState(false);

  console.log('🔍 UserProfile component loaded');
  console.log('📋 userId from params:', userId);
  console.log('👤 currentUser:', currentUser?.id);

  // Early return if no userId is provided
  if (!userId) {
    return (
      <div className="bg-purple-50 min-h-screen p-4 rounded-lg">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Invalid user profile URL</p>
            <Link 
              to="/network"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Network
            </Link>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    console.log('🔄 useEffect triggered');
    console.log('📋 userId:', userId);
    console.log('👤 currentUser exists:', !!currentUser);
    
    if (userId && currentUser) {
      loadUserProfile();
    } else {
      console.log('❌ Missing userId or currentUser');
      setLoading(false);
      if (!userId) {
        setError('User ID not found');
      }
    }
  }, [userId, currentUser]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Loading profile for userId:', userId);
      console.log('🔍 Current user:', currentUser.id);

      // Load profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('User not found');
      }

      console.log('✅ Profile data loaded:', profile);

      // Load experiences
      const { data: experiencesData } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', userId)
        .order('start_date', { ascending: false });

      // Load education
      const { data: educationData } = await supabase
        .from('education')
        .select('*')
        .eq('profile_id', userId)
        .order('start_date', { ascending: false });

      // Load skills
      const { data: skillsData } = await supabase
        .from('skills')
        .select('*')
        .eq('profile_id', userId);

      // Load connection count
      const { data: connectionsData } = await supabase
        .from('connections')
        .select('id')
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'accepted');

      // Check connection status with current user - FIXED QUERY
      const { data: connectionCheck, error: connectionError } = await supabase
        .from('connections')
        .select('status, requester_id, receiver_id')
        .or(`and(requester_id.eq.${currentUser.id},receiver_id.eq.${userId}),and(requester_id.eq.${userId},receiver_id.eq.${currentUser.id})`);

      if (connectionError) {
        console.error('Connection check error:', connectionError);
      }

      let status = 'none';
      if (connectionCheck && connectionCheck.length > 0) {
        const connection = connectionCheck[0];
        console.log('🔗 Found connection:', connection);
        if (connection.status === 'accepted') {
          status = 'connected';
        } else if (connection.status === 'pending') {
          status = 'pending';
        }
      }

      console.log('🔗 Final connection status:', status);
      setConnectionStatus(status);

      // Set profile data
      setProfileData({
        ...profile,
        experience: experiencesData?.map(exp => ({
          id: exp.id,
          role: exp.title,
          company: exp.company,
          duration: `${exp.start_date} - ${exp.end_date || 'Present'}`,
          location: exp.location,
          description: exp.description
        })) || [],
        education: educationData?.map(edu => ({
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree,
          duration: `${edu.start_date} - ${edu.end_date || 'Present'}`,
          description: edu.description
        })) || [],
        skills: skillsData?.map(skill => ({
          name: skill.name,
          endorsements: skill.endorsements_count || 0
        })) || [],
        connections: connectionsData?.length || 0
      });

    } catch (err) {
      console.error('Error loading user profile:', err);
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendConnectionRequest = async () => {
    if (!currentUser || sendingRequest) return;

    try {
      setSendingRequest(true);

      const { data, error } = await supabase.rpc('create_connection_safely', {
        req_id: currentUser.id,
        rec_id: userId
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data && data.error) {
        throw new Error(data.error);
      }

      // Update connection status
      setConnectionStatus('pending');
      alert('Connection request sent!');

    } catch (err) {
      console.error('Error sending connection request:', err);
      alert('Failed to send connection request: ' + err.message);
    } finally {
      setSendingRequest(false);
    }
  };

  const handleStartConversation = async () => {
    if (!currentUser || !profileData) return;

    try {
      console.log('🚀 Starting conversation with user:', userId);
      
      // Check if conversation already exists
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1_id.eq.${currentUser.id},participant_2_id.eq.${userId}),and(participant_1_id.eq.${userId},participant_2_id.eq.${currentUser.id})`)
        .single();

      let conversationId;

      if (existingConversation) {
        conversationId = existingConversation.id;
        console.log('✅ Found existing conversation:', conversationId);
      } else {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant_1_id: currentUser.id,
            participant_2_id: userId
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          alert('Failed to start conversation. Please try again.');
          return;
        }

        conversationId = newConversation.id;
        console.log('✅ Created new conversation:', conversationId);
      }

      // Navigate to messaging page
      navigate('/messaging', { 
        state: { 
          openConversation: {
            id: conversationId,
            name: profileData.name,
            position: profileData.headline || 'Professional',
            company: 'Intru Member',
            avatar: profileData.avatar_url,
            userId: userId
          }
        } 
      });

    } catch (err) {
      console.error('Error starting conversation:', err);
      alert('Failed to start conversation. Please try again.');
    }
  };

  const renderActionButton = () => {
    if (!currentUser || currentUser.id === userId) return null;

    switch (connectionStatus) {
      case 'connected':
        return (
          <button
            onClick={handleStartConversation}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HiChatBubbleLeftRight className="w-5 h-5" />
            <span>Message</span>
          </button>
        );
      case 'pending':
        return (
          <div className="flex items-center space-x-2 bg-gray-300 text-gray-600 px-6 py-2 rounded-lg cursor-not-allowed">
            <HiClock className="w-5 h-5" />
            <span>Request Pending</span>
          </div>
        );
      case 'none':
      default:
        return (
          <button
            onClick={handleSendConnectionRequest}
            disabled={sendingRequest}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <HiUserPlus className="w-5 h-5" />
            <span>{sendingRequest ? 'Sending...' : 'Connect'}</span>
          </button>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-purple-50 min-h-screen p-4 rounded-lg">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-purple-50 min-h-screen p-4 rounded-lg">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Link 
              to="/network"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Network
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) return null;

  return (
    <div className="bg-purple-50 min-h-screen p-4 rounded-lg">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
        
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300 overflow-hidden">
                {profileData.avatar_url ? (
                  <img 
                    src={profileData.avatar_url} 
                    alt={profileData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {profileData.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 min-w-0 mt-4 sm:mt-0">
              <h1 className="text-3xl font-bold text-gray-900 truncate">
                {profileData.name || 'User'}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                {profileData.headline || 'Professional'}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                {profileData.location && (
                  <div className="flex items-center space-x-1">
                    <HiMapPin className="w-4 h-4" />
                    <span>{profileData.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <HiUsers className="w-4 h-4" />
                  <span>{profileData.connections} connections</span>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="mt-4 sm:mt-0">
              {renderActionButton()}
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      {profileData.about && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <p className="text-gray-700 leading-relaxed">{profileData.about}</p>
        </div>
      )}

      {/* Experience Section */}
      {profileData.experience?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <HiBriefcase className="w-6 h-6 mr-2 text-blue-600" />
            Experience
          </h2>
          <div className="space-y-6">
            {profileData.experience.map((exp, index) => (
              <div key={exp.id || index} className="border-l-2 border-gray-200 pl-4">
                <h3 className="font-semibold text-lg">{exp.role}</h3>
                <p className="text-blue-600 font-medium">{exp.company}</p>
                <p className="text-sm text-gray-500">{exp.duration}</p>
                {exp.location && (
                  <p className="text-sm text-gray-500">{exp.location}</p>
                )}
                {exp.description && (
                  <p className="text-gray-700 mt-2">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {profileData.education?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <HiAcademicCap className="w-6 h-6 mr-2 text-blue-600" />
            Education
          </h2>
          <div className="space-y-4">
            {profileData.education.map((edu, index) => (
              <div key={edu.id || index} className="border-l-2 border-gray-200 pl-4">
                <h3 className="font-semibold text-lg">{edu.institution}</h3>
                <p className="text-gray-600">{edu.degree}</p>
                <p className="text-sm text-gray-500">{edu.duration}</p>
                {edu.description && (
                  <p className="text-gray-700 mt-2">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Section */}
      {profileData.skills?.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <HiStar className="w-6 h-6 mr-2 text-blue-600" />
            Skills
          </h2>
          <div className="flex flex-wrap gap-3">
            {profileData.skills.map((skill, index) => (
              <div key={index} className="bg-blue-50 px-3 py-2 rounded-lg">
                <span className="text-blue-800 font-medium">{skill.name}</span>
                {skill.endorsements > 0 && (
                  <span className="text-blue-600 text-sm ml-2">
                    {skill.endorsements} endorsements
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 