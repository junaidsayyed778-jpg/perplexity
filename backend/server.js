import dotenv from "dotenv";
dotenv.config(); // ✅ FIRST LINE

import app from "./src/app.js";
import { initSocket } from "./src/sockets/serverSocket.js";
import http from "http";
import connectDB from "./src/config/database.js";

console.log("ENV CHECK:");
console.log("USER:", process.env.GOOGLE_USER);
console.log("PASS:", process.env.EMAIL_PASS);

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

connectDB();
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

