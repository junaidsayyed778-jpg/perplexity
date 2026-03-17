import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors"
import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import connectDB  from "./config/database.js";

const app = express()
app.use(express.json())
app.use(cookieParser())

connectDB();
app.use("/api/auth", authRouter)

export default app;