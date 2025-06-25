import { useState, useRef, useEffect } from "react"
import { 
  HiSearch, HiPaperClip, HiEmojiHappy, HiMicrophone, 
  HiPaperAirplane, HiDotsVertical, HiOutlinePhone, 
  HiOutlineReply, HiOutlineDuplicate, HiX, HiOutlineUserCircle,
  HiFlag, HiEyeOff
} from "react-icons/hi"

/**
 * Messaging Page Component - Mobile-Optimized Communication Hub
 * 
 * Features:
 * - Fixed user icon sizing and proper mobile layout
 * - Removed unnecessary bookmark and video call buttons
 * - Added 3 dots menu with report functionality
 * - Responsive modal design that works on all screen sizes
 * - Professional messaging interface with LinkedIn-style UX
 */
export default function Messaging() {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      position: "Senior Designer",
      company: "InnovateX",
      lastMessage: "Thanks for connecting! Looking forward to collaborating.",
      time: "2h",
      unread: true,
      avatar: "SJ",
    },
    {
      id: 2,
      name: "Michael Chen",
      position: "Product Manager",
      company: "TechVision",
      lastMessage: "The project proposal looks great. Let's discuss tomorrow.",
      time: "4h",
      unread: false,
      avatar: "MC",
    },
    {
      id: 3,
      name: "Alex Rodriguez",
      position: "Frontend Developer",
      company: "Digital Solutions",
      lastMessage: "Can you review the UI designs?",
      time: "1d",
      unread: false,
      avatar: "AR",
    },
    {
      id: 4,
      name: "Emma Wilson",
      position: "Marketing Director",
      company: "BrandBoost",
      lastMessage: "The meeting is rescheduled to 3 PM.",
      time: "2d",
      unread: true,
      avatar: "EW",
    },
  ])

  const [activeConversation, setActiveConversation] = useState(null)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const messagesEndRef = useRef(null)
  
  // Initialize messages for each conversation
  useEffect(() => {
    const initialMessages = {
      1: [
    {
      id: 1,
      sender: "Sarah Johnson",
      content: "Hi John! Thanks for connecting with me on LinkedIn.",
      time: "2:30 PM",
      isMe: false,
    },
    {
      id: 2,
      sender: "Me",
      content: "Hi Sarah! Great to connect. I saw your work at InnovateX and was really impressed.",
      time: "2:32 PM",
      isMe: true,
    },
    {
      id: 3,
      sender: "Sarah Johnson",
      content: "Thank you! I've been following your projects too. Would you be open to a quick chat next week?",
      time: "2:35 PM",
      isMe: false,
    },
      ],
      2: [
        {
          id: 1,
          sender: "Michael Chen",
          content: "Hi there, I wanted to follow up on our project discussion.",
          time: "10:15 AM",
          isMe: false,
        },
        {
          id: 2,
          sender: "Me",
          content: "Hi Michael, yes I've reviewed the proposal. It looks solid overall.",
          time: "10:30 AM",
          isMe: true,
        },
      ],
      3: [
        {
          id: 1,
          sender: "Alex Rodriguez",
          content: "Could you take a look at the UI designs I shared?",
          time: "3:45 PM",
          isMe: false,
        },
      ],
      4: [
        {
          id: 1,
          sender: "Emma Wilson",
          content: "Just confirming our meeting moved to 3 PM tomorrow.",
          time: "9:20 AM",
          isMe: false,
        },
        {
          id: 2,
          sender: "Me",
          content: "Thanks for the update, 3 PM works for me.",
          time: "9:25 AM",
          isMe: true,
        },
      ],
    }
    
    setMessages(initialMessages)
  }, [])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, activeConversation])

  const handleSendMessage = () => {
    if (message.trim() === "" || !activeConversation) return
    
    const conversationId = activeConversation.id
    const newMessage = {
      id: messages[conversationId].length + 1,
      sender: "Me",
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    }
    
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...prev[conversationId], newMessage]
    }))
    setMessage("")
    
    // Reset reply if we were replying to a message
    if (replyingTo) {
      setReplyingTo(null)
    }
    
    // Simulate reply after 1-3 seconds
    setTimeout(() => {
      const replies = [
        "That sounds great!",
        "I'll check my calendar and get back to you.",
        "Can you send me more details?",
        "Looking forward to it!",
        "Thanks for your response."
      ]
      
      const reply = {
        id: (messages[conversationId] || []).length + 2,
        sender: activeConversation.name,
        content: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
      }
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), reply]
      }))
    }, 1000 + Math.random() * 2000)
  }

  const markAsRead = (id) => {
    setConversations(convs => 
      convs.map(conv => 
        conv.id === id ? { ...conv, unread: false } : conv
      )
    )
  }

  const openConversation = (conversation) => {
    setActiveConversation(conversation)
    markAsRead(conversation.id)
    setShowModal(true)
  }

  const closeConversation = () => {
    setShowModal(false)
    setActiveConversation(null)
    setReplyingTo(null)
    setShowMoreMenu(false)
  }

  const handleMessageAction = (message, action) => {
    setSelectedMessage(message)
    
    switch(action) {
      case 'reply':
        setReplyingTo(message)
        break
      case 'copy':
        navigator.clipboard.writeText(message.content)
        alert('Message copied to clipboard!')
        break
      default:
        break
    }
  }

  const handleAudioCall = () => {
    alert(`Starting audio call with ${activeConversation.name}...`)
  }

  const handleReport = () => {
    alert(`Reported conversation with ${activeConversation.name}`)
    setShowMoreMenu(false)
  }

  const handleBlock = () => {
    if (window.confirm(`Are you sure you want to block ${activeConversation.name}?`)) {
      alert(`Blocked ${activeConversation.name}`)
      setShowMoreMenu(false)
      closeConversation()
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] max-h-screen bg-blue-50 p-4 rounded-lg">
      {/* Conversations List */}
      <div className="w-full bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Messages</h2>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <HiDotsVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="p-3 border-b">
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages"
              className="w-full pl-10 pr-3 py-2 bg-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer flex items-center ${
                activeConversation?.id === conversation.id ? "bg-blue-50" : ""
              }`}
              onClick={() => openConversation(conversation)}
            >
              <div className="relative mr-3">
                {/* Fixed user icon - proper sizing and not squeezed */}
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-lg flex-shrink-0">
                {conversation.avatar}
                </div>
                {conversation.unread && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold truncate">{conversation.name}</h3>
                  <span className="text-xs text-gray-500 ml-2">{conversation.time}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {conversation.position} at {conversation.company}
                </p>
                <p className={`text-sm truncate mt-1 ${
                  conversation.unread ? "text-gray-900 font-medium" : "text-gray-500"
                }`}>
                  {conversation.lastMessage}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Conversation Modal */}
      {showModal && activeConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] sm:h-[85vh] flex flex-col">
            {/* Chat Header - Mobile optimized */}
            <div className="p-3 sm:p-4 border-b flex justify-between items-center">
              <div className="flex items-center min-w-0 flex-1">
                {/* Fixed user icon in header - proper spacing */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold mr-3 flex-shrink-0">
            {activeConversation.avatar}
          </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center">
                    <h3 className="font-semibold truncate text-sm sm:text-base">{activeConversation.name}</h3>
                    <a 
                      href={`/profile/${activeConversation.id}`} 
                      className="ml-2 text-blue-500 hover:text-blue-700 flex-shrink-0"
                      title="View profile"
                    >
                      <HiOutlineUserCircle className="w-5 h-5" />
                    </a>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {activeConversation.position} at {activeConversation.company}
                  </p>
                </div>
              </div>
              
              {/* Action buttons - streamlined for mobile */}
              <div className="flex items-center space-x-1 ml-2">
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={handleAudioCall}
                  title="Audio call"
                >
                  <HiOutlinePhone className="w-5 h-5 text-gray-600" />
                </button>
                
                {/* 3 dots menu */}
                <div className="relative">
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    title="More options"
                  >
                    <HiDotsVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {showMoreMenu && (
                    <>
                      {/* Backdrop to close menu */}
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowMoreMenu(false)}
                      />
                      
                      {/* Menu content */}
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border z-20 py-1">
                        <button
                          onClick={handleReport}
                          className="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <HiFlag className="w-5 h-5 mr-3" />
                          <span className="font-medium">Report</span>
                </button>
                        
                <button 
                          onClick={handleBlock}
                          className="flex items-center w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition-colors"
                >
                          <HiEyeOff className="w-5 h-5 mr-3" />
                          <span className="font-medium">Block</span>
                </button>
                      </div>
                    </>
                  )}
                </div>
                
                <button 
                  className="p-2 rounded-full hover:bg-gray-100"
                  onClick={closeConversation}
                  title="Close conversation"
                >
                  <HiX className="w-5 h-5 text-gray-600" />
                </button>
          </div>
        </div>
        
        {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 flex flex-col">
              <div className="space-y-4 flex-1">
                {messages[activeConversation.id]?.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-lg p-3 relative group ${
                    msg.isMe
                      ? "bg-blue-100 rounded-br-none"
                      : "bg-white border rounded-bl-none"
                  }`}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setSelectedMessage(msg)
                      }}
                    >
                      {!msg.isMe && (
                        <div className="text-xs font-medium text-gray-700 mb-1">
                          {msg.sender}
                        </div>
                      )}
                      
                      {replyingTo?.id === msg.id && (
                        <div className="bg-blue-50 border-l-2 border-blue-400 pl-2 py-1 mb-2 text-sm text-gray-600 italic">
                          Replying to: {replyingTo.content}
                        </div>
                      )}
                      
                      <p className="text-gray-800 text-sm sm:text-base">{msg.content}</p>
                      <p className={`text-xs text-gray-500 mt-1 ${
                        msg.isMe ? "text-right" : ""
                      }`}>
                    {msg.time}
                  </p>
                      
                      {/* Message actions - hidden on mobile for better UX */}
                      <div className={`absolute -top-2 ${msg.isMe ? '-right-8' : '-left-8'} opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex space-x-1`}>
                        <button 
                          className="p-1 rounded-full bg-white border shadow-sm hover:bg-gray-100"
                          onClick={() => handleMessageAction(msg, 'reply')}
                          title="Reply"
                        >
                          <HiOutlineReply className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          className="p-1 rounded-full bg-white border shadow-sm hover:bg-gray-100"
                          onClick={() => handleMessageAction(msg, 'copy')}
                          title="Copy"
                        >
                          <HiOutlineDuplicate className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                </div>
              </div>
            ))}
                <div ref={messagesEndRef} />
          </div>
        </div>
            
            {/* Reply Preview */}
            {replyingTo && (
              <div className="border-t bg-blue-50 p-3 flex justify-between items-center">
                <div className="text-sm text-gray-700 min-w-0 flex-1">
                  <span className="font-medium">Replying to:</span> 
                  <span className="truncate ml-1">{replyingTo.content}</span>
                </div>
                <button 
                  className="text-gray-500 hover:text-gray-700 ml-2 flex-shrink-0"
                  onClick={() => setReplyingTo(null)}
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
            )}
        
        {/* Message Input */}
            <div className="p-3 sm:p-4 border-t">
          <div className="flex items-center">
                <button className="text-gray-500 hover:text-gray-700 p-2 mr-1 hidden sm:block">
              <HiPaperClip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm sm:text-base"
            />
                <button className="text-gray-500 hover:text-gray-700 p-2 ml-1 hidden sm:block">
              <HiEmojiHappy className="w-5 h-5" />
            </button>
                <button className="text-gray-500 hover:text-gray-700 p-2 ml-1 hidden sm:block">
              <HiMicrophone className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
                  className={`ml-2 p-2 rounded-full transition-colors ${
                message.trim()
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              <HiPaperAirplane className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
        </div>
      )}
      
      {/* Message Actions Modal for Mobile */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xs">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Message Actions</h3>
            </div>
            <div className="p-2">
              <button 
                className="w-full flex items-center p-3 hover:bg-gray-100 rounded"
                onClick={() => {
                  handleMessageAction(selectedMessage, 'reply')
                  setSelectedMessage(null)
                }}
              >
                <HiOutlineReply className="w-5 h-5 mr-2 text-gray-600" />
                <span>Reply</span>
              </button>
              <button 
                className="w-full flex items-center p-3 hover:bg-gray-100 rounded"
                onClick={() => {
                  handleMessageAction(selectedMessage, 'copy')
                  setSelectedMessage(null)
                }}
              >
                <HiOutlineDuplicate className="w-5 h-5 mr-2 text-gray-600" />
                <span>Copy Text</span>
              </button>
            </div>
            <div className="p-3 border-t">
              <button 
                className="w-full py-2 text-center text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedMessage(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
