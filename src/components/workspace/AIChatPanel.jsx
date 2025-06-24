import React, { useState, useRef, useEffect } from 'react';
import { HiOutlinePaperAirplane, HiOutlineRefresh } from 'react-icons/hi';

export default function AIChatPanel({ response, loading, onRequest }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI study assistant. How can I help you today?", sender: "ai" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (response) {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: response, sender: "ai" }
      ]);
    }
  }, [response]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      const newMessage = { id: Date.now(), text: input, sender: "user" };
      setMessages(prev => [...prev, newMessage]);
      setInput("");
      onRequest(input);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRegenerate = () => {
    if (messages.length > 1) {
      const lastUserMessage = messages.filter(m => m.sender === "user").pop();
      if (lastUserMessage) {
        setMessages(messages.filter(m => m.sender !== "ai" || m.id !== messages[messages.length - 1].id));
        onRequest(lastUserMessage.text);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">AI Study Assistant</h2>
          <div className="flex items-center space-x-2">
            <button 
              className="flex items-center text-blue-600"
              onClick={handleRegenerate}
              disabled={loading}
            >
              <HiOutlineRefresh className="mr-1" />
              <span>Regenerate</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className="max-w-3xl mx-auto min-w-[300px]">
          <div className="space-y-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.sender === "user" 
                      ? "bg-blue-100 rounded-br-none" 
                      : "bg-white border rounded-bl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-lg rounded-bl-none p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white border-t">
        <div className="max-w-3xl mx-auto">
          <div className="flex">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask me anything about your studies..."
              className="flex-1 px-4 py-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={1}
            />
            <button 
              className="bg-blue-600 text-white px-4 rounded-r-lg flex items-center justify-center disabled:opacity-50"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <HiOutlinePaperAirplane className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-3 text-sm text-gray-500">
            <p>AI can help you: organize materials, generate practice questions, explain concepts, and optimize your study schedule.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 