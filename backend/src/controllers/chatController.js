import { generateChatTitle, generateResponse } from "../services/aiService.js";

export async function sendMessage(req, res) {
    const { message } = req.body;

    const title = await generateChatTitle(message)

    console.log("Generated title:", title)

    const result = await generateResponse(message)
      res.json({
         title: title,
       message: result
      
    })
}