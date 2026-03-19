
import express from "express";
import cors from "cors"
import authRouter from "./routes/authRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(morgan("dev"))



app.use("/api/auth", authRouter)
app.use("/api/chats", chatRouter)

export default app;