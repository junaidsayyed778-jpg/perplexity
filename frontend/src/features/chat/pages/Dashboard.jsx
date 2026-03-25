import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../hooks/useChat";
import { useSelector, useDispatch } from "react-redux"; // ✅ Added useDispatch
import { setCurrentChatId } from "../chatSlice"; // ✅ Import the action
import {
  Menu,
  Plus,
  MessageSquare,
  Settings,
  LogOut,
  Send,
  Sparkles,
  User,
  Bot,
  Copy,
  Check,
  ChevronLeft,
  RefreshCw,
} from "lucide-react";

const Dashboard = () => {
  // --- Your Existing Architecture ---
  const chat = useChat();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch(); // ✅ Initialize dispatch

  // --- Local UI State ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Initialize Socket Connection ---
  useEffect(() => {
    chat.initializeSocketConection();
    chat.handleGetChats();
    return () => {
      if (chat.disconnectSocket) {
        chat.disconnectSocket();
      }
    };
  }, []);

  // --- Auto-scroll to Bottom ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages]);

  const handleSubmitMessage = (event) => {
    event.preventDefault();
    if (!inputValue.trim()) return;

    chat.handleSendMessage({ message: inputValue });
    setInputValue("");
  };

  const handleNewChat = () => {
    dispatch(setCurrentChatId(null));
  };

  const handleSelectChat = (chatId) => {
    chat.handleOpenChat(chatId); // ✅ Load messages for selected chat
    if (window.innerWidth < 1024) {
      setSidebarOpen(false); // Close sidebar on mobile after selection
    }
  };

  // --- Render ---
  return (
    <div className="flex h-screen bg-[#191A1A] text-gray-200 font-sans overflow-hidden">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30
          w-72 bg-[#202222] border-r border-white/5
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          flex flex-col
        `}
      >
        {/* User Info + Actions */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-semibold shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>

          {/* New Chat + Refresh */}
          <div className="flex gap-2">
            <button
              onClick={handleNewChat}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-400 text-[#191A1A] font-semibold rounded-lg transition-all duration-200"
            >
              <Plus size={18} />
              New Chat
            </button>
            <button
              onClick={() => chat.handleGetChats()}
              className="p-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors"
              title="Refresh chats"
            >
              <RefreshCw size={18} className={chat.isLoading ? "animate-spin" : ""} />
            </button>
          </div>
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
                  ${
                    chat.activeChatId === chatItem.id
                      ? "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }
                `}
              >
                <MessageSquare size={18} className="shrink-0" />
                <span className="text-sm truncate text-left">
                  {chatItem.title || "Untitled Chat"}
                </span>
              </button>
            ))
          ) : (
            <p className="text-xs text-gray-500 px-3 py-2">
              No chat history
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-3 text-gray-400 hover:bg-white/5 hover:text-gray-200 rounded-lg transition-colors">
            <Settings size={18} />
            <span className="text-sm">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-3 text-gray-400 hover:bg-white/5 hover:text-gray-200 rounded-lg transition-colors">
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col h-full w-full min-w-0">
        
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-lg transition-colors"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>

          <h1 className="text-sm text-gray-400">AI Chat Assistant</h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {chat.messages?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <Sparkles size={40} className="text-teal-400 mb-4" />
              <h2 className="text-xl text-white mb-2">
                How can I help you today?
              </h2>
              <p className="text-gray-500 text-sm max-w-md">
                Start a conversation or select a previous chat from the sidebar.
              </p>
            </div>
          ) : (
            chat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 border-b border-white/5 ${
                  msg.role === "user" ? "bg-[#191A1A]" : "bg-[#202222]/50"
                }`}
              >
                <div className="max-w-4xl mx-auto flex gap-4">
                  {/* Avatar */}
                  <div className="w-8 h-8 flex items-center justify-center shrink-0 text-gray-400">
                    {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm text-gray-400">
                        {msg.role === "user" ? "You" : "AI"}
                      </p>
                      {/* ✅ Copy Button - Only for AI messages */}
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                          title="Copy message"
                        >
                          {copiedId === msg.id ? (
                            <Check size={14} className="text-green-400" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      )}
                    </div>

                    <p className="text-gray-300 whitespace-pre-wrap break-words">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Loading State */}
          {chat.isLoading && (
            <div className="p-4 text-gray-400 animate-pulse">AI is typing...</div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 shrink-0">
          <form onSubmit={handleSubmitMessage} className="flex gap-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything..."
              rows={1}
              className="flex-1 bg-[#202222] text-white p-3 rounded-lg resize-none 
                         focus:outline-none focus:ring-2 focus:ring-teal-500/50 
                         placeholder-gray-500 max-h-32"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitMessage(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || chat.isLoading}
              className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 
                         disabled:cursor-not-allowed px-4 rounded-lg 
                         flex items-center justify-center transition-colors"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-xs text-gray-600 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;