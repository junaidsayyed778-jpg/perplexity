// ✅ src/pages/Dashboard.jsx
import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useChat } from "../hooks/useChat";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentChatId } from "../chatSlice.js"
import { clearAuth } from "../../auth/authSlice.js" // ✅ Auth slice se import
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Menu, Plus, MessageSquare, Settings, LogOut, Send,
  Sparkles, User, Bot, Copy, Check, ChevronLeft, RefreshCw,
  Paperclip, X
} from "lucide-react";
import { logout } from "../../auth/service/authApi.js" // ✅ Correct path

// ✅ Premium MessageContent - No unused vars
const MessageContent = ({ content }) => {
  return (
    <div className="prose prose-invert prose-sm max-w-none
      prose-headings:text-white prose-headings:font-semibold
      prose-p:text-gray-300 prose-a:text-teal-400 prose-a:no-underline hover:prose-a:underline
      prose-code:bg-[#2a2b2c] prose-code:text-pink-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
      prose-pre:!bg-[#1e1f20] prose-pre:!border prose-pre:!border-white/10 prose-pre:!my-4 prose-pre:!rounded-xl
      prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-300 prose-li:my-1
      prose-blockquote:border-l-3 prose-blockquote:border-teal-500/60 prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-gray-400">
      
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : "text";
            
            if (!inline && match) {
              return (
                <div className="relative group my-4">
                  <SyntaxHighlighter
                    language={lang}
                    style={oneDark}
                    PreTag="div"
                    className="!rounded-xl !text-sm !leading-relaxed"
                    showLineNumbers
                    wrapLines
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                  <button
                    onClick={() => navigator.clipboard.writeText(String(children))}
                    className="absolute top-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 
                             rounded-lg text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 
                             transition-all duration-200 backdrop-blur-sm"
                    title="Copy code"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              );
            }
            return (
              <code className="bg-[#2a2b2c] text-pink-400 px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer"
               className="text-teal-400 hover:text-teal-300 underline underline-offset-2 decoration-teal-500/30 transition-colors">
              {children}
            </a>
          ),
          h1: ({ children }) => <h1 className="text-2xl font-bold text-white mt-6 mb-4 pb-2 border-b border-white/10">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold text-white mt-5 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold text-white mt-4 mb-2">{children}</h3>,
          ul: ({ children }) => <ul className="list-disc pl-6 my-3 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 my-3 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="text-gray-300">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-teal-500/60 pl-5 italic text-gray-400 my-4 bg-teal-500/5 py-3 px-4 rounded-r-lg">
              {children}
            </blockquote>
          ),
          p: ({ children }) => <p className="my-3 text-gray-300 leading-relaxed">{children}</p>,
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

  // ✅ UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
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
    return () => chat.disconnectSocket?.();
  }, []);

  // ✅ Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages, chat.isLoading]);

  // ✅ Toast helper
  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 2500);
  }, []);

  // ✅ Copy with feedback
  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast("Copied to clipboard!", "success");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast("Failed to copy", "error");
    }
  };

  // ✅✅✅ FIXED LOGOUT FUNCTION - Complete Flow ✅✅✅
  const handleLogout = async () => {
    // Prevent multiple clicks
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      // 1. Call logout API (backend will clear httpOnly cookie)
      await logout();
      console.log("✅ Logout API success");
    } catch (err) {
      // ⚠️ Even if API fails, we still logout client-side
      console.warn("⚠️ Logout API failed, proceeding with client-side logout:", err?.message);
    } finally {
      // 2. ✅ ALWAYS execute these - in finally block so they run even if API fails
      console.log("🧹 Clearing client-side auth state...");
      
      // Clear Redux auth state
      dispatch(clearAuth());
      
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("chatHistory");
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies (client-side accessible ones)
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        // Clear cookie by setting expired date
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname}; SameSite=Strict`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      });
      
      // 3. Show toast
      showToast("Logged out successfully", "success");
      
      // 4. ✅ FORCE REDIRECT to login - with small delay for UX
      setTimeout(() => {
        console.log("🔄 Redirecting to /login...");
        window.location.replace("/login"); // replace() prevents back button to dashboard
      }, 800);
      
      // 5. Reset loading state (after redirect initiated)
      setIsLoggingOut(false);
    }
  };

  const handleSubmitMessage = (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || chat.isLoading) return;
    chat.handleSendMessage?.({ message: inputValue });
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleNewChat = () => {
    dispatch(setCurrentChatId(null));
    if (window.innerWidth < 1024) setSidebarOpen(false);
    showToast("New chat started ✨", "success");
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

  // ✅ Premium Bubble Message Item
  const MessageItem = useMemo(() => {
    return ({ msg, index }) => {
      const isUser = msg.role === "user";
      // ✅ Removed unused isAssistant variable
      
      return (
        <div
          key={msg?.id || msg?._id || index}
          className={`group py-4 sm:py-5 px-3 sm:px-6 transition-all duration-200 ${
            isUser ? "bg-gradient-to-l from-teal-500/3 to-transparent" : "bg-[#151618]/40"
          }`}
        >
          <div className={`max-w-4xl mx-auto flex gap-4 ${isUser ? "flex-row-reverse" : ""}`}>
            
            {/* Avatar */}
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${
              isUser 
                ? "bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-teal-500/25" 
                : "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/25"
            }`}>
              {isUser ? <User size={18} strokeWidth={2.5} /> : <Bot size={18} strokeWidth={2.5} />}
            </div>

            {/* Message Bubble */}
            <div className={`flex-1 min-w-0 max-w-[85%] sm:max-w-[75%] ${isUser ? "text-right" : ""}`}>
              
              {/* Bubble Container */}
              <div className={`inline-block rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-xl transition-all duration-200 ${
                isUser 
                  ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-tr-sm" 
                  : "bg-[#1e1f20] border border-white/10 text-gray-200 rounded-tl-sm hover:border-white/20"
              }`}>
                
                {/* Message Header (AI only) */}
                {!isUser && msg.role === "assistant" && (
                  <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-white/5">
                    <span className="text-xs font-semibold text-violet-400 flex items-center gap-1.5">
                      <Sparkles size={12} className="animate-pulse" />
                      Perplexity AI
                    </span>
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 
                               opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                )}

                {/* Content */}
                <div className={`text-sm sm:text-base leading-relaxed ${isUser ? "text-white" : ""}`}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MessageContent content={msg.content} />
                  )}
                </div>

                {/* User message copy button */}
                {isUser && (
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="mt-2 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 
                             opacity-0 group-hover:opacity-100 transition-all duration-200 ml-auto"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? <Check size={14} className="text-emerald-300" /> : <Copy size={14} />}
                  </button>
                )}
              </div>

              {/* Timestamp */}
              {msg.timestamp && (
                <span className={`text-xs text-gray-600 mt-2 block ${isUser ? "text-right" : ""}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    };
  }, [copiedId, showToast]);

  return (
    <div className="flex h-screen bg-[#0a0b0d] text-gray-200 font-sans overflow-hidden selection:bg-teal-500/30">
      
      {/* ✅ Premium Toast */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md ${
            toast.type === "error" 
              ? "bg-red-500/10 border-red-500/30 text-red-200" 
              : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
          }`}>
            {toast.type === "error" ? <X size={18} /> : <Check size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* ✅ Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ✅ SIDEBAR - Premium Glass Design */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30
          w-72 bg-[#111215]/95 border-r border-white/5 backdrop-blur-xl
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
          flex flex-col
        `}
      >
        {/* ✅ New Chat Button - Simple & Attractive */}
        <div className="p-4 border-b border-white/5">
          <button
            onClick={handleNewChat}
            className="w-full group flex items-center justify-center gap-2.5 px-4 py-3 
                     bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/40
                     text-white font-medium rounded-xl transition-all duration-200
                     hover:shadow-lg hover:shadow-teal-500/10 active:scale-[0.98]"
          >
            <Plus size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
            New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="flex items-center justify-between px-3 py-2 mb-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">History</h3>
            <button
              onClick={() => chat.handleGetChats?.()}
              className="p-1.5 text-gray-600 hover:text-teal-400 hover:bg-white/5 rounded-lg transition-colors"
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
                  w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-200
                  text-left group border border-transparent
                  ${
                    chat.activeChatId === chatItem.id
                      ? "bg-gradient-to-r from-teal-500/15 to-emerald-500/15 border-teal-500/30 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-gray-200 hover:border-white/10"
                  }
                `}
              >
                <div className={`p-2 rounded-lg transition-colors ${
                  chat.activeChatId === chatItem.id 
                    ? "bg-teal-500/20 text-teal-400" 
                    : "bg-white/5 text-gray-500 group-hover:text-gray-300"
                }`}>
                  <MessageSquare size={16} />
                </div>
                <span className="text-sm truncate flex-1 font-medium">
                  {chatItem.title || "Untitled Chat"}
                </span>
                {chat.activeChatId === chatItem.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse shadow-lg shadow-teal-500/50" />
                )}
              </button>
            ))
          ) : (
            <div className="px-3 py-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500/20 to-violet-500/20 
                           flex items-center justify-center">
                <Sparkles size={24} className="text-teal-400" />
              </div>
              <p className="text-sm text-gray-500">
                No chats yet.<br />
                <span className="text-teal-400 font-medium">Start exploring!</span>
              </p>
            </div>
          )}
        </div>

        {/* ✅ User Profile - MOVED TO BOTTOM */}
        <div className="p-4 border-t border-white/5 space-y-2">
          {/* Settings */}
          <button className="w-full flex items-center gap-3 px-3.5 py-3 text-gray-400 
                           hover:bg-white/5 hover:text-white rounded-xl transition-all duration-200 group">
            <Settings size={18} className="group-hover:rotate-45 transition-transform duration-300" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          
          {/* ✅ Logout Button - FIXED */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3.5 py-3 text-gray-400 
                     hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 group
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : (
              <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            )}
            <span className="text-sm font-medium">{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>

          {/* User Info Card */}
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] 
                        border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 
                          flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-teal-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name || "Guest"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email?.split('@')[0] || "user"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ✅ MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col h-full w-full min-w-0 bg-gradient-to-b from-[#0a0b0d] to-[#0d0e10]">
        
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0 
                         bg-[#0a0b0d]/80 backdrop-blur-md sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(prev => !prev)}
            className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl 
                     transition-all duration-200 lg:hidden"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 
                          flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Sparkles size={16} className="text-white" />
            </div>
            <h1 className="text-base font-semibold text-white">Perplexity AI</h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-teal-500/15 text-teal-400 rounded-full border border-teal-500/20">
              Pro
            </span>
          </div>
          
          <div className="w-10" />
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          {chat.messages?.length === 0 ? (
            // ✅ Premium Empty State
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/30 via-violet-500/30 to-emerald-500/30 
                              rounded-full blur-3xl animate-pulse opacity-50" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 
                              flex items-center justify-center shadow-2xl shadow-teal-500/30">
                  <Sparkles size={32} className="text-white animate-pulse" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Ask anything.
              </h2>
              <p className="text-gray-500 text-base max-w-md mb-10 leading-relaxed">
                Get instant, sourced answers powered by advanced AI. 
                Research, learn, and create with confidence.
              </p>
              
              {/* Quick Suggestions - Premium Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full px-4">
                {[
                  { icon: "🔬", text: "Explain quantum computing simply" },
                  { icon: "🤖", text: "What's the latest in AI research?" },
                  { icon: "✉️", text: "Help me write a professional email" },
                  { icon: "💻", text: "Compare Python vs JavaScript" }
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputValue(suggestion.text);
                      textareaRef.current?.focus();
                    }}
                    className="group p-4 text-left bg-[#15161a]/80 hover:bg-[#1a1b20] 
                             rounded-2xl border border-white/5 hover:border-teal-500/30 
                             transition-all duration-200 hover:shadow-lg hover:shadow-teal-500/10
                             hover:-translate-y-0.5"
                  >
                    <span className="text-xl mb-2 block">{suggestion.icon}</span>
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      {suggestion.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // ✅ Messages List with Bubble Layout
            <>
              {chat.messages.map((msg, index) => (
                <MessageItem key={msg?.id || msg?._id || index} msg={msg} index={index} />
              ))}
              
              {/* Premium Loading Indicator */}
              {chat.isLoading && (
                <div className="py-5 px-3 sm:px-6 bg-[#151618]/30">
                  <div className="max-w-4xl mx-auto flex gap-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br 
                                  from-violet-500 to-purple-600 flex items-center justify-center 
                                  text-white shadow-lg shadow-violet-500/25">
                      <Bot size={18} strokeWidth={2.5} className="animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="inline-block rounded-2xl rounded-tl-sm px-5 py-4 
                                    bg-[#1e1f20] border border-white/10 shadow-xl">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 mt-2 block">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* ✅ Premium Input Area */}
        <div className="px-4 pb-4 pt-2 shrink-0 bg-gradient-to-t from-[#0a0b0d] via-[#0a0b0d]/95 to-transparent">
          <form onSubmit={handleSubmitMessage} className="max-w-4xl mx-auto">
            <div className="relative bg-[#15161a] rounded-2xl border border-white/10 
                          focus-within:border-teal-500/50 focus-within:ring-2 
                          focus-within:ring-teal-500/20 transition-all duration-200
                          shadow-2xl shadow-black/30 overflow-hidden">
              
              {/* Gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 via-violet-500 to-emerald-500 opacity-0 
                           focus-within:opacity-100 transition-opacity duration-300" />
              
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
                disabled={chat.isLoading || isLoggingOut}
              />
              
              {/* Attachment Button */}
              <button
                type="button"
                className="absolute left-3 bottom-3 p-2 text-gray-500 hover:text-teal-400 
                         hover:bg-teal-500/10 rounded-xl transition-all duration-200 
                         disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={chat.isLoading || isLoggingOut}
                title="Attach file (coming soon)"
              >
                <Paperclip size={18} strokeWidth={2} />
              </button>
              
              {/* Send Button - Premium */}
              <button
                type="submit"
                disabled={!inputValue.trim() || chat.isLoading || isLoggingOut}
                className="absolute right-3 bottom-3 p-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 
                         hover:from-teal-400 hover:to-emerald-500 
                         disabled:from-gray-600 disabled:to-gray-700 
                         text-white rounded-xl transition-all duration-200 
                         shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 
                         disabled:shadow-none disabled:cursor-not-allowed 
                         hover:scale-105 active:scale-95 disabled:hover:scale-100"
                aria-label="Send message"
              >
                <Send size={18} strokeWidth={2.5} />
              </button>
            </div>
            
            <p className="text-xs text-gray-600 mt-3 text-center px-2">
              Perplexity AI can make mistakes. Verify important information.
            </p>
          </form>
        </div>
      </main>

      {/* ✅ Global Premium Styles */}
      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100px) scale(0.95); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .animate-slide-in { animation: slide-in 0.25s ease-out; }
        
        /* Premium Scrollbar */
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { 
          background: linear-gradient(to bottom, #374151, #4b5563); 
          border-radius: 3px; 
        }
        ::-webkit-scrollbar-thumb:hover { 
          background: linear-gradient(to bottom, #4b5563, #6b7280); 
        }
        
        /* Smooth focus transitions */
        input:focus, textarea:focus, button:focus {
          outline: none;
        }
        
        /* Selection */
        ::selection {
          background: rgba(20, 184, 166, 0.3);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;