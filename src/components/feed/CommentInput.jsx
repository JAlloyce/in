import { useState } from "react";
import { HiPaperAirplane } from "react-icons/hi";
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button, Avatar } from '../ui';

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

      console.log('💬 Creating comment with improved service...');

      // Get current authenticated user for security
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      if (authError || !currentUser) {
        setError('User not authenticated');
        return;
      }

      const commentData = {
        content: content.trim(),
        post_id: postId,
        author_id: currentUser.id
      };

      const { data: newComment, error: commentError } = await supabase
        .from('comments')
        .insert(commentData)
        .select(`
          *,
          profiles!comments_author_id_fkey (
            id,
            name,
            avatar_url,
            headline
          )
        `)
        .single();

      if (commentError) {
        console.error('Error creating comment:', commentError);
        setError('Failed to post comment. Please try again.');
        return;
      }

      console.log('✅ Comment created successfully:', newComment);

      // Notify parent component about the new comment
      if (onCommentAdded) {
        // Transform the comment to match expected format
        const transformedComment = {
          id: newComment.id,
          content: newComment.content,
          created_at: newComment.created_at,
          user: newComment.profiles,
          author: newComment.profiles // Fallback for different naming conventions
        };
        onCommentAdded(transformedComment);
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
      <div className="text-center py-4">
        <p className="text-body text-gray-500">Please log in to add a comment</p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-4">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Avatar 
          src={user.user_metadata?.avatar_url} 
          alt={user.user_metadata?.name || user.email} 
          size="sm"
        />
        
        <div className="flex-1">
          <div className="flex">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              disabled={sending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            
            <Button
              type="submit"
              disabled={sending || !content.trim()}
              className="rounded-l-none border-l-0"
              size="sm"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <HiPaperAirplane className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}