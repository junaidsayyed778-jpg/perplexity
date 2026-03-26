// ✅ backend/src/services/aiService.js

import dotenv from "dotenv";
dotenv.config();

import readline from "readline";
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";

// ✅ Initialize model
let model;
try {
  model = new ChatMistralAI({
    model: "mistral-small",
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.7,
    maxTokens: 1024,
  });
  console.log("✅ Mistral AI model initialized");
} catch (err) {
  console.error("❌ Failed to initialize model:", err.message);
  model = null;
}

// ✅ CLI function - KEEP THIS (for testing)
function startCLI() {
  console.log("🤖 AI CLI Started - Type 'exit' to quit\n");
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function ask() {
    rl.question("💬 You: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        console.log("👋 Goodbye!");
        rl.close();
        return;
      }

      try {
        const response = await model.invoke([
          new SystemMessage("You are a helpful AI assistant."),
          new HumanMessage(input)
        ]);
        console.log(`🤖 AI: ${response.content}\n`);
      } catch (err) {
        console.error("❌ Error:", err.message);
      }

      ask();
    });
  }

  ask();
}

// ✅ generateResponse - Used by HTTP controllers
export async function generateResponse(messages) {
  try {
    if (!model) {
      return "AI service not available. Please try again later.";
    }

    const formattedMessages = messages
      .sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp))
      .map((msg) => {
        const role = String(msg.role || "").toLowerCase();
        const content = String(msg.content || "").trim();
        
        if (role === "user") return new HumanMessage(content);
        if (role === "assistant") return new AIMessage(content);
        return new SystemMessage(content);
      });

    const lastMsg = formattedMessages[formattedMessages.length - 1];
    if (!(lastMsg instanceof HumanMessage)) {
      formattedMessages.push(new HumanMessage("Please respond."));
    }

    const response = await model.invoke(formattedMessages);
    const aiContent = response?.content || response?.text || "";
    
    if (!aiContent?.trim()) {
      return "I couldn't generate a response. Please try again.";
    }

    return aiContent.trim();

  } catch (err) {
    console.error("❌ generateResponse error:", err.message);
    return "Sorry, I encountered an error. Please try again.";
  }
}

// ✅ generateChatTitle
export async function generateChatTitle(message) {
  try {
    if (!message?.trim()) return "New Chat";
    return message.trim().slice(0, 50);
  } catch (err) {
    return message?.trim().slice(0, 50) || "New Chat";
  }
}

// ✅ Test function
export async function testAIService() {
  try {
    if (!model) return false;
    const response = await model.invoke([new HumanMessage("Hello")]);
    return !!response?.content;
  } catch (err) {
    return false;
  }
}

// ✅ EXPORT everything (including startCLI for optional use)
export { startCLI, model };

// ❌ DO NOT auto-execute at module level:
// startCLI();  // 🚫 REMOVE THIS LINE if it exists!