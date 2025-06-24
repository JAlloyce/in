import { useState } from "react";
import { 
  FaBuilding 
} from "react-icons/fa";
import { 
  HiUserGroup, HiGlobeAlt, HiLocationMarker, 
  HiCalendar, HiBriefcase, HiNewspaper, HiStar, 
  HiOutlineBookmark, HiShare, HiPlus 
} from "react-icons/hi";

export default function CompanyPage() {
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  const company = {
    id: 1,
    name: "TechCorp",
    tagline: "Innovating the future",
    description: "TechCorp is a leading technology company specializing in software development, cloud computing, and AI solutions. We empower businesses to transform digitally and achieve their goals.",
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
    <div className="max-w-4xl mx-auto">
      {/* Company Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>
        <div className="px-6 pb-6 -mt-16">
          <div className="flex flex-wrap justify-between items-end">
            <div className="flex items-end space-x-6">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <FaBuilding className="w-16 h-16 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-lg text-gray-600">{company.tagline}</p>
                <p className="text-gray-500 mt-2">{company.description}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm">
                  <span className="flex items-center">
                    <HiUserGroup className="w-4 h-4 mr-1" />
                    <span>{company.followers} followers</span>
                  </span>
                  <span className="flex items-center">
                    <HiStar className="w-4 h-4 mr-1 text-yellow-500" />
                    <span>{company.rating} (245 reviews)</span>
                  </span>
                  <span className="flex items-center">
                    <HiLocationMarker className="w-4 h-4 mr-1" />
                    <span>{company.headquarters}</span>
                  </span>
                  <span className="flex items-center">
                    <HiGlobeAlt className="w-4 h-4 mr-1" />
                    <a href={`https://${company.website}`} className="text-blue-600 hover:underline">{company.website}</a>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <button 
                onClick={() => setFollowing(!following)}
                className={`px-6 py-2 rounded-full font-medium ${
                  following 
                    ? "bg-gray-200 text-gray-700" 
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
              <button className="p-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100">
                <HiShare className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100">
                <HiOutlineBookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex overflow-x-auto border-b">
          {["overview", "posts", "people", "jobs", "news"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
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
        <div className="p-6">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-xl font-bold mb-4">About</h2>
              <p className="text-gray-700 mb-6">{company.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Company details</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <FaBuilding className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Industry: {company.industry}</span>
                    </li>
                    <li className="flex items-center">
                      <HiCalendar className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Founded: {company.founded}</span>
                    </li>
                    <li className="flex items-center">
                      <HiUserGroup className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Employees: {company.employees}</span>
                    </li>
                    <li className="flex items-center">
                      <HiLocationMarker className="w-4 h-4 mr-2 text-gray-500" />
                      <span>Headquarters: {company.headquarters}</span>
                    </li>
                    <li className="flex items-center">
                      <HiGlobeAlt className="w-4 h-4 mr-2 text-gray-500" />
                      <a href={`https://${company.website}`} className="text-blue-600 hover:underline">
                        {company.website}
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Similar companies</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map(id => (
                      <div key={id} className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                          <FaBuilding className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Company {id}</h4>
                          <p className="text-sm text-gray-500">Software Development</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-2">Company updates</h3>
              <div className="space-y-4">
                {company.news.slice(0, 2).map(item => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md">
                    <h4 className="font-bold">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.source} • {item.time}</p>
                  </div>
                ))}
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
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <FaBuilding className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{company.name}</h3>
                        <p className="text-sm text-gray-500">{post.time}</p>
                      </div>
                    </div>
                    <p className="text-gray-800 mb-3">{post.content}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{post.likes} likes</span>
                      <span className="mx-2">•</span>
                      <span>{post.comments} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === "people" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">People</h2>
                <span className="text-sm text-gray-500">{company.people.length} employees</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.people.map(person => (
                  <div key={person.id} className="border rounded-lg p-4 hover:shadow-md">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-300 mr-3"></div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{person.name}</h3>
                        <p className="text-sm text-gray-600">{person.role}</p>
                      </div>
                      <button className={`px-4 py-1 rounded-full text-sm ${
                        person.connected 
                          ? "bg-gray-100 text-gray-700" 
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}>
                        {person.connected ? "Connected" : "Connect"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === "jobs" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Open Positions</h2>
                <span className="text-sm text-gray-500">{company.jobs.length} jobs</span>
              </div>
              
              <div className="space-y-4">
                {company.jobs.map(job => (
                  <div key={job.id} className="border rounded-lg p-4 hover:shadow-md">
                    <h3 className="font-bold text-gray-900">{job.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      <span className="flex items-center text-gray-600">
                        <HiBriefcase className="w-4 h-4 mr-1" />
                        {job.type}
                      </span>
                      <span className="flex items-center text-gray-600">
                        <HiLocationMarker className="w-4 h-4 mr-1" />
                        {job.location}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Posted {job.posted}</p>
                    <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700">
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === "news" && (
            <div>
              <h2 className="text-xl font-bold mb-4">News about {company.name}</h2>
              <div className="space-y-4">
                {company.news.map(item => (
                  <div key={item.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{item.source} • {item.time}</p>
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