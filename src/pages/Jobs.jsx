import { useState, useEffect, useRef } from "react";
import { 
  HiLocationMarker, HiCurrencyDollar, HiClock, 
  HiBriefcase, HiBookmark, HiChevronDown,
  HiX, HiLightBulb, HiPaperAirplane, HiArrowDown
} from "react-icons/hi";

export default function Jobs() {
  const [filters, setFilters] = useState({
    location: "",
    salary: "",
    experience: "",
    type: ""
  });
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showApplication, setShowApplication] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [resume, setResume] = useState("john_doe_resume.pdf");
  const messagesEndRef = useRef(null);
  const aiChatRef = useRef(null);

  const jobListings = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "San Francisco, CA",
      salary: "$120,000 - $150,000",
      type: "Full-time",
      experience: "5+ years",
      description: "We're looking for an experienced frontend developer to join our team. You'll work with React, TypeScript, and modern web technologies to build our customer-facing applications.",
      responsibilities: [
        "Develop and maintain responsive web applications",
        "Collaborate with UX designers to implement pixel-perfect designs",
        "Optimize applications for maximum speed and scalability",
        "Write unit and integration tests",
        "Participate in code reviews"
      ],
      requirements: [
        "5+ years of experience with JavaScript/Typescript",
        "Expertise in React.js and state management",
        "Experience with CSS preprocessors and CSS-in-JS",
        "Familiarity with RESTful APIs and GraphQL",
        "Knowledge of modern build pipelines and tools"
      ],
      benefits: [
        "Health insurance",
        "401(k) matching",
        "Flexible work hours",
        "Remote work options",
        "Professional development budget"
      ],
      posted: "2 days ago",
      applicants: 24,
    },
    {
      id: 2,
      title: "UX/UI Designer",
      company: "DesignHub",
      location: "Remote",
      salary: "$90,000 - $120,000",
      type: "Full-time",
      experience: "3+ years",
      description: "Join our design team to create beautiful and intuitive user experiences for our SaaS products. You'll collaborate with product managers and engineers to bring designs to life.",
      responsibilities: [
        "Create wireframes, prototypes, and high-fidelity designs",
        "Conduct user research and usability testing",
        "Develop and maintain design systems",
        "Collaborate with developers to ensure proper implementation",
        "Present design solutions to stakeholders"
      ],
      requirements: [
        "3+ years of UI/UX design experience",
        "Proficiency in Figma, Sketch, or Adobe XD",
        "Strong portfolio demonstrating design process",
        "Understanding of user-centered design principles",
        "Experience with design systems and component libraries"
      ],
      benefits: [
        "Unlimited PTO",
        "Home office stipend",
        "Health and wellness benefits",
        "Flexible schedule",
        "Professional development opportunities"
      ],
      posted: "1 week ago",
      applicants: 37,
    },
    {
      id: 3,
      title: "Data Engineer",
      company: "DataSystems",
      location: "New York, NY",
      salary: "$130,000 - $160,000",
      type: "Full-time",
      experience: "4+ years",
      description: "Design and implement scalable data pipelines and infrastructure to support our analytics platform. Work with large datasets and optimize data processing.",
      responsibilities: [
        "Design and build scalable data pipelines",
        "Implement data models and database schemas",
        "Optimize data storage and retrieval processes",
        "Monitor and troubleshoot data pipeline issues",
        "Collaborate with data scientists and analysts"
      ],
      requirements: [
        "4+ years in data engineering roles",
        "Expertise in SQL and NoSQL databases",
        "Experience with big data technologies (Spark, Hadoop)",
        "Proficiency in Python, Java, or Scala",
        "Knowledge of cloud data services (AWS, GCP)"
      ],
      benefits: [
        "Stock options",
        "Health insurance",
        "Remote work flexibility",
        "Learning stipend",
        "Flexible hours"
      ],
      posted: "3 days ago",
      applicants: 18,
    }
  ];

  // Handle job selection and open modal
  const handleJobSelect = (job) => {
    setSelectedJob(job);
    setShowModal(true);
    setShowApplication(false);
    setShowAIChat(false);
    setAiMessages([]);
  };

  // Close modal and reset states
  const handleCloseModal = () => {
    setShowModal(false);
    setShowApplication(false);
    setShowAIChat(false);
    setAiMessages([]);
  };

  // Handle application submission
  const handleSubmitApplication = () => {
    alert(`Application submitted for ${selectedJob.title} at ${selectedJob.company}!`);
    handleCloseModal();
  };

  // Handle AI message submission
  const handleAISubmit = (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      content: aiInput,
      role: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput("");
    
    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        content: getAIResponse(aiInput),
        role: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAiMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // Generate AI responses based on job context
  const getAIResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes("salary") || lowerQuestion.includes("pay")) {
      return `The salary range for this position is ${selectedJob.salary}. This is competitive for the role and location.`;
    }
    
    if (lowerQuestion.includes("experience") || lowerQuestion.includes("years")) {
      return `This role requires ${selectedJob.experience} of relevant experience. The requirements include: ${selectedJob.requirements.slice(0, 3).join(", ")}.`;
    }
    
    if (lowerQuestion.includes("benefits") || lowerQuestion.includes("perks")) {
      return `The benefits package includes: ${selectedJob.benefits.join(", ")}.`;
    }
    
    if (lowerQuestion.includes("remote") || lowerQuestion.includes("location")) {
      return `This position is ${selectedJob.location === "Remote" ? "fully remote" : `based in ${selectedJob.location}`}.`;
    }
    
    if (lowerQuestion.includes("apply") || lowerQuestion.includes("application")) {
      return "To apply for this position, click the 'Apply Now' button and fill out the application form. Make sure your resume is up to date!";
    }
    
    if (lowerQuestion.includes("responsibilities") || lowerQuestion.includes("duties")) {
      return `The key responsibilities for this role include: ${selectedJob.responsibilities.slice(0, 3).join(", ")}.`;
    }
    
    return "I'm here to help answer questions about this job posting. You can ask about the salary, experience requirements, benefits, location, or application process. What would you like to know?";
  };

  // Scroll to bottom of chat messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages]);

  // Scroll to AI chat when opened
  useEffect(() => {
    if (showAIChat && aiChatRef.current) {
      aiChatRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [showAIChat]);

  const handleFilterChange = (filter, value) => {
    setFilters(prev => ({ ...prev, [filter]: value }));
  };

  return (
    <div className="grid grid-cols-1">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">Job Opportunities</h1>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="bg-gray-100 px-4 py-2 rounded-lg appearance-none pr-8"
              >
                <option value="">Location</option>
                <option value="remote">Remote</option>
                <option value="sf">San Francisco</option>
                <option value="ny">New York</option>
              </select>
              <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="bg-gray-100 px-4 py-2 rounded-lg appearance-none pr-8"
              >
                <option value="">Job Type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
              <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
            
            <div className="relative">
              <select
                value={filters.experience}
                onChange={(e) => handleFilterChange("experience", e.target.value)}
                className="bg-gray-100 px-4 py-2 rounded-lg appearance-none pr-8"
              >
                <option value="">Experience</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
              <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {jobListings.map(job => (
            <div 
              key={job.id} 
              className="border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleJobSelect(job)}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                      <p className="text-lg text-gray-600">{job.company}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-3">
                    <div className="flex items-center text-sm text-gray-500">
                      <HiLocationMarker className="mr-1 w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <HiCurrencyDollar className="mr-1 w-4 h-4" />
                      {job.salary}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <HiBriefcase className="mr-1 w-4 h-4" />
                      {job.type}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <HiClock className="mr-1 w-4 h-4" />
                      {job.experience}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <span className="text-sm text-gray-500">{job.posted}</span>
                  <p className="text-sm text-gray-500 mt-1">{job.applicants} applicants</p>
                </div>
              </div>
              
              <p className="mt-4 text-gray-700 line-clamp-2">{job.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                {job.benefits.slice(0, 3).map((benefit, index) => (
                  <span 
                    key={index} 
                    className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Similar Jobs and Tips Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-lg mb-4">Similar Jobs</h3>
          <div className="space-y-4">
            {jobListings
              .filter(job => job.id !== selectedJob?.id)
              .map(job => (
                <div 
                  key={job.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleJobSelect(job)}
                >
                  <h4 className="font-medium text-gray-900">{job.title}</h4>
                  <p className="text-sm text-gray-600">{job.company}</p>
                  <p className="text-sm text-gray-500">{job.location}</p>
                </div>
              ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-5">
          <h3 className="font-semibold text-lg mb-4">Job Search Tips</h3>
          <ul className="space-y-3 list-disc pl-5 text-gray-700">
            <li>Customize your resume for each application</li>
            <li>Use keywords from the job description</li>
            <li>Follow companies you're interested in</li>
            <li>Set up job alerts for new opportunities</li>
            <li>Reach out to your network for referrals</li>
          </ul>
        </div>
      </div>

      {/* Job Details Modal */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <div>
                <h2 className="text-xl font-bold">{selectedJob.title}</h2>
                <p className="text-gray-600">{selectedJob.company}</p>
              </div>
              
              <button 
                onClick={handleCloseModal}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Job Details / Application Form */}
                {showApplication ? (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Apply for {selectedJob.title}</h3>
                    
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-bold text-gray-900 mb-2">Your Resume</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">{resume}</span>
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => alert("Resume upload functionality would go here")}
                        >
                          Change
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Letter (Optional)
                      </label>
                      <textarea 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                        placeholder="Explain why you're a good fit for this position..."
                      ></textarea>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={handleSubmitApplication}
                        className="bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Submit Application
                      </button>
                      <button 
                        onClick={() => setShowApplication(false)}
                        className="border border-gray-500 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Back to Job Details
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex flex-wrap gap-3 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <HiLocationMarker className="mr-1 w-4 h-4" />
                        {selectedJob.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <HiCurrencyDollar className="mr-1 w-4 h-4" />
                        {selectedJob.salary}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <HiBriefcase className="mr-1 w-4 h-4" />
                        {selectedJob.type}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <HiClock className="mr-1 w-4 h-4" />
                        {selectedJob.experience}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-900 mb-2">Job Description</h3>
                      <p className="text-gray-700">{selectedJob.description}</p>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-900 mb-2">Responsibilities</h3>
                      <ul className="list-disc pl-5 text-gray-700">
                        {selectedJob.responsibilities.map((item, index) => (
                          <li key={index} className="mb-1">{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-900 mb-2">Requirements</h3>
                      <ul className="list-disc pl-5 text-gray-700">
                        {selectedJob.requirements.map((item, index) => (
                          <li key={index} className="mb-1">{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="font-bold text-gray-900 mb-2">Benefits</h3>
                      <ul className="list-disc pl-5 text-gray-700">
                        {selectedJob.benefits.map((benefit, index) => (
                          <li key={index} className="mb-1">{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                      <span>Posted {selectedJob.posted}</span>
                      <span>{selectedJob.applicants} applicants</span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => setShowApplication(true)}
                        className="bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Apply Now
                      </button>
                      <button className="flex items-center justify-center gap-1 border border-blue-600 text-blue-600 py-2.5 px-4 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                        <HiBookmark className="w-4 h-4" />
                        <span>Save Job</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* AI Chat Section - Always below content */}
                <div className="mt-8 border-t pt-6" ref={aiChatRef}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <HiLightBulb className="text-blue-500 w-5 h-5" />
                      Job Assistant
                    </h3>
                    <button 
                      onClick={() => setShowAIChat(!showAIChat)}
                      className={`flex items-center gap-1 text-sm px-3 py-1 rounded-full ${
                        showAIChat 
                          ? "bg-blue-100 text-blue-600" 
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {showAIChat ? "Hide Assistant" : "Show Assistant"}
                      {!showAIChat && <HiArrowDown className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {showAIChat && (
                    <div className="bg-gray-50 rounded-lg border">
                      <div className="p-4">
                        {aiMessages.length === 0 ? (
                          <div className="text-center py-4">
                            <p className="text-gray-600 mb-3">
                              Ask me questions about this position, requirements, salary, or application process.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                              <button 
                                onClick={() => setAiInput("What's the salary range?")}
                                className="text-xs bg-white border px-3 py-1 rounded-full hover:bg-gray-100"
                              >
                                What's the salary?
                              </button>
                              <button 
                                onClick={() => setAiInput("What experience is required?")}
                                className="text-xs bg-white border px-3 py-1 rounded-full hover:bg-gray-100"
                              >
                                Experience needed?
                              </button>
                              <button 
                                onClick={() => setAiInput("What are the main benefits?")}
                                className="text-xs bg-white border px-3 py-1 rounded-full hover:bg-gray-100"
                              >
                                Benefits package?
                              </button>
                              <button 
                                onClick={() => setAiInput("Is this position remote?")}
                                className="text-xs bg-white border px-3 py-1 rounded-full hover:bg-gray-100"
                              >
                                Remote work?
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 max-h-60 overflow-y-auto p-2">
                            {aiMessages.map((message) => (
                              <div 
                                key={message.id}
                                className={`p-3 rounded-lg ${
                                  message.role === "user" 
                                    ? "bg-blue-100 text-blue-900 ml-6" 
                                    : "bg-white border mr-6"
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  {message.role === "ai" && (
                                    <div className="bg-blue-500 rounded-full p-1 mt-0.5">
                                      <HiLightBulb className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                  <div>
                                    <p>{message.content}</p>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {message.timestamp}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        )}
                      </div>
                      
                      <form onSubmit={handleAISubmit} className="p-3 border-t">
                        <div className="relative">
                          <input
                            type="text"
                            value={aiInput}
                            onChange={(e) => setAiInput(e.target.value)}
                            placeholder="Ask about this job..."
                            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button 
                            type="submit"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800"
                          >
                            <HiPaperAirplane className="w-5 h-5 rotate-90" />
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
