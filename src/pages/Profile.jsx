import { useState } from "react";
import { HiLocationMarker, HiMail, HiPencil } from "react-icons/hi";
import { FaBellSlash } from "react-icons/fa";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileInfo, setProfileInfo] = useState({
    name: "John Doe",
    title: "Senior Software Engineer at TechCorp",
    location: "San Francisco, CA",
    email: "john.doe@example.com",
    about: "Passionate software engineer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies. Open source contributor and tech community advocate.",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you would save to backend here
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-600 relative">
          {isEditing && (
            <button className="absolute top-4 right-4 bg-white text-blue-600 px-4 py-1 rounded-full font-medium flex items-center">
              <HiPencil className="mr-1" /> Edit Cover
            </button>
          )}
        </div>
        <div className="px-6 pb-6 -mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-300 border-4 border-white"></div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md">
                    <HiPencil className="w-5 h-5 text-gray-700" />
                  </button>
                )}
              </div>
              <div>
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="name"
                      value={profileInfo.name}
                      onChange={handleChange}
                      className="text-2xl font-bold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      name="title"
                      value={profileInfo.title}
                      onChange={handleChange}
                      className="text-lg text-gray-600 border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{profileInfo.name}</h1>
                    <p className="text-lg text-gray-600">{profileInfo.title}</p>
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <HiLocationMarker className="w-4 h-4 mr-1" />
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={profileInfo.location}
                        onChange={handleChange}
                        className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <span>{profileInfo.location}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <HiMail className="w-4 h-4 mr-1" />
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={profileInfo.email}
                        onChange={handleChange}
                        className="border-b border-gray-300 focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <span>{profileInfo.email}</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">1,247 connections</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button 
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="border border-gray-500 text-gray-700 px-6 py-2 rounded-full font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700">
                    Connect
                  </button>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="border border-blue-600 text-blue-600 px-6 py-2 rounded-full font-medium hover:bg-blue-50"
                  >
                    <HiPencil className="inline mr-1" /> Edit Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">About</h2>
          {isEditing && (
            <button className="text-blue-600 hover:text-blue-800">
              <HiPencil className="w-5 h-5" />
            </button>
          )}
        </div>
        {isEditing ? (
          <textarea
            name="about"
            value={profileInfo.about}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
          />
        ) : (
          <p className="text-gray-700">{profileInfo.about}</p>
        )}
      </div>

      {/* Experience Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Experience</h2>
          <button className="text-blue-600 hover:text-blue-800">
            <HiPencil className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {[1, 2].map(id => (
            <div key={id} className="flex border-b pb-4 last:border-0 last:pb-0">
              <div className="w-12 h-12 rounded bg-gray-200 mr-4 flex-shrink-0"></div>
              <div>
                <h3 className="font-bold">Senior Software Engineer</h3>
                <p className="text-gray-600">TechCorp · Full-time</p>
                <p className="text-gray-500 text-sm">Jan 2020 - Present · 3 yrs 6 mos</p>
                <p className="text-gray-700 mt-2">
                  Lead development of customer-facing applications using React and Node.js. 
                  Implemented CI/CD pipelines reducing deployment time by 40%.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      {/* Activity Section */}
      {/* People Also Viewed */}
      {/* Contact Info */}
    </div>
  );
}
