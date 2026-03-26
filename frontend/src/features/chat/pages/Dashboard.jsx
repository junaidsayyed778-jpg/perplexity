// ✅ src/pages/Dashboard.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { useChat } from "../hooks/useChat";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentChatId } from "../chatSlice";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  Menu, Plus, MessageSquare, Settings, LogOut, Send,
  Sparkles, User, Bot, Copy, Check, ChevronLeft, RefreshCw,
  Paperclip, X
} from "lucide-react";

// ✅ MessageContent Component - Fixed for react-markdown v9+ (no className prop)
const MessageContent = ({ content }) => {
  // ✅ Use react-markdown with wrapper div for styling
  return (
    <div className="prose prose-invert prose-sm max-w-none
      prose-headings:text-white prose-headings:font-semibold
      prose-p:text-gray-300 prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline
      prose-code:bg-[#2a2b2c] prose-code:text-pink-400 prose-code:px-1 prose-code:rounded
      prose-pre:bg-[#1e1f20] prose-pre:border prose-pre:border-white/10 prose-pre:my-3
      prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-300 prose-li:my-0.5
      prose-blockquote:border-l-2 prose-blockquote:border-teal-500/50 prose-blockquote:pl-4 prose-blockquote:italic">
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        // ✅ Custom components for fine-grained styling (no className on ReactMarkdown itself)
        components={{
          // ✅ Inline code styling
          code({ inline, children }) {
            if (inline) {
              return (
                <code className="bg-[#2a2b2c] text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return <code>{children}</code>;
          },
          // ✅ Code block styling
          pre({ children }) {
            return (
              <pre className="bg-[#1e1f20] border border-white/10 rounded-lg p-4 overflow-x-auto">
                {children}
              </pre>
            );
          },
          // ✅ Link styling
          a({ children, href }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-teal-400 hover:underline"
              >
                {children}
              </a>
            );
          },
          // ✅ Header styling
          h1: ({ children }) => <h1 className="text-2xl font-bold text-white mt-6 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold text-white mt-5 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-white mt-4 mb-2">{children}</h3>,
          // ✅ List styling
          ul: ({ children }) => <ul className="list-disc pl-5 my-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 my-2">{children}</ol>,
          li: ({ children }) => <li className="text-gray-300 my-0.5">{children}</li>,
          // ✅ Blockquote styling
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-teal-500/50 pl-4 italic text-gray-400 my-3">
              {children}
            </blockquote>
          ),
          // ✅ Paragraph spacing
          p: ({ children }) => <p className="my-2 text-gray-300 leading-relaxed">{children}</p>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const Dashboard = () => {
  const chat = useChat();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // ✅ UI State - Sidebar CLOSED by default
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // ✅ Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  // ✅ Initialize
  useEffect(() => {
    chat.initializeSocketConnection?.();
    chat.handleGetChats?.();
    
    const handleResize = () => {
      if (window.innerWidth >= 1024 && !sidebarOpen) {
        // Optional: auto-open sidebar on desktop if desired
        // setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    
    return () => {
      chat.disconnectSocket?.();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ✅ Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, chat.isLoading]);

  // ✅ Copy with toast feedback
  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setToastMessage("✓ Copied to clipboard");
      setShowToast(true);
      
      setTimeout(() => {
        setCopiedId(null);
        setShowToast(false);
      }, 2000);
    } catch {
      setToastMessage("✗ Failed to copy");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  const handleSubmitMessage = (event) => {
    event?.preventDefault();
    if (!inputValue.trim() || chat.isLoading) return;

    chat.handleSendMessage?.({ message: inputValue });
    setInputValue("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleNewChat = () => {
    dispatch(setCurrentChatId(null));
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleSelectChat = (chatId) => {
    if (!chatId) return;
    chat.handleOpenChat?.(chatId);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitMessage(e);
    }
  };

  // ✅ Memoized Message Item for performance
  const MessageItem = useMemo(() => {
    return ({ msg, index }) => {
      const isUser = msg.role === "user";
      const isAssistant = msg.role === "assistant";
      
      return (
        <div
          key={msg?.id || msg?._id || index}
          className={`group p-4 sm:p-6 border-b border-white/5 transition-colors ${
            isUser 
              ? "bg-gradient-to-r from-teal-500/5 to-transparent" 
              : isAssistant 
                ? "bg-[#202222]/30" 
                : "bg-[#191A1A]"
          }`}
        >
          <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4">
            {/* Avatar */}
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isUser 
                ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20" 
                : "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20"
            }`}>
              {isUser ? <User size={18} /> : <Bot size={18} />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header with Copy Button */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-xs sm:text-sm font-medium ${
                  isUser ? "text-teal-400" : "text-violet-400"
                }`}>
                  {isUser ? "You" : "Perplexity AI"}
                </span>
                
                {isAssistant && (
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-white/5 
                             opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Copy message"
                    aria-label="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                )}
              </div>

              {/* Message Content with Markdown */}
              <div className="text-sm sm:text-base text-gray-300 leading-relaxed">
                <MessageContent content={msg.content} />
              </div>

              {/* Timestamp */}
              {msg.timestamp && (
                <span className="text-xs text-gray-600 mt-2 block">
                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    };
  }, [copiedId]);

  return (
    <div className="flex h-screen bg-[#0d0e0f] text-gray-200 font-sans overflow-hidden">
      
      {/* ✅ Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-[#202222] border border-white/10 rounded-lg px-4 py-3 shadow-xl 
                        flex items-center gap-2 text-sm">
            {toastMessage.includes("✓") ? (
              <Check size={16} className="text-emerald-400" />
            ) : (
              <X size={16} className="text-red-400" />
            )}
            <span className="text-gray-200">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ✅ Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ✅ SIDEBAR */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30
          w-72 bg-[#151618] border-r border-white/5
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
          flex flex-col
        `}
      >
        {/* User Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 
                          flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || "Guest"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email?.split('@')[0] || "user"}
              </p>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 
                     bg-gradient-to-r from-teal-500 to-emerald-600 
                     hover:from-teal-400 hover:to-emerald-500 
                     text-[#0d0e0f] font-semibold rounded-xl 
                     transition-all duration-200 shadow-lg shadow-teal-500/20
                     hover:shadow-teal-500/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={2.5} />
            New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Recent Chats
            </h3>
            <button
              onClick={() => chat.handleGetChats?.()}
              className="p-1 text-gray-600 hover:text-gray-400 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={14} className={chat.isLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {chat.chatHistory?.length > 0 ? (
            chat.chatHistory.map((chatItem) => (
              <button
                key={chatItem.id}
                onClick={() => handleSelectChat(chatItem.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                  text-left group
                  ${
                    chat.activeChatId === chatItem.id
                      ? "bg-white/10 text-white border border-white/10"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }
                `}
              >
                <div className={`p-2 rounded-lg ${
                  chat.activeChatId === chatItem.id 
                    ? "bg-teal-500/20 text-teal-400" 
                    : "bg-white/5 text-gray-500 group-hover:text-gray-300"
                }`}>
                  <MessageSquare size={16} />
                </div>
                <span className="text-sm truncate flex-1">
                  {chatItem.title || "Untitled Chat"}
                </span>
                {chat.activeChatId === chatItem.id && (
                  <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-6 text-center">
              <Sparkles size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                No chats yet.<br />
                <span className="text-teal-400">Start a conversation!</span>
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-3 text-gray-400 
                           hover:bg-white/5 hover:text-gray-200 rounded-xl transition-colors">
            <Settings size={18} />
            <span className="text-sm">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-3 text-gray-400 
                           hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors">
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* ✅ MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col h-full w-full min-w-0 bg-[#0d0e0f]">
        
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0 bg-[#0d0e0f]/80 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl 
                     transition-all duration-200 lg:hidden"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>

          <div className="hidden lg:flex items-center gap-2">
            <Sparkles size={18} className="text-teal-400" />
            <h1 className="text-sm font-medium text-white">Perplexity AI</h1>
          </div>

          <h1 className="text-sm font-medium text-white lg:hidden">Perplexity</h1>
          
          <div className="w-10" />
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {chat.messages?.length === 0 ? (
            // ✅ Empty State
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-violet-500/20 
                              rounded-full blur-2xl animate-pulse" />
                <Sparkles size={56} className="relative text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Ask anything.
              </h2>
              <p className="text-gray-500 text-sm max-w-md mb-8">
                Get instant, accurate answers with sources. 
                Powered by advanced AI.
              </p>
              
              {/* Quick Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {[
                  "Explain quantum computing simply",
                  "What's the latest in AI research?",
                  "Help me write a professional email",
                  "Compare Python vs JavaScript"
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputValue(suggestion);
                      textareaRef.current?.focus();
                    }}
                    className="p-4 text-left text-sm text-gray-400 hover:text-white 
                             bg-[#1a1b1e] hover:bg-[#202222] rounded-xl border border-white/5 
                             hover:border-teal-500/30 transition-all duration-200"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // ✅ Messages List
            <>
              {chat.messages.map((msg, index) => (
                <MessageItem key={msg?.id || msg?._id || index} msg={msg} index={index} />
              ))}
              
              {/* Loading Indicator */}
              {chat.isLoading && (
                <div className="p-4 sm:p-6 border-b border-white/5 bg-[#202222]/20">
                  <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br 
                                  from-violet-500 to-purple-600 flex items-center justify-center 
                                  text-white shadow-lg shadow-violet-500/20">
                      <Bot size={18} className="animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs sm:text-sm font-medium text-violet-400 mb-2 block">
                        Perplexity AI
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
                              style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
                              style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" 
                              style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

{/* ✅ Input Area - Fixed Text Overlap */}
<div className="px-3 sm:px-4 pb-3 sm:pb-4 shrink-0 bg-[#0d0e0f]">
  <form onSubmit={handleSubmitMessage} className="max-w-4xl mx-auto">
    
    {/* Input Container */}
    <div className="relative bg-[#1a1b1e] rounded-2xl border border-white/10 
                  focus-within:border-teal-500/50 focus-within:ring-2 
                  focus-within:ring-teal-500/20 transition-all duration-200
                  shadow-lg shadow-black/20">
      
      {/* ✅ Textarea - Fixed padding to prevent overlap */}
      <textarea
        ref={textareaRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything... (Shift+Enter for new line)"
        rows={1}
        className="w-full bg-transparent text-white 
                 pl-12 pr-14 py-4 
                 rounded-2xl resize-none focus:outline-none 
                 placeholder-gray-500 max-h-48 min-h-[56px] 
                 leading-relaxed text-sm sm:text-base"
        disabled={chat.isLoading}
      />
      
      {/* ✅ Attachment Button - Left aligned */}
      <button
        type="button"
        className="absolute left-3 bottom-3 p-2 text-gray-500 hover:text-gray-200 
                 hover:bg-white/5 rounded-xl transition-all duration-200 
                 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Attach file"
        disabled={chat.isLoading}
        aria-label="Attach file"
      >
        <Paperclip size={18} strokeWidth={2} />
      </button>
      
      {/* ✅ Send Button - Right aligned */}
      <button
        type="submit"
        disabled={!inputValue.trim() || chat.isLoading}
        className="absolute right-3 bottom-3 p-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 
                 hover:from-teal-400 hover:to-emerald-500 
                 disabled:from-gray-600 disabled:to-gray-700 
                 text-white rounded-xl transition-all duration-200 
                 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 
                 disabled:shadow-none disabled:cursor-not-allowed 
                 hover:scale-105 active:scale-95"
        aria-label="Send message"
      >
        <Send size={18} strokeWidth={2.5} />
      </button>
    </div>
    
    {/* Helper Text */}
    <p className="text-xs text-gray-600 mt-3 text-center px-2">
      Perplexity AI can make mistakes. Consider checking important information.
    </p>
    
  </form>
</div>
      </main>

      {/* ✅ Global Styles */}
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #374151; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}</style>
    </div>
  );
};

export default Dashboard;