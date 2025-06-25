import { useState } from "react";
import { HiPaperAirplane } from "react-icons/hi";
import { comments } from '../../lib/supabase';
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

      const commentData = {
        content: content.trim(),
        post_id: postId,
        author_id: user.id
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
      <div className="text-center py-4">
        <p className="text-body text-gray-500">Please log in to add a comment</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex gap-3">
        <Avatar 
          src={user?.user_metadata?.avatar_url}
          name={user.user_metadata?.full_name || user.email}
          size="sm"
        />
        
        <div className="flex-1">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a comment..."
                rows="2"
                className="input-system resize-none"
                disabled={sending}
              />
              {error && (
                <p className="text-body-small text-red-500 mt-1">{error}</p>
              )}
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!content.trim() || sending}
              loading={sending}
              className="flex-shrink-0"
            >
              <HiPaperAirplane className="icon-system-sm" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}