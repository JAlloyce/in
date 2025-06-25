import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { posts, comments } from '../lib/supabase';
import { HiChat, HiHeart, HiShare, HiOutlineNewspaper } from 'react-icons/hi';
import { Card, Avatar } from '../components/ui';

export default function Recent() {
  const { user } = useAuth();
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUserActivity = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Load user's posts
        const { data: userPosts, error: postsError } = await posts.getByUser(user.id, 10);
        if (postsError) throw postsError;

        // Create activity items from posts
        const activities = [];
        
        if (userPosts) {
          userPosts.forEach(post => {
            activities.push({
              id: `post-${post.id}`,
              type: 'post',
              action: 'created a post',
              content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
              timestamp: new Date(post.created_at),
              icon: HiOutlineNewspaper,
              color: 'blue'
            });
          });
        }

        // Sort activities by timestamp (most recent first)
        activities.sort((a, b) => b.timestamp - a.timestamp);
        
        setUserActivity(activities.slice(0, 20)); // Show last 20 activities
        
      } catch (err) {
        console.error('Error loading user activity:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadUserActivity();
  }, [user]);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return 'Less than an hour ago';
    }
  };

  const getActivityIcon = (activity) => {
    const IconComponent = activity.icon;
    return (
      <div className={`w-10 h-10 bg-${activity.color}-100 rounded-full flex items-center justify-center`}>
        <IconComponent className={`w-5 h-5 text-${activity.color}-600`} />
      </div>
    );
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Recent Activity</h1>
        <p className="text-gray-500">Please log in to see your recent activity.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Recent Activity</h1>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Recent Activity</h1>
        <p className="text-red-500">Error loading activity: {error}</p>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h1 className="text-2xl font-bold mb-6">Recent Activity</h1>
      
      {userActivity.length === 0 ? (
        <div className="text-center py-8">
          <HiOutlineNewspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
          <p className="text-gray-500">Start engaging with posts, commenting, and sharing to see your activity here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {userActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              {getActivityIcon(activity)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">
                    You {activity.action}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
                {activity.content && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    "{activity.content}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
} 