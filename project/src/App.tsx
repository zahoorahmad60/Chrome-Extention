import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Minimize2, Maximize2, Youtube, Send, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Position {
  x: number;
  y: number;
}

function App() {
  const [position, setPosition] = useState<Position>({ x: 50, y: 50 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<'input' | 'processing' | 'chat'>('input');
  const [videoId, setVideoId] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const dragRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMinimized) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragStart.current) return;
    
    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 400;
    const maxY = window.innerHeight - 500;
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const extractVideoId = (input: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const handleProcessVideo = async () => {
    const id = extractVideoId(videoId);
    if (!id) {
      alert('Please enter a valid YouTube video ID or URL');
      return;
    }
    
    setPhase('processing');
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setPhase('chat');
    setMessages([{
      id: '1',
      type: 'assistant',
      content: `Great! I've analyzed the YouTube video (ID: ${id}). I'm now ready to answer any questions you have about this video's content, themes, or details. What would you like to know?`,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);
    
    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses = [
      "Based on the video content, here's what I can tell you...",
      "That's an interesting question about the video. From what I analyzed...",
      "The video discusses this topic in detail. Let me explain...",
      "Great question! The video covers this aspect around the middle section...",
    ];
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: responses[Math.floor(Math.random() * responses.length)] + " This is a simulated response for demonstration purposes.",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (phase === 'input') {
        handleProcessVideo();
      } else {
        handleSendMessage();
      }
    }
  };

  if (isMinimized) {
    return (
      <div
        className="fixed z-50 bg-red-600 rounded-full p-3 shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
        style={{ left: position.x, top: position.y }}
        onClick={() => setIsMinimized(false)}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </div>
    );
  }

  return (
    <div
      ref={dragRef}
      className="fixed z-50 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
      style={{ left: position.x, top: position.y }}
    >
      {/* Header */}
      <div
        className="bg-red-600 p-4 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-2">
            <Youtube className="w-5 h-5" />
            <span className="font-semibold">YouTube Video Assistant</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="hover:bg-white/20 p-1 rounded"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button className="hover:bg-white/20 p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-96">
        {phase === 'input' && (
          <div className="p-6 h-full flex flex-col justify-center">
            <div className="text-center mb-6">
              <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Youtube className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                YouTube Video Analyzer
              </h3>
              <p className="text-gray-600 text-sm">
                Enter a YouTube video ID or URL to get started
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  value={videoId}
                  onChange={(e) => setVideoId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter YouTube video ID or URL"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: dQw4w9WgXcQ or https://youtube.com/watch?v=...
                </p>
              </div>
              
              <button
                onClick={handleProcessVideo}
                disabled={!videoId.trim()}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Analyze Video
              </button>
            </div>
          </div>
        )}

        {phase === 'processing' && (
          <div className="p-6 h-full flex flex-col justify-center items-center">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
              <div className="absolute inset-0 w-12 h-12 border-4 border-red-200 border-t-transparent rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Processing Video
            </h3>
            <p className="text-gray-600 text-sm text-center">
              Analyzing video content and preparing to answer your questions...
            </p>
            <div className="flex space-x-1 mt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-red-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
              ))}
            </div>
          </div>
        )}

        {phase === 'chat' && (
          <div className="h-full flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question about the video..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;