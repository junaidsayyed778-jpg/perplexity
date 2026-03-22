import dotenv from "dotenv";
dotenv.config();

import readline from "readline";
import { ChatMistralAI } from "@langchain/mistralai";
import { z } from "zod";
import { sendEmail } from "./emailService.js";
import { HumanMessage, SystemMessage , AIMessage} from "@langchain/core/messages";

// ✅ Email schema (YOU MISSED THIS)
const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
});

// ✅ Initialize model
const model = new ChatMistralAI({
  model: "mistral-small",
  apiKey: process.env.MISTRAL_API_KEY,
});

// ✅ CLI setup
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ✅ Message history (optional for future context)
const messages = [];

function startCLI() {
  function ask() {
    rl.question("💬 Enter your prompt: ", async (input) => {
      if (input.toLowerCase() === "exit") {
        console.log("👋 Exiting...");
        rl.close();
        return;
      }

      try {
        console.log("⏳ Calling AI...");

        // ✅ Proper structured prompt
        const response = await model.invoke([
          new HumanMessage(`
You are an AI email assistant.

User request: ${input}

Return ONLY raw JSON.
DO NOT wrap in markdown.
DO NOT use \`\`\`.

Format:
{
  "to": "email",
  "subject": "subject",
  "text": "email body"
}
  `),
        ]);

        // ✅ FIX: use .content instead of .text
        function safeParseJSON(text) {
          try {
            return JSON.parse(text);
          } catch {
            try {
              const cleaned = text
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
              return JSON.parse(cleaned);
            } catch {
              return null;
            }
          }
        }

        const emailData = safeParseJSON(response.content);

        if (!emailData) {
          console.log("❌ Could not parse AI response");
          console.log("Raw:", response.content);
          return ask();
        }
        // ✅ Validate using Zod
        const parsed = emailSchema.safeParse(emailData);

        if (!parsed.success) {
          console.log("❌ Invalid email data from AI");
          console.log(parsed.error);
          return ask();
        }

        // ✅ Decide if email should be sent
        const isEmailIntent =
          input.toLowerCase().includes("send") ||
          input.toLowerCase().includes("email");

        if (isEmailIntent) {
          await sendEmail(parsed.data);
          console.log("📧 Email sent:", parsed.data);
        } else {
          console.log("🤖 AI:", response.content);
        }
      } catch (err) {
        console.error("❌ Error:", err.message);
      }

      ask();
    });
  }

  ask();
}

// ✅ Export CLI
export { startCLI };

export async function generateResponse(messages) {
  const response = await model.invoke(
    messages.map(msg => {
      if (msg.role === "User") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "Assistant") {
        return new AIMessage(msg.content);
      }
    }).filter(Boolean) // filter out any undefined
  );
  return response.content;
}

export async function generateChatTitle(message) {
  const response = await model.invoke([
    new SystemMessage(`You are a helpful assistant that generates concise and descriptive titles for chat conversations.

User will provide you with the first message of a chat. Based on that message, generate a short title (3-5 words) that captures the essence of the conversation. The title should be specific, clear, and not generic.

Return ONLY the title. No explanation.`),

    new HumanMessage(`Generate a title for this message: ${message}`)
  ]);

  return response.content.trim(); // ✅ FIXED
}
