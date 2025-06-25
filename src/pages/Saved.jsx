import { useState, useEffect } from 'react';
import { HiBookmark, HiSparkles } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { posts } from '../lib/supabase';

export default function Saved() {
  const { user, loading: authLoading } = useAuth();
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadSavedPosts();
    }
  }, [authLoading, user]);

  const loadSavedPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: savedData, error: savedError } = await posts.getSaved(user.id);
      
      if (savedError) {
        console.error('Error loading saved posts:', savedError);
        setError('Failed to load saved posts: ' + savedError.message);
        return;
      }

      setSavedPosts(savedData || []);
    } catch (err) {
      console.error('Error loading saved posts:', err);
      setError('Failed to load saved posts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (postId) => {
    try {
      const { error } = await posts.unsave(postId, user.id);
      if (error) throw error;
      
      setSavedPosts(prev => prev.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Error unsaving post:', err);
      alert('Failed to unsave post');
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your saved posts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Saved Items</h1>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadSavedPosts}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <HiBookmark className="w-6 h-6 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold">Saved Items</h1>
        </div>
        <span className="text-sm text-gray-500">{savedPosts.length} items</span>
      </div>
      
      {savedPosts.length === 0 ? (
        <div className="text-center py-12">
          <HiSparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved posts yet</h3>
          <p className="text-gray-600">Save posts you want to read later by clicking the bookmark icon</p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPosts.map(savedPost => (
            <div key={savedPost.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-2">
                    {savedPost.post?.content?.substring(0, 100)}
                    {savedPost.post?.content?.length > 100 ? '...' : ''}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>By {savedPost.post?.author?.name || 'Unknown Author'}</span>
                    <span className="mx-2">•</span>
                    <span>Saved {formatTimestamp(savedPost.created_at)}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400">
                    <span>{savedPost.post?.likes_count || 0} likes</span>
                    <span className="mx-2">•</span>
                    <span>{savedPost.post?.comments_count || 0} comments</span>
                  </div>
                </div>
                <button
                  onClick={() => handleUnsave(savedPost.post_id)}
                  className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Remove from saved"
                >
                  <HiBookmark className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 