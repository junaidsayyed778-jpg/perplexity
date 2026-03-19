import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors"
import authRouter from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import connectDB  from "./config/database.js";
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

connectDB();

app.use("/api/auth", authRouter)

export default app;