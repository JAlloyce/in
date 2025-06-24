"use client"

import { useState } from "react"
import { HiSearch, HiPaperClip, HiEmojiHappy, HiMicrophone, HiPaperAirplane } from "react-icons/hi"

export default function Messaging() {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      lastMessage: "Thanks for connecting! Looking forward to collaborating.",
      time: "2h",
      unread: true,
      avatar: "SJ",
    },
    {
      id: 2,
      name: "Michael Chen",
      lastMessage: "The project proposal looks great. Let's discuss tomorrow.",
      time: "4h",
      unread: false,
      avatar: "MC",
    },
    {
      id: 3,
      name: "Alex Rodriguez",
      lastMessage: "Can you review the UI designs?",
      time: "1d",
      unread: false,
      avatar: "AR",
    },
    {
      id: 4,
      name: "Emma Wilson",
      lastMessage: "The meeting is rescheduled to 3 PM.",
      time: "2d",
      unread: true,
      avatar: "EW",
    },
  ])

  const [activeConversation, setActiveConversation] = useState(conversations[0])
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([
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
  ])

  const handleSendMessage = () => {
    if (message.trim() === "") return
    
    const newMessage = {
      id: messages.length + 1,
      sender: "Me",
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    }
    
    setMessages([...messages, newMessage])
    setMessage("")
    
    // Simulate reply after 1-3 seconds
    setTimeout(() => {
      const replies = [
        "That sounds great!",
        "I'll check my calendar and get back to you.",
        "Can you send me more details?",
        "Looking forward to it!"
      ]
      
      const reply = {
        id: messages.length + 2,
        sender: activeConversation.name,
        content: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
      }
      
      setMessages(prev => [...prev, reply])
    }, 1000 + Math.random() * 2000)
  }

  const markAsRead = (id) => {
    setConversations(convs => 
      convs.map(conv => 
        conv.id === id ? { ...conv, unread: false } : conv
      )
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Conversations List */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Messages</h2>
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
                activeConversation.id === conversation.id ? "bg-blue-50" : ""
              }`}
              onClick={() => {
                setActiveConversation(conversation)
                markAsRead(conversation.id)
              }}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold mr-3">
                {conversation.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <h3 className="font-semibold truncate">{conversation.name}</h3>
                  <span className="text-xs text-gray-500">{conversation.time}</span>
                </div>
                <p className={`text-sm truncate ${
                  conversation.unread ? "text-gray-900 font-medium" : "text-gray-500"
                }`}>
                  {conversation.lastMessage}
                </p>
              </div>
              {conversation.unread && (
                <div className="ml-2 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="lg:col-span-3 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold mr-3">
            {activeConversation.avatar}
          </div>
          <div>
            <h3 className="font-semibold">{activeConversation.name}</h3>
            <p className="text-sm text-gray-500">Active now</p>
          </div>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    msg.isMe
                      ? "bg-blue-100 rounded-br-none"
                      : "bg-white border rounded-bl-none"
                  }`}
                >
                  <p className="text-gray-800">{msg.content}</p>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex items-center">
            <button className="text-gray-500 hover:text-gray-700 p-2 mr-1">
              <HiPaperClip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button className="text-gray-500 hover:text-gray-700 p-2 ml-1">
              <HiEmojiHappy className="w-5 h-5" />
            </button>
            <button className="text-gray-500 hover:text-gray-700 p-2 ml-1">
              <HiMicrophone className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className={`ml-2 p-2 rounded-full ${
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
  )
}
