import express from "express";
import { authUser } from "../middlewares/authMiddlewares.js";
import { sendMessage } from "../controllers/chatController.js";

const router = express.Router();;

router.post ("/message", authUser, sendMessage )
export default router