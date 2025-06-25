import { useState } from "react";
import { 
  FaBuilding 
} from "react-icons/fa";
import { 
  HiUserGroup, HiGlobeAlt, HiLocationMarker, 
  HiCalendar, HiBriefcase, HiNewspaper, HiStar, 
  HiOutlineBookmark, HiShare, HiPlus 
} from "react-icons/hi";

/**
 * CompanyPage Component - Mobile-Optimized Company Profile
 * 
 * Features:
 * - Fixed mobile layout issues with proper text wrapping
 * - Responsive bio section that prevents overlapping
 * - Stacked layout for mobile (Company details above Similar companies)
 * - Professional LinkedIn-style company profile
 * - Improved mobile navigation and interactions
 */
export default function CompanyPage() {
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const company = {
    id: 1,
    name: "TechCorp",
    tagline: "Innovating the future",
    description: "TechCorp is a leading technology company specializing in software development, cloud computing, and AI solutions. We empower businesses to transform digitally and achieve their goals through innovative technology solutions and exceptional service delivery.",
    industry: "Software Development",
    employees: "1,245",
    founded: "2010",
    headquarters: "San Francisco, CA",
    website: "www.techcorp.com",
    followers: "125,456",
    rating: 4.7,
    posts: [
      { id: 1, content: "We're excited to announce our new product launch next week! Stay tuned for updates. #innovation #tech", time: "2h ago", likes: 245, comments: 32 },
      { id: 2, content: "Our team just won the Best Tech Company award at the Global Tech Conference! 🏆", time: "1 day ago", likes: 789, comments: 45 },
    ],
    people: [
      { id: 1, name: "John Doe", role: "CEO", connected: true },
      { id: 2, name: "Jane Smith", role: "CTO", connected: false },
      { id: 3, name: "Alex Johnson", role: "Product Manager", connected: true },
    ],
    jobs: [
      { id: 1, title: "Senior Frontend Developer", type: "Full-time", location: "Remote", posted: "1 day ago" },
      { id: 2, title: "UX Designer", type: "Contract", location: "San Francisco", posted: "3 days ago" },
    ],
    news: [
      { id: 1, title: "TechCorp announces record profits in Q4", source: "Tech News", time: "5h ago" },
      { id: 2, title: "TechCorp partners with Green Energy Inc. for sustainable data centers", source: "Eco Tech", time: "2 days ago" },
    ]
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Company Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="px-4 sm:px-6 pb-6 -mt-16">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end">
            <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center mx-auto sm:mx-0">
                <FaBuilding className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-base sm:text-lg text-gray-600 mt-1">{company.tagline}</p>
                
                {/* Bio section - Mobile optimized */}
                <div className="mt-3 max-w-full">
                  <p className="text-sm sm:text-base text-gray-500 leading-relaxed break-words">
                    {company.description}
                  </p>
                </div>
                
                {/* Company stats - Mobile responsive */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 text-xs sm:text-sm justify-center sm:justify-start">
                  <span className="flex items-center">
                    <HiUserGroup className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{company.followers} followers</span>
                  </span>
                  <span className="flex items-center">
                    <HiStar className="w-4 h-4 mr-1 text-yellow-500 flex-shrink-0" />
                    <span className="truncate">{company.rating} (245 reviews)</span>
                  </span>
                  <span className="flex items-center">
                    <HiLocationMarker className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{company.headquarters}</span>
                  </span>
                  <span className="flex items-center">
                    <HiGlobeAlt className="w-4 h-4 mr-1 flex-shrink-0" />
                    <a href={`https://${company.website}`} className="text-blue-600 hover:underline truncate">
                      {company.website}
                    </a>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Action buttons - Mobile stacked */}
            <div className="flex flex-row sm:flex-row space-x-2 mt-4 sm:mt-0 justify-center sm:justify-end">
              <button 
                onClick={() => setFollowing(!following)}
                className={`px-4 sm:px-6 py-2 rounded-full font-medium text-sm sm:text-base transition-colors ${
                  following 
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
              <button className="p-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                <HiShare className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
                <HiOutlineBookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex overflow-x-auto border-b scrollbar-hide">
          {["overview", "posts", "people", "jobs", "news"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 sm:px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold mb-4">About</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                    {company.description}
                  </p>
                </div>
              </div>
              
              {/* Mobile-first responsive grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Company details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 text-lg">Company Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FaBuilding className="w-4 h-4 mr-3 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-gray-600 block">Industry</span>
                        <span className="font-medium text-gray-900">{company.industry}</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <HiCalendar className="w-4 h-4 mr-3 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-gray-600 block">Founded</span>
                        <span className="font-medium text-gray-900">{company.founded}</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <HiUserGroup className="w-4 h-4 mr-3 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-gray-600 block">Employees</span>
                        <span className="font-medium text-gray-900">{company.employees}</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <HiLocationMarker className="w-4 h-4 mr-3 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-gray-600 block">Headquarters</span>
                        <span className="font-medium text-gray-900">{company.headquarters}</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <HiGlobeAlt className="w-4 h-4 mr-3 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-sm text-gray-600 block">Website</span>
                        <a 
                          href={`https://${company.website}`} 
                          className="text-blue-600 hover:underline font-medium break-all"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {company.website}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Similar companies - Mobile: below company details */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 text-lg">Similar Companies</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map(id => (
                      <div key={id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center flex-shrink-0">
                          <FaBuilding className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 truncate">Company {id}</h4>
                          <p className="text-sm text-gray-500 truncate">Software Development</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-4 text-lg">Company Updates</h3>
                <div className="space-y-4">
                  {company.news.slice(0, 2).map(item => (
                    <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-bold text-gray-900 leading-snug">{item.title}</h4>
                      <p className="text-sm text-gray-500 mt-2">{item.source} • {item.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === "posts" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Posts</h2>
              <div className="space-y-4">
                {company.posts.map(post => (
                  <div key={post.id} className="border rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                        <FaBuilding className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-500">{post.time}</p>
                      </div>
                    </div>
                    <p className="text-gray-800 mb-3 leading-relaxed">{post.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{post.likes} likes</span>
                      <span>{post.comments} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === "people" && (
            <div>
              <h2 className="text-xl font-bold mb-4">People</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {company.people.map(person => (
                  <div key={person.id} className="border rounded-lg p-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-300 mx-auto mb-3"></div>
                    <h3 className="font-semibold text-gray-900">{person.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{person.role}</p>
                    <button className={`px-4 py-2 rounded-full text-sm font-medium ${
                      person.connected 
                        ? "bg-gray-200 text-gray-700" 
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}>
                      {person.connected ? "Connected" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === "jobs" && (
            <div>
              <h2 className="text-xl font-bold mb-4">Jobs</h2>
              <div className="space-y-4">
                {company.jobs.map(job => (
                  <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 flex-1">{job.title}</h3>
                      <span className="text-sm text-gray-500 ml-4 flex-shrink-0">{job.posted}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>{job.type}</span>
                      <span>{job.location}</span>
                    </div>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === "news" && (
            <div>
              <h2 className="text-xl font-bold mb-4">News</h2>
              <div className="space-y-4">
                {company.news.map(item => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-gray-900 leading-snug">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-2">{item.source} • {item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 