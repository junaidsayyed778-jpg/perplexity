import {
  addNewMessage,
  createNewChat,
  setChats,
  setCurrentChatId,
  setLoading
} from "../chatSlice"

import { sendMessage, getChat, getMessages } from "../service/chatApi"
import { initializeSocketConection } from "../service/chatSocket"
import { useDispatch, useSelector } from "react-redux"

export const useChat = () => {
  const dispatch = useDispatch()

  const { chats, currentChatId, isLoading } = useSelector((state) => state.chat)
  const currentChat = chats[currentChatId] || { messages: [] }

  // ================= SEND MESSAGE =================
  async function handleSendMessage({ message }) {
    if (!message.trim()) return

    let activeChatId = currentChatId

    // 🟢 Create temp chat if none
    if (!activeChatId || activeChatId === "null" || activeChatId === "undefined") {
      activeChatId = `temp_${Date.now()}`;

      dispatch(createNewChat({
        chatId: activeChatId,
        title: "New Chat"
      }))

      dispatch(setCurrentChatId(activeChatId))
    }

    // 🟢 Optimistic UI
    dispatch(addNewMessage({
      chatId: activeChatId,
      content: message,
      role: "user",
      id: `temp_${Date.now()}`
    }))

    dispatch(setLoading(true))

 try {
      const response = await sendMessage({
        message,
        chat: activeChatId.startsWith("temp_") ? null : activeChatId
      });

      const { chat: backendChat, userMessage, aiMessage } = response;
      const realChatId = backendChat?. _id;

      // 🟢 If backend gave new real ID, migrate from temp
      if (realChatId && realChatId !== activeChatId) {
        // Get messages from temp chat
        const tempMessages = chats[activeChatId]?.messages || [];
        
        // Create new chat entry with real ID
        dispatch(createNewChat({
          chatId: realChatId,
          title: backendChat.title
        }));

        // Migrate all messages to real chat
        tempMessages.forEach((msg) => {
          dispatch(addNewMessage({
            chatId: realChatId,
            content: msg.content,
            role: msg.role,
            id: msg.id
          }));
        });

        // Update current chat ID to real one
        dispatch(setCurrentChatId(realChatId));
        
        // Optional: Clean up temp chat
        // dispatch(removeChat(activeChatId)); // if you have this action
      }

      // 🟢 Add AI response (use realChatId)
      const targetChatId = realChatId || activeChatId;
      
      // Add user message with real ID if it was temp
      if (userMessage && userMessage.id) {
        dispatch(addNewMessage({
          chatId: targetChatId,
          content: userMessage.content,
          role: userMessage.role,
          id: userMessage.id
        }));
      }
      
      // Add AI message
      dispatch(addNewMessage({
        chatId: targetChatId,
        content: aiMessage.content,
        role: aiMessage.role?.toLowerCase() || "assistant",
        id: aiMessage.id
      }));

    } catch (err) {
      console.error("error sending message", err)
    }

    dispatch(setLoading(false))
  }

  // ================= GET CHATS =================
  async function handleGetChats() {
    dispatch(setLoading(true))

    try {
      const data = await getChat()   // ✅ API call
      const chatList = data.chats || []  // backend should send array

      const formattedChats = chatList.reduce((acc, chat) => {
        acc[chat._id] = {
          id: chat._id,
          title: chat.title,
          messages: chat.messages || [],
          lastUpdated: chat.updatedAt,
        }
        return acc
      }, {})

      dispatch(setChats(formattedChats))

    } catch (err) {
      console.error("error fetching chats", err)
    }

    dispatch(setLoading(false))
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
      timestamp: msg.createdAt || msg.timestamp
    }));

    dispatch(createNewChat({ chatId, title: title || "Chat" }));
    
    formattedMessages.forEach((msg) => {
      dispatch(addNewMessage({
        chatId,
        content: msg.content,
        role: msg.role,
        id: msg.id
      }));
    });

    dispatch(setCurrentChatId(chatId));

  } catch (err) {
    console.error("Error in handleOpenChat:", err);
  } finally {
    dispatch(setLoading(false));
  }
}

  async function handleNewChat(){
    dispatch(setCurrentChatId(null));

  }
  return {
    initializeSocketConection,
    handleSendMessage,
    handleGetChats,
    handleOpenChat,
    handleNewChat, // ✅ expose it
    messages: currentChat.messages,
    chatHistory: Object.values(chats),
    activeChatId: currentChatId,
    isLoading
  }
}