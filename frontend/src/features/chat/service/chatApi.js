// ✅ src/service/chatApi.js
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api/chats",  // ✅ Verify this matches your backend port
    withCredentials: true,
});

//✅ sendMessage: Accept direct parameters
export const sendMessage = async (message, chatId) => {
    console.log("📤 API sendMessage:", { message, chatId });
    const response = await api.post("/message", { message, chat: chatId });
    return response.data;
};

//✅ getChat: No params needed
export const getChat = async () => {
    console.log("📤 API getChat: fetching all chats");
    const response = await api.get("/");
    return response.data;
};

//✅ getMessages: Accept chatId as DIRECT PARAMETER (not destructured)
export const getMessages = async (chatId) => {
    console.log("📤 API getMessages:", { chatId, url: `/${chatId}/messages` });
    
    if (!chatId || chatId === "undefined") {
        throw new Error(`Invalid chatId passed to getMessages: ${chatId}`);
    }
    
    const response = await api.get(`/${chatId}/messages`);
    return response.data;
};

//✅ deleteChat: Accept direct parameter + fix URL
export const deleteChat = async (chatId) => {
    console.log("📤 API deleteChat:", { chatId });
    const response = await api.delete(`/${chatId}`);  // ✅ Fixed: was `/delete${chatId}`
    return response.data;
};