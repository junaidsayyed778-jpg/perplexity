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
const allowedOrigins = [
  "http://localhost:5173",
  "https://perplexity-frontend.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));



app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

export default app;