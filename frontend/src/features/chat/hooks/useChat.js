import {
  addNewMessage,
  createNewChat,
  setChats,
  setCurrentChatId,
  setLoading,
} from "../chatSlice";

import { sendMessage, getChat, getMessages } from "../service/chatApi";
import { initializeSocketConnection } from "../service/chatSocket";
import { useDispatch, useSelector } from "react-redux";

export const useChat = () => {
  const dispatch = useDispatch();

  const { chats, currentChatId, isLoading } = useSelector(
    (state) => state.chat,
  );
  const currentChat = chats[currentChatId] || { messages: [] };

  // ================= SEND MESSAGE =================
// ✅ src/hooks/useChat.js - Updated handleSendMessage with full debug

async function handleSendMessage({ message }) {
  console.log("🪝 [1] handleSendMessage called:", { 
    message: message?.slice(0, 50), 
    currentChatId,
    hasChats: Object.keys(chats).length 
  });
  
  if (!message?.trim()) {
    console.warn("⚠️ Empty message, returning");
    return;
  }

  let activeChatId = currentChatId;

  // 🟢 Create temp chat if none exists
  if (!activeChatId || activeChatId === "undefined" || activeChatId === "null") {
    activeChatId = `temp_${Date.now()}`;
    console.log("🆕 [2] Created temp chat ID:", activeChatId);

    dispatch(createNewChat({ chatId: activeChatId, title: "New Chat" }));
    dispatch(setCurrentChatId(activeChatId));
  }

  // 🟢 Optimistic UI: Add user message immediately
  const tempUserId = `temp_user_${Date.now()}`;
  console.log("📤 [3] Dispatching optimistic user message:", { 
    chatId: activeChatId, 
    id: tempUserId, 
    content: message?.slice(0, 30) 
  });
  
  dispatch(addNewMessage({
    chatId: activeChatId,
    content: message,
    role: "user",
    id: tempUserId
  }));

  dispatch(setLoading(true));
  console.log("🔄 [4] setLoading(true)");

  try {
    console.log("🌐 [5] Calling API sendMessage...");
    
    const response = await sendMessage(message, activeChatId.startsWith("temp_") ? null : activeChatId);
    
    console.log("✅ [6] API Response received:", {
      hasChat: !!response?.chat,
      chatId: response?.chat?._id || response?.chat?.id,
      hasAiMessage: !!response?.aiMessage,
      aiContent: response?.aiMessage?.content?.slice(0, 50) + "..."
    });

    const { chat: backendChat, aiMessage } = response;
    const realChatId = backendChat?._id || backendChat?.id;
    
    console.log("🔗 [7] Chat ID check:", { 
      temp: activeChatId, 
      real: realChatId, 
      shouldMigrate: realChatId && realChatId !== activeChatId 
    });

    // 🟢 Migrate from temp ID to real backend ID
    if (realChatId && realChatId !== activeChatId) {
      console.log("🔄 [8] Migrating temp → real chat");
      
      const tempMessages = chats[activeChatId]?.messages || [];
      console.log("📦 [8b] Migrating messages count:", tempMessages.length);
      
      dispatch(createNewChat({
        chatId: realChatId,
        title: backendChat?.title || "New Chat"
      }));

      tempMessages.forEach((msg, idx) => {
        console.log(`📦 [8c] Migrating message ${idx}:`, msg.id);
        dispatch(addNewMessage({
          chatId: realChatId,
          content: msg.content,
          role: msg.role,
          id: msg.id
        }));
      });

      dispatch(setCurrentChatId(realChatId));
      activeChatId = realChatId;
    }

    // 🟢 Add AI response
    const targetChatId = realChatId || activeChatId;
    console.log("🤖 [9] Adding AI message to chat:", targetChatId);
    
    const aiMsgId = String(aiMessage?.id || aiMessage?._id || `ai_${Date.now()}`);
    console.log("🤖 [9b] AI Message ID:", aiMsgId);
    
    dispatch(addNewMessage({
      chatId: targetChatId,
      content: String(aiMessage?.content || ""),
      role: String(aiMessage?.role || "assistant").toLowerCase(),
      id: aiMsgId
    }));

    console.log("✅ [10] handleSendMessage completed successfully");

  } catch (err) {
    console.error("❌ [ERROR] handleSendMessage:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });
  } finally {
    dispatch(setLoading(false));
    console.log("🔄 [11] setLoading(false)");
  }
}
  // ================= GET CHATS =================
  async function handleGetChats() {
    dispatch(setLoading(true));

    try {
      const data = await getChat(); // ✅ API call
      const chatList = data.chats || []; // backend should send array

      const formattedChats = chatList.reduce((acc, chat) => {
        acc[chat._id] = {
          id: chat._id,
          title: chat.title,
          messages: chat.messages || [],
          lastUpdated: chat.updatedAt,
        };
        return acc;
      }, {});

      dispatch(setChats(formattedChats));
    } catch (err) {
      console.error("error fetching chats", err);
    }

    dispatch(setLoading(false));
  }

  async function handleOpenChat(chatId) {
    console.log("🪝 handleOpenChat called with:", chatId);

    if (!chatId || chatId === "undefined" || chatId === "null") {
      console.warn("🚫 Blocked invalid chatId:", chatId);
      return;
    }

    dispatch(setLoading(true));

    try {
      // ✅ Pass chatId directly (not as object)
      const data = await getMessages(chatId);

      const { messages = [], title } = data;
      const formattedMessages = messages.map((msg) => ({
        id: msg._id || msg.id,
        content: msg.content,
        role: msg.role?.toLowerCase() || "assistant",
        timestamp: msg.createdAt || msg.timestamp,
      }));

      dispatch(createNewChat({ chatId, title: title || "Chat" }));

      formattedMessages.forEach((msg) => {
        dispatch(
          addNewMessage({
            chatId,
            content: msg.content,
            role: msg.role,
            id: msg.id,
          }),
        );
      });

      dispatch(setCurrentChatId(chatId));
    } catch (err) {
      console.error("Error in handleOpenChat:", err);
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleNewChat() {
    dispatch(setCurrentChatId(null));
  }
  return {
    initializeSocketConnection,
    handleSendMessage,
    handleGetChats,
    handleOpenChat,
    handleNewChat, // ✅ expose it
    messages: currentChat.messages,
    chatHistory: Object.values(chats),
    activeChatId: currentChatId,
    isLoading,
  };
};
