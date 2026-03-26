// ✅ backend/src/services/aiService.js
import dotenv from "dotenv";
dotenv.config();
import * as z from "zod";
import readline from "readline";

// ✅ LangChain imports (stable paths)
import { ChatMistralAI } from "@langchain/mistralai";
import { HumanMessage, AIMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";

// ✅ Your internet search function
import { searchInternet } from "./internetService.js";

// ✅ Initialize model
let model;
try {
  model = new ChatMistralAI({
    model: "mistral-small", // or "mistral-large-latest" for better tool calling
    apiKey: process.env.MISTRAL_API_KEY,
    temperature: 0.7,
    maxTokens: 1024,
  });
  console.log("✅ Mistral AI model initialized");
} catch (err) {
  console.error("❌ Failed to initialize model:", err.message);
  model = null;
}

// ✅ Define the search tool using DynamicStructuredTool
const searchInternetTool = new DynamicStructuredTool({
  name: "searchInternet",
  description: "Search the internet for up-to-date information. Use when you need current facts, news, or data.",
  schema: z.object({
    query: z.string().describe("The search query to look up on the internet")
  }),
  func: async ({ query }) => {
    try {
      const results = await searchInternet(query);
      // Return a clean string summary for the model
      return JSON.stringify(results.results?.map(r => ({
        title: r.title,
        url: r.url,
        content: r.content?.slice(0, 300) // truncate for context limits
      })) || [], null, 2);
    } catch (err) {
      return `Error searching internet: ${err.message}`;
    }
  }
});

const tools = [searchInternetTool];

// ✅ Manual agent loop - handles tool calling natively
async function runAgentLoop(messages, maxSteps = 5) {
  let currentMessages = [...messages];
  
  for (let step = 0; step < maxSteps; step++) {
    // ✅ Bind tools to model for function calling
    const modelWithTools = model.bindTools(tools);
    
    const response = await modelWithTools.invoke(currentMessages);
    
    // ✅ Check if model wants to call a tool
    if (response.tool_calls?.length > 0) {
      currentMessages.push(response);
      
      for (const toolCall of response.tool_calls) {
        if (toolCall.name === "searchInternet") {
          const result = await searchInternetTool.invoke(toolCall.args);
          currentMessages.push(new ToolMessage({
            name: toolCall.name,
            content: result,
            tool_call_id: toolCall.id
          }));
        }
      }
      // Continue loop to let model respond with tool results
      continue;
    }
    
    // ✅ No more tool calls — return final response
    return response.content;
  }
  
  // ⚠️ Max steps reached
  return "I reached the maximum number of steps. Here's what I have so far: " + 
         currentMessages[currentMessages.length - 1]?.content || "";
}

// ✅ CLI function - for testing
function startCLI() {
  if (!model) {
    console.log("❌ Model not available. Check API key and initialization.");
    return;
  }

  console.log("🤖 AI CLI Started - Type 'exit' to quit\n");
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const chatHistory = [
    new SystemMessage("You are a helpful AI assistant. Use the searchInternet tool when you need up-to-date information from the web.")
  ];

  async function ask() {
    rl.question("💬 You: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        console.log("👋 Goodbye!");
        rl.close();
        return;
      }

      try {
        chatHistory.push(new HumanMessage(input));
        const response = await runAgentLoop(chatHistory);
        
        console.log(`🤖 AI: ${response}\n`);
        chatHistory.push(new AIMessage(response));
      } catch (err) {
        console.error("❌ Error:", err.message);
        chatHistory.push(new AIMessage("Sorry, I encountered an error."));
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

    // Format incoming messages
    const formattedMessages = messages
      .sort((a, b) => new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp))
      .map((msg) => {
        const role = String(msg.role || "").toLowerCase();
        const content = String(msg.content || "").trim();
        
        if (role === "user") return new HumanMessage(content);
        if (role === "assistant") return new AIMessage(content);
        return new SystemMessage(content);
      });

    // Ensure last message is from user
    const lastMsg = formattedMessages[formattedMessages.length - 1];
    if (!(lastMsg instanceof HumanMessage)) {
      formattedMessages.push(new HumanMessage("Please respond."));
    }

    // ✅ Run agent loop with tool support
    const aiContent = await runAgentLoop(formattedMessages);
    
    if (!aiContent?.trim()) {
      return "I couldn't generate a response. Please try again.";
    }

    return aiContent.trim();

  } catch (err) {
    console.error("❌ generateResponse error:", err.message);
    return "Sorry, I encountered an error. Please try again.";
  }
}

// ✅ generateChatTitle (unchanged)
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

// ✅ EXPORT everything
export { startCLI, model, runAgentLoop };

// 🚫 DO NOT auto-execute at module level!
// if (require.main === module) startCLI(); // For CommonJS
// For ESM, use: node --input-type=module -e "import('./src/services/aiService.js').then(m => m.startCLI())"