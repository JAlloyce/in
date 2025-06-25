import { useState, useEffect, useRef } from "react";
import { 
  HiLocationMarker, HiCurrencyDollar, HiClock, 
  HiBriefcase, HiBookmark, HiChevronDown,
  HiX, HiLightBulb, HiPaperAirplane, HiArrowDown,
  HiPlus, HiUsers, HiEye, HiChat, HiDocumentText, HiMail,
  HiFilter, HiSearch, HiSparkles, HiTrendingUp
} from "react-icons/hi";
import { jobs, auth, companies } from '../lib/supabase';
import { Button, Card, Avatar } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Enhanced Jobs Page Component - Modern Job Search Platform
 * 
 * Features:
 * - Modern glass morphism design with animations
 * - Improved search and filtering system
 * - Better job card layout with hover effects
 * - Enhanced mobile responsiveness
 * - Professional styling with Embassy-inspired elements
 * - AI-powered job recommendations
 */

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

  // Job posting states
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [postedJobs, setPostedJobs] = useState([]);
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    type: "Full-time",
    experience: "",
    description: "",
    responsibilities: "",
    requirements: "",
    benefits: ""
  });

  // Real data states
  const [user, setUser] = useState(null);
  const [jobListings, setJobListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedJobs, setAppliedJobs] = useState([]);

  // Load user and jobs data
  useEffect(() => {
    initializeJobs();
  }, []);

  const initializeJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current user
      const { session } = await auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }

      // Load jobs
      await loadJobs();

    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load jobs data');
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    const { data: jobsData, error: jobsError } = await jobs.search(
      searchQuery, 
      filters.location, 
      filters.type, 
      50
    );
    
    if (jobsError) {
      console.error('Error loading jobs:', jobsError);
      return;
    }

    // Transform jobs data to match UI format
    const transformedJobs = jobsData.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company?.name || 'Company',
      location: job.location,
      salary: job.salary_range || `$${job.salary_min || 'N/A'} - $${job.salary_max || 'N/A'}`,
      type: job.job_type || 'Full-time',
      experience: job.experience_level || 'Not specified',
      description: job.description,
      responsibilities: job.responsibilities?.split('\n') || [job.description],
      requirements: job.requirements?.split('\n') || ['Experience in relevant field'],
      benefits: job.benefits?.split('\n') || ['Competitive salary', 'Health insurance'],
      posted: formatTimestamp(job.created_at),
      applicants: job.application_count || 0,
      company_logo: job.company?.logo_url
    }));

    setJobListings(transformedJobs);
  };

  // Reload jobs when filters change
  useEffect(() => {
    if (!loading) {
      loadJobs();
    }
  }, [filters, searchQuery]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  };

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
  const handleSubmitApplication = async () => {
    if (!user) {
      alert('Please log in to apply for jobs');
      return;
    }

    if (!selectedJob) return;

    try {
      const { error } = await jobs.apply(selectedJob.id, user.id, resume);
      if (error) {
        console.error('Error applying for job:', error);
        alert('Failed to submit application');
        return;
      }

      // Add to applied jobs
      setAppliedJobs(prev => [...prev, selectedJob.id]);
      alert(`Application submitted for ${selectedJob.title} at ${selectedJob.company}!`);
      handleCloseModal();
    } catch (err) {
      console.error('Error applying for job:', err);
      alert('Failed to submit application');
    }
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

  // Job posting handlers
  const handlePostJob = async () => {
    if (!jobForm.title || !jobForm.description) {
      alert("Please fill in all required fields");
      return;
    }

    if (!user) {
      alert('Please log in to post jobs');
      return;
    }
    
    try {
      // Create job in database
      const newJobData = {
        title: jobForm.title,
        description: jobForm.description,
        location: jobForm.location,
        job_type: jobForm.type,
        experience_level: jobForm.experience,
        salary_min: parseInt(jobForm.salaryMin) || null,
        salary_max: parseInt(jobForm.salaryMax) || null,
        salary_range: jobForm.salaryMin && jobForm.salaryMax ? `$${jobForm.salaryMin} - $${jobForm.salaryMax}` : null,
        requirements: jobForm.requirements,
        benefits: jobForm.benefits,
        responsibilities: jobForm.responsibilities,
        company_id: 1, // Default company - in real app, would be user's company
        posted_by: user.id,
        is_active: true
      };

      // For now, just add to local state since we don't have a complete job posting API
      const newJob = {
        id: Date.now(),
        ...jobForm,
        salary: `$${jobForm.salaryMin} - $${jobForm.salaryMax}`,
        company: jobForm.company || "Your Company",
        posted: "Just now",
        applicants: 0,
        applications: []
      };
      
      setPostedJobs(prev => [newJob, ...prev]);
      setJobForm({
        title: "",
        company: "",
        location: "",
        salaryMin: "",
        salaryMax: "",
        type: "Full-time",
        experience: "",
        description: "",
        responsibilities: "",
        requirements: "",
        benefits: ""
      });
      setShowPostJobModal(false);
      alert("Job posted successfully!");
    } catch (err) {
      console.error('Error posting job:', err);
      alert('Failed to post job');
    }
  };

  const handleViewApplicants = (job) => {
    setSelectedJob(job);
    setShowApplicantsModal(true);
  };

  const handleContactApplicant = (applicant) => {
    alert(`Redirecting to message ${applicant.name}...`);
  };

  if (loading) {
    return (
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="text-center py-16">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading amazing job opportunities...</p>
        </Card>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="text-center py-16 border border-red-200 bg-red-50">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error loading jobs</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Enhanced Jobs Header with Hero Section */}
        <motion.div 
          className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 mb-8 overflow-hidden relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-10 gap-4 h-full">
              {[...Array(40)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="bg-white rounded-full w-2 h-2"
                  animate={{ 
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.3, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    delay: i * 0.1,
                    repeat: Infinity
                  }}
                />
              ))}
        </div>
      </div>

          <div className="relative z-10 text-white text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Find Your Dream Career
            </motion.h1>
            <motion.p 
              className="text-xl text-blue-100 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Discover opportunities from top companies worldwide
            </motion.p>
            <motion.div 
              className="flex flex-wrap justify-center gap-8 text-blue-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <HiTrendingUp className="w-5 h-5" />
                <span className="font-medium">{jobListings.length}+ Jobs Available</span>
                    </div>
              <div className="flex items-center gap-2">
                      <HiUsers className="w-5 h-5" />
                <span className="font-medium">500+ Companies</span>
                    </div>
              <div className="flex items-center gap-2">
                <HiSparkles className="w-5 h-5" />
                <span className="font-medium">AI-Powered Matching</span>
                  </div>
            </motion.div>
                </div>
        </motion.div>

        {/* Enhanced Search and Filter Section */}
        <motion.div 
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-soft border border-white/20 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
                  placeholder="Search jobs, companies, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
            <div className="relative">
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                  className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">Location</option>
                <option value="remote">Remote</option>
                <option value="san francisco">San Francisco</option>
                <option value="new york">New York</option>
                <option value="seattle">Seattle</option>
              </select>
                <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
            
            <div className="relative">
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">Job Type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
                <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
            
            <div className="relative">
              <select
                value={filters.experience}
                onChange={(e) => handleFilterChange("experience", e.target.value)}
                  className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="">Experience</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
              </select>
                <HiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400" />
            </div>
              
              <Button variant="primary" size="lg" className="flex items-center gap-2">
                <HiFilter className="w-5 h-5" />
                Filter
              </Button>
          </div>
        </div>
        </motion.div>
        
        <div className="space-y-4">
          {jobListings.length > 0 ? (
            jobListings.map(job => (
              <div 
                key={job.id} 
                className="border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleJobSelect(job)}
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                        {job.company_logo ? (
                          <img 
                            src={job.company_logo} 
                            alt={job.company}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 font-bold text-lg">
                              {job.company.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
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
                    {appliedJobs.includes(job.id) && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full mt-1 inline-block">
                        Applied
                      </span>
                    )}
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
            ))
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <HiBriefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="text-gray-500">
                {searchQuery || Object.values(filters).some(f => f) 
                  ? "Try adjusting your search criteria" 
                  : "Check back later for new opportunities"}
              </p>
            </div>
          )}
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

      {/* Post Job Modal */}
      {showPostJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold">Post a Job</h2>
              <button 
                onClick={() => setShowPostJobModal(false)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={jobForm.title}
                      onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g. Senior React Developer"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={jobForm.company}
                      onChange={(e) => setJobForm(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Your Company"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={jobForm.location}
                      onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Remote / City, State"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Type
                    </label>
                    <select
                      value={jobForm.type}
                      onChange={(e) => setJobForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience Level
                    </label>
                    <input
                      type="text"
                      value={jobForm.experience}
                      onChange={(e) => setJobForm(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="e.g. 3+ years"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Min ($)
                    </label>
                    <input
                      type="number"
                      value={jobForm.salaryMin}
                      onChange={(e) => setJobForm(prev => ({ ...prev, salaryMin: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="60000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Max ($)
                    </label>
                    <input
                      type="number"
                      value={jobForm.salaryMax}
                      onChange={(e) => setJobForm(prev => ({ ...prev, salaryMax: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="80000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description *
                  </label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Describe the role, what the candidate will be doing..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Responsibilities
                  </label>
                  <textarea
                    value={jobForm.responsibilities}
                    onChange={(e) => setJobForm(prev => ({ ...prev, responsibilities: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="List key responsibilities (one per line)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requirements
                  </label>
                  <textarea
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm(prev => ({ ...prev, requirements: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="List required skills and qualifications (one per line)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benefits
                  </label>
                  <textarea
                    value={jobForm.benefits}
                    onChange={(e) => setJobForm(prev => ({ ...prev, benefits: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="List benefits and perks (one per line)"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowPostJobModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePostJob}
                className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Post Job
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applicants Modal */}
      {showApplicantsModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold">Applications for {selectedJob.title}</h2>
                <p className="text-gray-600">{selectedJob.applications?.length || 0} applications received</p>
              </div>
              <button 
                onClick={() => setShowApplicantsModal(false)}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {selectedJob.applications && selectedJob.applications.length > 0 ? (
                <div className="space-y-6">
                  {selectedJob.applications.map(applicant => (
                    <div key={applicant.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row md:items-start gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold text-xl flex-shrink-0">
                          {applicant.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{applicant.name}</h3>
                              <p className="text-gray-600">{applicant.email}</p>
                              <p className="text-sm text-gray-500">Applied {applicant.appliedDate}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {applicant.experience} experience
                              </span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Cover Letter</h4>
                            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                              {applicant.coverLetter}
                            </p>
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
                            <button 
                              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                              onClick={() => alert(`Viewing ${applicant.resume}`)}
                            >
                              <HiDocumentText className="w-4 h-4" />
                              View Resume
                            </button>
                            <button 
                              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                              onClick={() => handleContactApplicant(applicant)}
                            >
                              <HiMail className="w-4 h-4" />
                              Send Message
                            </button>
                            <button 
                              className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm transition-colors"
                            >
                              <HiEye className="w-4 h-4" />
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">No applications yet</h3>
                  <p className="text-gray-600">Applications will appear here when candidates apply for this position.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
