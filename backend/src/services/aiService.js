import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai"

const geminiModel = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash-lite",
    apiKey: process.env.GEMINI_API_KEY
});

const mistralModel = new ChatMistralAI({
    model: "mistral-small-latest",
    apiKey: process.env.MISTRAL_API_KEY
})