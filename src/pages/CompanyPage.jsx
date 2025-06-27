import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  FaBuilding 
} from "react-icons/fa";
import { 
  HiUserGroup, HiGlobeAlt, HiLocationMarker, 
  HiCalendar, HiBriefcase, HiNewspaper, HiStar, 
  HiOutlineBookmark, HiShare, HiPlus, HiBadgeCheck,
  HiOfficeBuilding, HiTrendingUp, HiPhone, HiMail,
  HiHeart, HiEye
} from "react-icons/hi";
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * CompanyPage Component - Dynamic Company Profile
 * 
 * Features:
 * - Real company data from Supabase
 * - Follow/unfollow functionality
 * - Responsive modern design
 * - Dynamic content loading
 * - Professional layout
 */
export default function CompanyPage() {
  const { companyId } = useParams();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [following, setFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async (id) => {
      try {
        if (isCancelled) return;
        setCompany(null);
        setPosts([]);
        setJobs([]);
        setLoading(true);
        setError('');

        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .single();

        if (isCancelled) return;

        if (companyError || !companyData) {
          if (!isCancelled) {
            setError('Company not found');
            setCompany(null);
          }
          return;
        }

        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('*')
          .eq('post_type', 'page')
          .eq('source_id', id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (isCancelled) return;
        if (postsError) console.error('Error fetching posts:', postsError);

        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('company_id', id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(10);

        if (isCancelled) return;
        if (jobsError) console.error('Error fetching jobs:', jobsError);

        if (!isCancelled) {
          setCompany(companyData);
          setPosts(postsData || []);
          setJobs(jobsData || []);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('Error loading company data:', err);
          setError('Failed to load company data');
          setCompany(null);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    if (companyId) {
      loadData(companyId);
    }

    return () => {
      isCancelled = true;
    };
  }, [companyId]);

  useEffect(() => {
    let isCancelled = false;
    const checkFollow = async (id) => {
      if (!user) {
        setFollowing(false);
        return;
      }

      try {
        const { count } = await supabase
          .from('company_followers')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', id)
          .eq('user_id', user.id);
        
        if (!isCancelled) {
            setFollowing(count > 0);
        }
      } catch (err) {
        console.error('Error checking follow status:', err);
        if (!isCancelled) {
            setFollowing(false);
        }
      }
    };

    if (companyId) {
      checkFollow(companyId);
    }

    return () => {
        isCancelled = true;
    }
  }, [companyId, user]);

  const handleFollowToggle = async () => {
    if (!user) {
      setError('Please sign in to follow companies');
      return;
    }

    try {
      if (following) {
        await supabase
          .from('company_followers')
          .delete()
          .eq('company_id', companyId)
          .eq('user_id', user.id);
        
        await supabase.rpc('decrement_follower_count', { p_company_id: companyId });
        setFollowing(false);
        setCompany(prev => prev ? { ...prev, follower_count: Math.max((prev.follower_count || 0) - 1, 0) } : null);
      } else {
        await supabase
          .from('company_followers')
          .insert({
            company_id: companyId,
            user_id: user.id
          });
        
        await supabase.rpc('increment_follower_count', { p_company_id: companyId });
        setFollowing(true);
        setCompany(prev => prev ? { ...prev, follower_count: (prev.follower_count || 0) + 1 } : null);
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
      setError('Failed to update follow status');
    }
  };

  const formatFollowerCount = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-xl"></div>
            <div className="p-8 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <HiOfficeBuilding className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Company Not Found</h2>
            <p className="text-gray-600">The company you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Company Header */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden mb-6">
          <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          <div className="px-6 pb-6 -mt-16">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end">
              <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center mx-auto sm:mx-0">
                  <FaBuilding className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{company.name}</h1>
                    {company.verified && (
                      <HiBadgeCheck className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                  <p className="text-base sm:text-lg text-gray-600 mt-1 capitalize">{company.industry}</p>
                  
                  <div className="mt-3">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {company.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs sm:text-sm justify-center sm:justify-start">
                    <span className="flex items-center">
                      <HiUserGroup className="w-4 h-4 mr-1" />
                      {formatFollowerCount(company.follower_count)} followers
                    </span>
                    {company.location && (
                      <span className="flex items-center">
                        <HiLocationMarker className="w-4 h-4 mr-1" />
                        {company.location}
                      </span>
                    )}
                    {company.website && (
                      <span className="flex items-center">
                        <HiGlobeAlt className="w-4 h-4 mr-1" />
                        <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} className="text-blue-600 hover:underline">
                          Website
                        </a>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4 sm:mt-0 justify-center sm:justify-end">
                <button 
                  onClick={handleFollowToggle}
                  className={`px-4 sm:px-6 py-2 rounded-full font-medium text-sm sm:text-base transition-colors ${
                    following 
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {following ? "Following" : "Follow"}
                </button>
                <button className="p-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100">
                  <HiShare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="flex overflow-x-auto border-b">
            {["overview", "posts", "jobs"].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">About</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {company.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 text-lg">Company Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <FaBuilding className="w-4 h-4 mr-3 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm text-gray-600 block">Industry</span>
                          <span className="font-medium text-gray-900 capitalize">{company.industry}</span>
                        </div>
                      </div>
                      {company.founded_year && (
                        <div className="flex items-start">
                          <HiCalendar className="w-4 h-4 mr-3 text-gray-500 mt-0.5" />
                          <div>
                            <span className="text-sm text-gray-600 block">Founded</span>
                            <span className="font-medium text-gray-900">{company.founded_year}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start">
                        <HiUserGroup className="w-4 h-4 mr-3 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm text-gray-600 block">Followers</span>
                          <span className="font-medium text-gray-900">{formatFollowerCount(company.follower_count)}</span>
                        </div>
                      </div>
                      {company.location && (
                        <div className="flex items-start">
                          <HiLocationMarker className="w-4 h-4 mr-3 text-gray-500 mt-0.5" />
                          <div>
                            <span className="text-sm text-gray-600 block">Location</span>
                            <span className="font-medium text-gray-900">{company.location}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "posts" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Posts</h2>
                {posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map(post => (
                      <div key={post.id} className="border rounded-lg p-4">
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <FaBuilding className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{company.name}</h3>
                            <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className="text-gray-800 mb-3">{post.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{post.likes_count || 0} likes</span>
                          <span>{post.comments_count || 0} comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HiNewspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No posts yet</h3>
                    <p className="text-gray-500">This company hasn't shared any updates.</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "jobs" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Jobs</h2>
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map(job => (
                      <div key={job.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <span className="text-sm text-gray-500">{new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="capitalize">{job.job_type}</span>
                          {job.location && <span>{job.location}</span>}
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{job.description}</p>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
                          Apply Now
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HiBriefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No jobs available</h3>
                    <p className="text-gray-500">This company has no open positions.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 