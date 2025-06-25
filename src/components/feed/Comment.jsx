import { useState } from "react";
import { HiThumbUp, HiOutlineDotsHorizontal, HiOutlineReply } from "react-icons/hi";
import { Button, Avatar } from '../ui';

export default function Comment({ user, role, content, time, likes, liked }) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(likes);
  
  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-start gap-3">
        <Avatar name={user} size="sm" />
        
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <h4 className="text-body font-medium text-gray-900">{user}</h4>
            <p className="text-body text-gray-700">{content}</p>
          </div>
          
          <div className="flex items-center mt-1 gap-3">
            <span className="text-caption">{time}</span>
            <Button 
              variant="ghost"
              size="sm"
              className={`text-caption p-0 h-auto ${isLiked ? "text-blue-600" : "text-gray-500"}`}
              onClick={handleLike}
            >
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </Button>
            <Button 
              variant="ghost"
              size="sm"
              className="text-caption p-0 h-auto"
            >
              Reply
            </Button>
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto ${isLiked ? "text-blue-600" : "text-gray-400"}`}
            onClick={handleLike}
          >
            <HiThumbUp className="icon-system-sm" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto text-gray-400 hover:text-gray-600"
          >
            <HiOutlineReply className="icon-system-sm" />
          </Button>
        </div>
      </div>
      
      {/* Nested replies would go here */}
      <div className="ml-11 mt-2">
        {/* Sample nested reply - in real app, this would be mapped from replies array */}
      </div>
    </div>
  );
} 