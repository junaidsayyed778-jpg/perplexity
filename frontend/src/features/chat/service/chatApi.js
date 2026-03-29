// ✅ src/service/chatApi.js - COMPLETE REPLACEMENT
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    headers: { "Content-Type": "application/json" }
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors globally
api.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

// ✅ sendMessage: TWO separate parameters → sends { message: string, chat: string }
export const sendMessage = async (message, chatId) => {
    // 🔍 Debug: Log exactly what we're sending
    const payload = {
        message: String(message || "").trim(),  // ✅ Force string
        chat: chatId                             // ✅ Send as "chat" to match backend
    };
    
    console.log("📤 chatApi.js POST /message payload:", {
        message_type: typeof payload.message,  // Should be "string"
        chat_type: typeof payload.chat,        // Should be "string"
        payload
    });
    
    const response = await api.post("/api/chats/message", payload);
    return response.data;
};

export const getChat = async () => {
    const response = await api.get("/api/chats/");
    return response.data;
};

export const getMessages = async (chatId) => {
    if (!chatId || chatId === "undefined") {
        throw new Error(`Invalid chatId: ${chatId}`);
    }
    const response = await api.get(`/api/chats/${chatId}/messages`);
    return response.data;
};

export const deleteChat = async (chatId) => {
    const response = await api.delete(`/api/chats/${chatId}`);
    return response.data;
};