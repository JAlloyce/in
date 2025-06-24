import { useState } from "react";
import { HiThumbUp, HiOutlineDotsHorizontal, HiOutlineReply } from "react-icons/hi";

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
      <div className="flex items-start">
        <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 mr-3"></div>
        <div className="flex-1">
          <div className="flex items-baseline">
            <h4 className="font-medium text-gray-900 mr-2">{user}</h4>
            <p className="text-gray-700 text-sm">{content}</p>
          </div>
          
          <div className="flex items-center mt-1 text-xs text-gray-500 space-x-3">
            <span>{time}</span>
            <button 
              className={`font-medium ${isLiked ? "text-blue-600" : ""}`}
              onClick={handleLike}
            >
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </button>
            <button className="font-medium">Reply</button>
          </div>
        </div>
        
        <div className="flex space-x-1">
          <button 
            className={`p-1 ${isLiked ? "text-blue-600" : "text-gray-400"}`}
            onClick={handleLike}
          >
            <HiThumbUp className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <HiOutlineReply className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Nested replies would go here */}
      <div className="ml-11 mt-2">
        {/* Sample nested reply - in real app, this would be mapped from replies array */}
      </div>
    </div>
  );
} 