import { useState } from 'react';
import { 
  HiPencil, HiPlus, HiLocationMarker, HiMail, HiLink, HiCalendar,
  HiBriefcase, HiAcademicCap, HiSparkles, HiChatAlt2, HiEye, 
  HiHeart, HiUserGroup, HiOutlineNewspaper, HiDotsHorizontal,
  HiChevronDown, HiChevronUp, HiUser, HiOutlineBookmark, HiCog,
  HiX, HiTrash, HiChat, HiShare, HiThumbUp, HiGlobe, HiUsers
} from 'react-icons/hi';
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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [pageAdmins, setPageAdmins] = useState(['admin@example.com']);
  const [activeTab, setActiveTab] = useState('posts');
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  
  // Mock user posts data
  const [userPosts, setUserPosts] = useState([
    {
      id: 1,
      content: "Excited to share that I just completed my React certification! The journey was challenging but incredibly rewarding. Looking forward to applying these new skills in upcoming projects. #React #WebDevelopment #Learning",
      timestamp: "2 hours ago",
      likes: 24,
      comments: 8,
      shares: 3,
      type: "user", // user, community, page
      source: null,
      isEdited: false,
      editedAt: null
    },
    {
      id: 2,
      content: "Great discussion at the Tech Innovators community about the future of AI in web development. The insights shared by the community members were truly valuable!",
      timestamp: "1 day ago",
      likes: 15,
      comments: 12,
      shares: 5,
      type: "community",
      source: { name: "Tech Innovators", icon: "👥" },
      isEdited: true,
      editedAt: "23 hours ago"
    },
    {
      id: 3,
      content: "Just published a new article on best practices for React performance optimization. Check it out and let me know your thoughts!",
      timestamp: "3 days ago",
      likes: 45,
      comments: 18,
      shares: 12,
      type: "page",
      source: { name: "TechCorp", icon: "🏢" },
      isEdited: false,
      editedAt: null
    }
  ]);

  // Profile data
  const profileData = userData || {
    name: "John Doe",
    headline: "Software Engineer at TechCorp | React, Node.js, Cloud",
    location: "San Francisco, CA",
    connections: 500,
    followers: 1250,
    about: "Passionate software engineer with 5+ years of experience in building scalable web applications. I love solving complex problems and working with new technologies. Always eager to learn and share knowledge with the community.",
    experience: [
      {
        id: 1,
        role: "Senior Software Engineer",
        company: "TechCorp",
        duration: "2021 - Present",
        location: "San Francisco, CA",
        description: "Leading frontend development for enterprise applications using React and TypeScript. Mentoring junior developers and implementing best practices."
      },
      {
        id: 2,
        role: "Software Engineer",
        company: "Innovate LLC",
        duration: "2018 - 2021",
        location: "New York, NY",
        description: "Developed and maintained web applications using React, Node.js, and PostgreSQL. Collaborated with cross-functional teams to deliver high-quality software."
      }
    ],
    education: [
      {
        id: 1,
        institution: "State University",
        degree: "Bachelor of Science in Computer Science",
        duration: "2014 - 2018",
        description: "Graduated Magna Cum Laude. Relevant coursework: Data Structures, Algorithms, Database Systems, Software Engineering."
      }
    ],
    skills: [
      { name: "React", endorsements: 45 },
      { name: "JavaScript", endorsements: 38 },
      { name: "Node.js", endorsements: 32 },
      { name: "TypeScript", endorsements: 28 },
      { name: "AWS", endorsements: 25 },
      { name: "Docker", endorsements: 20 },
      { name: "PostgreSQL", endorsements: 18 }
    ]
  };

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

  const handleSaveEdit = (postId) => {
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
  };

  const handleDeletePost = (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setUserPosts(posts => posts.filter(post => post.id !== postId));
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
          <span>Posted in {post.source.name}</span>
        </div>
      );
    }
    if (post.type === 'page') {
      return (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-xs">{post.source.icon}</span>
            </div>
          </div>
          <span>Posted as {post.source.name}</span>
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

      {userPosts.map(post => (
        <div key={post.id} className="bg-white rounded-lg shadow p-6">
          {/* Post Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div>
                <h3 className="font-semibold">{profileData.name}</h3>
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
      ))}
    </div>
  );

  const renderAbout = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">About</h2>
        {isEditable && <HiPencil className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600" />}
      </div>
      <p className="text-gray-700 whitespace-pre-line leading-relaxed">{profileData.about}</p>
    </div>
  );

  const renderExperience = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Experience</h2>
        {isEditable && <HiPlus className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600" />}
      </div>
      <div className="space-y-6">
        {profileData.experience.map((exp, index) => (
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
        {profileData.education.map((edu, index) => (
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
        {profileData.skills.map((skill, index) => (
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative">
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white"></div>
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
              <h1 className="text-3xl font-bold">{profileData.name}</h1>
              <p className="text-gray-600 text-lg">{profileData.headline}</p>
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                <HiLocationMarker className="w-4 h-4 mr-1" />
                {profileData.location}
              </p>
              <div className="flex space-x-4 text-sm text-gray-500 mt-3">
                <span className="flex items-center">
                  <HiUserGroup className="w-4 h-4 mr-1" />
                  {profileData.connections}+ connections
                </span>
                <span>{profileData.followers} followers</span>
              </div>
            </div>
            {isEditable ? (
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700">
                  Open to work
                </button>
                <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50">
                  Add section
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center">
                  <HiPlus className="mr-2 w-4 h-4" /> Connect
                </button>
                <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50">
                  Message
                </button>
              </div>
            )}
          </div>

          {isEditable && (
            <div className="mt-6">
              <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
              >
                <HiCog className="mr-2 w-4 h-4" />
                Profile Settings
              </button>
            </div>
          )}
        </div>
      </div>

      {showAdminPanel && isEditable && (
        <AdminSettings 
          admins={pageAdmins} 
          onAddAdmin={(email) => setPageAdmins([...pageAdmins, email])}
          onRemoveAdmin={(email) => setPageAdmins(pageAdmins.filter(e => e !== email))}
        />
      )}

      {/* Main Content with Sidebar */}
      <div className="flex gap-6">
        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden fixed top-20 left-4 z-50">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-blue-600 text-white p-3 rounded-full shadow-lg"
          >
            <HiUser className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className={`w-64 flex-shrink-0 transition-transform duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:static top-0 left-0 h-full lg:h-auto z-40 lg:z-auto`}>
          <div className="bg-white rounded-lg shadow p-4 sticky top-6 h-full lg:h-auto">
            {/* Mobile Close Button */}
            <div className="lg:hidden flex justify-between items-center mb-4 pb-4 border-b">
              <h3 className="font-semibold text-gray-900">Profile Sections</h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      // Hide sidebar on mobile after selection
                      if (window.innerWidth < 1024) {
                        setShowSidebar(false);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overlay for mobile */}
        {showSidebar && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setShowSidebar(false)}
          ></div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
