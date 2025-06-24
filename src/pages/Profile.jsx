import { useState } from 'react';
import { 
  HiPencil, HiPlus, HiLocationMarker, HiMail, HiLink, HiCalendar,
  HiBriefcase, HiAcademicCap, HiSparkles, HiChatAlt2, HiEye, 
  HiHeart, HiUserGroup, HiOutlineNewspaper, HiDotsHorizontal,
  HiChevronDown, HiChevronUp, HiUser, HiOutlineBookmark, HiCog
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
  
  // Use passed userData if available (for view-only profiles), 
  // otherwise use mock data for the logged-in user's profile.
  const profileData = userData || {
    name: "John Doe",
    headline: "Software Engineer at TechCorp | React, Node.js, Cloud",
    location: "San Francisco, CA",
    connections: 500,
    followers: 1250,
    about: "Passionate software engineer with 5+ years of experience in building scalable web applications. I love solving complex problems and working with new technologies.",
    experience: [
      { title: "Senior Software Engineer", company: "TechCorp", period: "2021 - Present" },
      { title: "Software Engineer", company: "Innovate LLC", period: "2018 - 2021" },
    ],
    education: [
      { degree: "B.S. in Computer Science", school: "State University", period: "2014 - 2018" },
    ],
    skills: ["React", "Node.js", "JavaScript", "TypeScript", "AWS", "Docker", "PostgreSQL"],
  };

  const [expandedSections, setExpandedSections] = useState({
    about: true,
    experience: true,
    education: true,
    skills: false,
    recommendations: false,
    accomplishments: false,
    interests: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const [showMoreActions, setShowMoreActions] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md mb-6">
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
              <p className="text-gray-600">{profileData.headline}</p>
              <p className="text-sm text-gray-500 mt-1">{profileData.location}</p>
              <div className="flex space-x-4 text-sm text-gray-500 mt-2">
                <span>{profileData.connections}+ connections</span>
                <span>{profileData.followers} followers</span>
              </div>
            </div>
            {isEditable ? (
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">Open to</button>
                <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold">Add profile section</button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center">
                  <HiPlus className="mr-1" /> Connect
                </button>
                <button className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold">Message</button>
              </div>
            )}
          </div>

          {isEditable && (
            <div className="mt-4">
              <button 
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200"
              >
                <HiCog className="mr-1" />
                Page Settings
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

      {/* About Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">About</h2>
          {isEditable && <HiPencil className="w-5 h-5 text-gray-500 cursor-pointer" />}
        </div>
        <p className="text-gray-700 whitespace-pre-line">{profileData.about}</p>
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Experience</h2>
          {isEditable && <HiPlus className="w-5 h-5 text-gray-500 cursor-pointer" />}
        </div>
        <div className="space-y-6">
          {profileData.experience.map((exp, index) => (
            <div key={index} className="flex space-x-4">
              <HiBriefcase className="w-10 h-10 text-gray-400 mt-1" />
              <div>
                <h3 className="font-semibold">{exp.title}</h3>
                <p className="text-gray-600">{exp.company}</p>
                <p className="text-sm text-gray-500">{exp.period}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Education</h2>
          {isEditable && <HiPlus className="w-5 h-5 text-gray-500 cursor-pointer" />}
        </div>
        <div className="space-y-6">
          {profileData.education.map((edu, index) => (
            <div key={index} className="flex space-x-4">
              <HiAcademicCap className="w-10 h-10 text-gray-400 mt-1" />
              <div>
                <h3 className="font-semibold">{edu.school}</h3>
                <p className="text-gray-600">{edu.degree}</p>
                <p className="text-sm text-gray-500">{edu.period}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Skills</h2>
          {isEditable && <HiPencil className="w-5 h-5 text-gray-500 cursor-pointer" />}
        </div>
        <div className="flex flex-wrap gap-2">
          {profileData.skills.map((skill, index) => (
            <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">{skill}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
