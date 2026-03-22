import chatModel from "../models/chatModel.js";
import messageModel from "../models/messageModel.js";
import { generateChatTitle, generateResponse } from "../services/aiService.js";

export async function sendMessage(req, res) {
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

export async function getChat(req, res){

  const user = req.user

  const { page = 1, limit = 10 } = req.query;
  const chats = await (await chatModel.find({ user: user.id}))
  .toSorted({ updatedAt: -1 })
   .skip((page - 1) * limit)
  .limit(Number(limit));

  res.status(200).json({
    message: "Chats retrieved successfully",
    chats,
  })
}

 export async function getMessages(req, res){
  const { chatId } = req.params

  const chat = await chatModel.findOne({ 
    _id: chatId,
    user: req.user.id
  })

  if(!chat){
    return res.status(404).json({
      message: "Chat not found"
    })
  }

  const messages = await messageModel.find({
    chat: chatId
    
  })

  res.status(200).json({
    message: "Messages retrived successfully",
    messages
  })
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
