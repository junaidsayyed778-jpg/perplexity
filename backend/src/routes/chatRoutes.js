import express from "express";
import { authUser } from "../middlewares/authMiddlewares.js";
import { deleteChat, getChat, getMessages, sendMessage } from "../controllers/chatController.js";

const router = express.Router();;

router.post ("/message", authUser, sendMessage )
router.get("/", authUser, getChat)
router.get("/:chatId/messages", authUser, getMessages)
router.delete("/:delete/:chatId", authUser, deleteChat)
export default router