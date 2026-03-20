import chatModel from "../models/chatModel.js";
import messageModel from "../models/messageModel.js";
import { generateChatTitle, generateResponse } from "../services/aiService.js";

export async function sendMessage(req, res) {
  const { message } = req.body;

  const title = await generateChatTitle(message);

  console.log("Generated title:", title);

  const result = await generateResponse(message);

  const chat = await chatModel.create({
    user: req.user.id,
    title: title,
  })

  const aiMessage = await messageModel.create({
    chat: chat._id,
    content: result,
    role: "Assistant",
  });
  
  res.json({
  title,
  chat ,
  aiMessage
  });
}
