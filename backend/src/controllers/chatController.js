import { generateResponse } from "../services/aiService.js";

export async function sendMessage(req, res) {
    const { message } = req.body;

    const result = await generateResponse(message)
    res.json({
       message: result
    })
}