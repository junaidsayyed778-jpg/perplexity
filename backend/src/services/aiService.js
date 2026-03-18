import dotenv from "dotenv";
dotenv.config();

import readline from "readline";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { sendEmail } from "./emailService.js";
const emailTool = tool(sendEmail, {
  name: "emailTool",
  description: "Use this tool to send an email",
  schema: z.object({
    to: z.string().describe("The recipient emial address"),
    subject: z.string().describe("The email subject"),
    html: z.string().describe("The email content in HTML format").optional(),
    text: z
      .string()
      .describe("The email content in plain text format")
      .optional(),
  }),
});

const model = new ChatGoogleGenerativeAI({
  model : "gemini-1.5-flash",
  apiKey: process.env.GEMINI_API_KEY,
});
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
        messages.push({ role: "user", content: input });

      console.log("⏳ Calling AI...");

const response = await model.invoke(`
You are an AI email assistant.

User request: ${input}

Return ONLY valid JSON:
{
  "to": "email",
  "subject": "subject",
  "text": "email body"
}
`);

console.log("✅ AI Raw Response:", response);

        messages.push({
          role: "assistant",
          content: response.content,
        });

        let emailData;

        try {
          emailData = JSON.parse(response.content);
        } catch (err) {
          console.log("❌ Failed to parse AI response");
          return;
        }

        const parsed = emailSchema.safeParse(emailData);

        if (!parsed.success) {
          console.log("❌ Invalid email data from AI");
          console.log(parsed.error);
          return;
        }

        if (isEmailIntent) {
          await sendEmail(parsed.data);
          console.log("📧 Email sent:", parsed.data);
        } else {
          console.log("🤖 AI:", response.content);
        }
        console.log("🤖 AI:", response.content);
      } catch (err) {
        console.error("❌ Error:", err.message);
      }

      ask();
    });
  }

  ask();
}

// 👇 export this
export { startCLI };
