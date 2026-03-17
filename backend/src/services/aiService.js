import dotenv from "dotenv";
dotenv.config();

import readline from "readline";
import { ChatMistralAI } from "@langchain/mistralai";
import { tool , createAgent} from "langchain"
import {  AgentExecutor } from "langchain/agents";

import { z } from "zod";
import { sendEmail } from "./emailService.js";

const emailTool = tool(
    sendEmail,
    {
        name: "emailTool",
        description: "Use this tool to send an email",
        schema: z.object({
            to: z.string().describe("The recipient emial address"),
            subject: z.string().describe("The email subject"),
            html: z.string().describe("The email content in HTML format").optional(),
            text: z.string().describe("The email content in plain text format").optional()
        })
    }
)
const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

const agent = createAgent({
    llm: mistralModel,
    tools: [emailTool]
})

const agentExecutor = new AgentExecutor({
  agent,
  tools: [emailTool],
});
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


const messages= [];
function startCLI() {
  function ask() {
    rl.question("💬 Enter your prompt: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        console.log("👋 Exiting...");
        rl.close();
        return;
      }

       try {
        messages.push({ role: "user", content: input });

        const response = await agentExecutor.invoke({
          input,
        });

        messages.push({
          role: "assistant",
          content: response.output,
        });

        console.log("🤖 AI:", response.output);

      }  catch (err) {
        console.error("❌ Error:", err.message);
      }

      ask();
    });
  }

  ask();
}

// 👇 export this
export { startCLI };
