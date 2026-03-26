import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: {},
    currentChatId: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    createNewChat: (state, action) => {
      const { chatId, title } = action.payload;

      state.chats[chatId] = {
        id: chatId,
        title,
        messages: [],
        lastUpdated: new Date().toISOString(),
      };
    },

    // ✅ src/store/chatSlice.js
    addNewMessage: (state, action) => {
      const { chatId, content, role, id, timestamp } = action.payload;

      console.log("🔴 [Redux] addNewMessage:", {
        chatId,
        id,
        role,
        contentPreview: content?.slice(0, 30),
        chatsBefore: Object.keys(state.chats),
        chatExists: !!state.chats[chatId],
      });

      // Create chat if doesn't exist
      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          id: chatId,
          title: "New Chat",
          messages: [],
          lastUpdated: new Date().toISOString(),
        };
      }

      // Avoid duplicate messages by ID
      const exists = state.chats[chatId].messages.some((m) => m.id === id);

      if (!exists && id) {
        state.chats[chatId].messages.push({
          id,
          content,
          role: role?.toLowerCase() || "assistant",
          timestamp: timestamp || new Date().toISOString(),
        });
        console.log("✅ [Redux] Message ADDED:", {
          chatId,
          id,
          totalNow: state.chats[chatId].messages.length,
        });
      } else {
        console.warn("⚠️ [Redux] Message SKIPPED:", { exists, hasId: !!id });
      }

      state.chats[chatId].lastUpdated = new Date().toISOString();

      console.log("🔴 [Redux] Final state for chat:", {
        chatId,
        messageCount: state.chats[chatId].messages.length,
        lastMessage: state.chats[chatId].messages[
          state.chats[chatId].messages.length - 1
        ]?.content?.slice(0, 30),
      });
    },
    addMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.chats[chatId].messages.push(...messages);
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setCurrentChatId: (state, action) => {
      state.currentChatId = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setChats,
  setCurrentChatId,
  setLoading,
  setError,
  createNewChat,
  addNewMessage,
  addMessages,
} = chatSlice.actions;
export default chatSlice.reducer;
