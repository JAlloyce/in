import { useState } from "react";
import { HiThumbUp, HiOutlineDotsHorizontal, HiOutlineReply } from "react-icons/hi";
import { motion } from "framer-motion";
import { Button, Avatar } from '../ui';

/**
 * Responsive Comment Component
 * 
 * Features:
 * - Mobile-first responsive design
 * - Touch-optimized controls
 * - Proper spacing and typography
 * - Accessibility compliant
 */
export default function Comment({ user, role, content, time, likes, liked }) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(likes);
  const [showReplyInput, setShowReplyInput] = useState(false);
  
  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-3 border-b border-gray-100 last:border-0 mobile-safe"
    >
      <div className="flex items-start gap-3">
        <Avatar name={user} size="sm" className="flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          {/* Comment Header */}
          <div className="mb-1">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">{user}</h4>
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
            
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors touch-target focus-visible"
            >
              Reply
            </button>
          </div>
          
          {/* Reply Input */}
          {showReplyInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pl-4 border-l-2 border-gray-200"
            >
              <div className="flex gap-2">
                <Avatar name="You" size="xs" className="flex-shrink-0" />
                <div className="flex-1">
                  <textarea
                    placeholder="Write a reply..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mobile-safe"
                    style={{ fontSize: '16px' }} // Prevent iOS zoom
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setShowReplyInput(false)}
                      className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors touch-target"
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors touch-target focus-visible"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Like Button - Mobile Friendly */}
        <button
          onClick={handleLike}
          className={`p-2 rounded-lg transition-colors touch-target focus-visible ${
            isLiked 
              ? 'text-blue-600 hover:bg-blue-50' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
          }`}
          aria-label={isLiked ? 'Unlike comment' : 'Like comment'}
        >
          <HiThumbUp className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
} 