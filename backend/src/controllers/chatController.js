import chatModel from "../models/chatModel.js";
import messageModel from "../models/messageModel.js";
import { generateChatTitle, generateResponse } from "../services/aiService.js";
import mongoose from "mongoose";
export async function sendMessage(req, res) {
    console.log("🔍 === sendMessage DEBUG ===");
  console.log("  req.body:", req.body);
  console.log("  req.user:", req.user);
  console.log("  req.user?.id:", req.user?.id, "type:", typeof req.user?.id);
  console.log("🔍 === END DEBUG ===\n");
  const { message, chat: chatId } = req.body;

  let title = null;
  let chat = null;
  let chat_id = chatId;

  if (!chatId) {
    title = await generateChatTitle(message);
    chat = await chatModel.create({
      user: req.user.id,
      title: title,
    });
    chat_id = chat._id;
  } else {
    chat = await chatModel.findById(chatId);
  }

  // Create user message
  const userMessage = await messageModel.create({
    chat: chat_id,
    content: message,
    role: "User",
  });

  const messages = await messageModel.find({ chat: chat_id });
  
  const result = await generateResponse(messages);
  
  // Create AI message
  const aiMessage = await messageModel.create({
    chat: chat_id,
    content: result,
    role: "Assistant",
  });

  res.json({
    title,
    chat,
    aiMessage,
  });

  console.log(messages);
}


export async function getChat(req, res) {
  const user = req.user;
  const { page = 1, limit = 10 } = req.query;

  try {
    // ✅ Use Mongoose .sort() - accepts { field: -1 } syntax
    // ✅ Also remove the double await
    const chats = await chatModel
      .find({ user: user.id })
      .sort({ updatedAt: -1 })  // ✅ Correct: Mongoose Query method
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      message: "Chats retrieved successfully",
      chats,
    });
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ error: "Failed to fetch chats" });
  }
}

 
export async function getMessages(req, res) {
  // 🔍 DEBUG LOGGING - Add this at the VERY TOP
  console.log("🔍 === getMessages DEBUG ===");
  console.log("  URL:", req.originalUrl);
  console.log("  req.params:", JSON.stringify(req.params));
  console.log("  req.params.chatId:", req.params.chatId);
  console.log("  typeof chatId:", typeof req.params.chatId);
  console.log("  req.user?.id:", req.user?.id);
  console.log("  Headers:", req.headers.authorization?.slice(0, 30) + "...");
  console.log("🔍 === END DEBUG ===\n");
  try {
    const { chatId } = req.params;
    const userId = req.user?.id;

    // ✅ VALIDATION 1: Check if chatId exists
    if (!chatId || chatId === "undefined" || chatId === "null") {
      console.warn("getMessages: Missing or invalid chatId:", chatId);
      return res.status(400).json({ 
        error: "Missing or invalid chatId",
        received: chatId 
      });
    }

    // ✅ VALIDATION 2: Check if chatId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      console.warn("getMessages: Invalid ObjectId format:", chatId);
      return res.status(400).json({ 
        error: "Invalid chatId format",
        received: chatId 
      });
    }

    // ✅ VALIDATION 3: Ensure user is authenticated
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // ✅ Now safe to query - chatId is valid
    const chat = await chatModel.findOne({ 
      _id: chatId,
      user: userId  // ✅ Ensure user owns this chat
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found"
      });
    }

    // ✅ Fetch messages sorted by creation time (oldest first)
    const messages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 })  // ✅ Critical for conversation order
      .select("content role createdAt _id");

    res.status(200).json({
      message: "Messages retrieved successfully",
      chatId,
      title: chat.title,
      messages
    });
    
  } catch (err) {
    console.error("Error in getMessages:", err);
    
    // ✅ Handle CastError specifically
    if (err.name === "CastError") {
      return res.status(400).json({ 
        error: "Invalid resource ID format",
        details: err.message 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to fetch messages",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
}

 export async function deleteChat(req, res){

  const { chatId } = req.params

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user.id
  })

  await messageModel.deleteMany({
    chat: chatId
  })

  if(!chat){
    return res.status(404).json({
      message: "Chat not found"
    })
  }

  res.status(200).json({
    message: "Chat deleted successfully"
  })
 }
