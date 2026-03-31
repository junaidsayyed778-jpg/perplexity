import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://perplexity-1-omlj.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

export default app;