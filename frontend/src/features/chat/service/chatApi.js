import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api/chats",
    withCredentials: true,
})

export const sendMessage = async ({ message, chatId}) =>{
    const response = await api.post("/message", {message, chatId})
    return response.data
}

export const getChat = async () =>{
    const response = await api.get(`/`)
    return response.data
}

export const getMessages = async ({ chatId}) =>{
    const response = await api.get(`/${chatId}/messages`)
    return response.data
}

export const deleteChat = async ({ chatId} ) =>{
    const response = await api.delete(`/delete${chatId}`)
    return response.data
}