import { useState } from "react";
import { HiPaperAirplane } from "react-icons/hi";
import { comments } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function CommentInput({ postId, onCommentAdded }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError("Please write a comment");
      return;
    }

    if (!user) {
      setError("Please log in to comment");
      return;
    }

    try {
      setSending(true);
      setError(null);

      const commentData = {
        content: content.trim(),
        post_id: postId,
        user_id: user.id
      };

      const { data: newComment, error: commentError } = await comments.create(commentData);

      if (commentError) {
        console.error('Error creating comment:', commentError);
        setError('Failed to post comment. Please try again.');
        return;
      }

      // Notify parent component about the new comment
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }

      // Reset form
      setContent("");
      
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>Please log in to add a comment</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-3">
        {user?.user_metadata?.avatar_url ? (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="Your avatar"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs text-gray-600 font-semibold">
              {(user.user_metadata?.full_name || user.email)?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a comment..."
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={sending}
              />
              {error && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!content.trim() || sending}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <HiPaperAirplane className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}