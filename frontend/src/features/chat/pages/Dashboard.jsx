import React, { useEffect, useRef, useState } from 'react'
import { useChat } from '../hooks/useChat'
import { useSelector } from 'react-redux'
import {
  Menu, Plus, MessageSquare, Settings, LogOut,
  Send, Paperclip, Sparkles, User, Bot, Copy, Check,
  ChevronLeft
} from 'lucide-react'

const Dashboard = () => {
  // --- Your Existing Architecture ---
  const chat = useChat()
  const { user } = useSelector(state => state.auth)

  // --- Local UI State ---
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const messagesEndRef = useRef(null)

  // --- Initialize Socket Connection ---
  useEffect(() => {
    chat.initializeSocketConection()
    return () => {
      // Cleanup on unmount
      if (chat.disconnectSocket) {
        chat.disconnectSocket()
      }
    }
  }, [])

  // --- Auto-scroll to Bottom ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat.messages])

  // --- Handlers ---
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleNewChat = () => {
    if (chat.createNewChat) {
      chat.createNewChat()
    }
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || chat.isLoading) return

    chat.sendMessage(inputValue.trim())
    setInputValue('')
  }

  const handleCopy = (content, id) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSelectChat = (chatId) => {
    if (chat.selectChat) {
      chat.selectChat(chatId)
    }
    if (window.innerWidth < 1024) setSidebarOpen(false)
  }

  const handleLogout = () => {
    // Your logout logic here
    console.log('Logging out...')
  }

  // --- Render ---
  return (
    <div className="flex h-screen bg-[#191A1A] text-gray-200 font-sans">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-72 bg-[#202222] border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'}
        flex flex-col
      `}>
        {/* User Info */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-400 text-[#191A1A] font-semibold rounded-lg transition-all duration-200"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
            Recent Chats
          </h3>
          {chat.chatHistory?.length > 0 ? (
            chat.chatHistory.map((chatItem) => (
              <button
                key={chatItem.id}
                onClick={() => handleSelectChat(chatItem.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200
                  ${chat.activeChatId === chatItem.id 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
                `}
              >
                <MessageSquare size={18} className="shrink-0" />
                <span className="text-sm truncate text-left">{chatItem.title}</span>
              </button>
            ))
          ) : (
            <p className="text-xs text-gray-500 px-3 py-2">No chat history</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-3 text-gray-400 hover:bg-white/5 hover:text-gray-200 rounded-lg transition-all duration-200">
            <Settings size={18} />
            <span className="text-sm">Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-gray-400 hover:bg-white/5 hover:text-gray-200 rounded-lg transition-all duration-200"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#191A1A] z-10">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg transition-all duration-200"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="text-sm font-medium text-gray-400">AI Chat Assistant</h1>
          <div className="w-10" />
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {chat.messages?.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="w-16 h-16 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles size={32} className="text-teal-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">How can I help you today?</h2>
              <p className="text-gray-400 text-center max-w-md mb-8">
                Ask me anything. I'm here to assist with questions, explanations, and more.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                {[
                  'Explain quantum computing',
                  'Write a Python script',
                  'Help me with math',
                  'Summarize this article'
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(suggestion)}
                    className="p-4 bg-[#202222] border border-white/5 rounded-xl text-left text-sm text-gray-300 hover:bg-white/5 hover:border-teal-500/50 transition-all duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Items */
            chat.messages?.map((msg) => (
              <div 
                key={msg.id} 
                className={`
                  py-6 px-4 md:px-8 border-b border-white/5
                  ${msg.role === 'user' ? 'bg-[#191A1A]' : 'bg-[#202222]/50'}
                `}
              >
                <div className="max-w-4xl mx-auto flex gap-4">
                  {/* Avatar */}
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                    ${msg.role === 'user' ? 'bg-teal-500/20 text-teal-400' : 'bg-purple-500/20 text-purple-400'}
                  `}>
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm text-gray-200">
                        {msg.role === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    {/* Copy Button for AI */}
                    {msg.role === 'assistant' && (
                      <button 
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="mt-3 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {copiedId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Loading Indicator */}
          {chat.isLoading && (
            <div className="py-6 px-4 md:px-8 border-b border-white/5 bg-[#202222]/50">
              <div className="max-w-4xl mx-auto flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Bot size={18} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-white/5 bg-[#191A1A] p-4 md:p-6">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="relative flex items-end gap-2 bg-[#202222] border border-white/10 rounded-xl p-2 focus-within:ring-2 focus-within:ring-teal-500/50 focus-within:border-teal-500 transition-all duration-200">
              <button 
                type="button" 
                className="p-2 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition-all"
              >
                <Paperclip size={20} />
              </button>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
                placeholder="Ask anything..."
                rows={1}
                className="flex-1 bg-transparent text-gray-200 placeholder-gray-500 resize-none focus:outline-none py-2 px-2 max-h-32 min-h-[44px]"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || chat.isLoading}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${inputValue.trim() && !chat.isLoading
                    ? 'bg-teal-500 hover:bg-teal-400 text-[#191A1A]' 
                    : 'bg-white/5 text-gray-600 cursor-not-allowed'}
                `}
              >
                <Send size={20} />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Sparkles size={12} />
              <span>AI can make mistakes. Verify important information.</span>
            </div>
          </form>
        </div>

      </main>
    </div>
  )
}

export default Dashboard