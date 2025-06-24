import { useState } from "react";
import { HiLocationMarker, HiCurrencyDollar, HiClock, HiBriefcase } from "react-icons/hi";

export default function Jobs() {
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
      benefits: [
        "Unlimited PTO",
        "Home office stipend",
        "Health and wellness benefits",
        "Flexible schedule",
        "Professional development opportunities"
      ],
      posted: "1 week ago",
      applicants: 37,
    }
  ];

  const [selectedJob, setSelectedJob] = useState(jobListings[0]);
  const [showApplication, setShowApplication] = useState(false);
  const [resume, setResume] = useState("john_doe_resume.pdf");

  const handleApply = () => {
    setShowApplication(true);
  };

  const handleSubmitApplication = () => {
    alert(`Application submitted for ${selectedJob.title} at ${selectedJob.company}!`);
    setShowApplication(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-6">Job Listings</h1>
          
          <div className="space-y-6">
            {jobListings.map(job => (
              <div 
                key={job.id} 
                className={`border rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer ${
                  selectedJob.id === job.id ? 'border-blue-500 border-2' : ''
                }`}
                onClick={() => {
                  setSelectedJob(job);
                  setShowApplication(false);
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                    <p className="text-lg text-gray-600">{job.company}</p>
                    
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
      </div>
      
      <div className="space-y-6">
        {!showApplication ? (
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">{selectedJob.title}</h2>
            <p className="text-lg text-gray-600 mb-2">{selectedJob.company}</p>
            
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
              <h3 className="font-bold text-gray-900 mb-2">Benefits</h3>
              <ul className="list-disc pl-5 text-gray-700">
                {selectedJob.benefits.map((benefit, index) => (
                  <li key={index} className="mb-1">{benefit}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Posted {selectedJob.posted}</span>
              <span>{selectedJob.applicants} applicants</span>
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              <button 
                onClick={handleApply}
                className="bg-blue-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Apply Now
              </button>
              <button className="border border-blue-600 text-blue-600 py-2.5 px-4 rounded-md font-medium hover:bg-blue-50 transition-colors">
                Save Job
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Apply for {selectedJob.title}</h2>
            
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">Your Resume</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">{resume}</span>
                <button className="text-blue-600 hover:text-blue-800">Change</button>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter (Optional)</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                placeholder="Explain why you're a good fit for this position..."
              ></textarea>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSubmitApplication}
                className="bg-blue-600 text-white py-2.5 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Submit Application
              </button>
              <button 
                onClick={() => setShowApplication(false)}
                className="border border-gray-500 text-gray-700 py-2.5 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Similar Jobs</h3>
          <div className="space-y-3">
            {jobListings.filter(job => job.id !== selectedJob.id).map(job => (
              <div 
                key={job.id} 
                className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedJob(job)}
              >
                <h4 className="font-medium text-gray-900">{job.title}</h4>
                <p className="text-sm text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-500">{job.location}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
