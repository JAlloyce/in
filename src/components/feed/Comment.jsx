import { useState } from "react";
import { HiThumbUp, HiOutlineDotsHorizontal, HiOutlineReply } from "react-icons/hi";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { Button, Avatar } from '../ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

/**
 * Responsive Comment Component
 * 
 * Features:
 * - Mobile-first responsive design
 * - Touch-optimized controls
 * - Proper spacing and typography
 * - Accessibility compliant
 * - Backend integration for likes and replies
 * - User profile navigation
 */
export default function Comment({ 
  id, 
  user, 
  userId, 
  userAvatar,
  role, 
  content, 
  time, 
  likes = 0, 
  liked = false, 
  postId,
  parentId = null,
  replies = [],
  onReplyAdded,
  level = 0 // For nested indentation
}) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(likes);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commentReplies, setCommentReplies] = useState(replies);
  
  const { user: currentUser } = useAuth();
  const { showError, showSuccess } = useNotifications();
  const navigate = useNavigate();
  
  const handleLike = async () => {
    if (!currentUser) {
      showError('Please log in to like comments');
      return;
    }

    try {
      const newLikedState = !isLiked;
      const newCount = newLikedState ? likeCount + 1 : likeCount - 1;
      
      // Optimistic update
      setIsLiked(newLikedState);
      setLikeCount(newCount);
      
      if (newLikedState) {
        // Like the comment
        const { error } = await supabase
          .from('comment_likes')
          .insert({ 
            comment_id: id, 
            user_id: currentUser.id
          });
          
        if (error) {
          // Revert optimistic update on error
          setIsLiked(false);
          setLikeCount(likeCount);
          showError('Failed to like comment');
          return;
        }
        
        showSuccess('Comment liked!');
      } else {
        // Unlike the comment
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', id)
          .eq('user_id', currentUser.id);
          
        if (error) {
          // Revert optimistic update on error
          setIsLiked(true);
          setLikeCount(likeCount);
          showError('Failed to unlike comment');
          return;
        }
        
        showSuccess('Comment unliked!');
      }
      
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLikeCount(likeCount);
      showError('Error handling like');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          parent_id: id, // Set parent_id to create a threaded reply
          author_id: currentUser.id,
          content: replyText.trim(),
        })
        .select(`
          id,
          content,
          created_at,
          author_id,
          parent_id,
          profiles:author_id (
            id,
            name,
            avatar_url,
            headline
          )
        `)
        .single();

      if (error) {
        console.error('Reply submission error:', error);
        showError('Failed to submit reply');
        return;
      }

      // Create the reply object
      const newReply = {
        id: data.id,
        user: data.profiles?.name || 'Anonymous',
        userId: data.author_id,
        userAvatar: data.profiles?.avatar_url,
        role: data.profiles?.headline,
        content: data.content,
        time: 'now',
        likes: 0,
        liked: false,
        parentId: data.parent_id,
        replies: []
      };

      // Add reply to local state
      setCommentReplies(prev => [...prev, newReply]);

      // Call the callback to notify parent
      if (onReplyAdded) {
        onReplyAdded(newReply);
      }

      setReplyText('');
      setShowReplyInput(false);
      showSuccess('Reply added successfully!');
    } catch (error) {
      console.error('Reply error:', error);
      showError('Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-3 border-b border-gray-100 last:border-0 mobile-safe"
      style={{ marginLeft: `${level * 20}px` }} // Indent nested replies
    >
      <div className="flex items-start gap-3">
        <div 
          onClick={handleUserClick}
          className="cursor-pointer flex-shrink-0"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleUserClick()}
        >
          <Avatar 
            name={user} 
            src={userAvatar}
            size="sm" 
            className="hover:ring-2 hover:ring-blue-500 transition-all" 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className="mb-1">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 
                  onClick={handleUserClick}
                  className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                >
                  {user}
                </h4>
                {role && (
                  <p className="text-xs text-gray-500 truncate">{role}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{time}</span>
            </div>
          </div>
          
          {/* Comment Content */}
          <div className="mb-2">
            <p className="text-sm text-gray-700 leading-relaxed break-words">{content}</p>
          </div>
          
          {/* Comment Actions - Mobile Optimized */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors touch-target focus-visible ${
                isLiked 
                  ? 'text-blue-600 hover:text-blue-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <HiThumbUp className="w-3 h-3" />
              <span>{likeCount}</span>
            </button>
            
            {/* Only show reply button for top-level comments or first-level replies */}
            {level < 2 && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors touch-target focus-visible"
              >
                Reply
              </button>
            )}
          </div>
          
          {/* Reply Input */}
          {showReplyInput && currentUser && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <form onSubmit={handleReply} className="flex gap-2">
                <div 
                  onClick={() => navigate(`/profile/${currentUser.id}`)}
                  className="cursor-pointer flex-shrink-0"
                >
                  <Avatar 
                    name={currentUser.name} 
                    src={currentUser.avatar_url}
                    size="xs" 
                    className="hover:ring-2 hover:ring-blue-500 transition-all"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${user}...`}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mobile-safe"
                    style={{ fontSize: '16px' }} // Prevent iOS zoom
                    disabled={submitting}
                  />
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowReplyInput(false);
                        setReplyText('');
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!replyText.trim() || submitting}
                      loading={submitting}
                    >
                      {submitting ? 'Replying...' : 'Reply'}
                    </Button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
          
          {!currentUser && showReplyInput && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Please log in to reply to comments.</p>
            </div>
          )}
        </div>
      </div>

      {/* Nested Replies */}
      {commentReplies.length > 0 && (
        <div className="mt-2">
          {commentReplies.map(reply => (
            <Comment
              key={reply.id}
              id={reply.id}
              user={reply.user}
              userId={reply.userId}
              userAvatar={reply.userAvatar}
              role={reply.role}
              content={reply.content}
              time={reply.time}
              likes={reply.likes}
              liked={reply.liked}
              postId={postId}
              parentId={reply.parentId}
              replies={reply.replies || []}
              level={level + 1}
              onReplyAdded={(newReply) => {
                // Handle nested reply
                setCommentReplies(prev => prev.map(r => 
                  r.id === reply.id 
                    ? { ...r, replies: [...(r.replies || []), newReply] }
                    : r
                ));
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
} 