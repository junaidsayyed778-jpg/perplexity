
import app from "./src/app.js";
import { startCLI } from "./src/services/aiService.js";
import { initSocket } from "./src/sockets/serverSocket.js";
import http from "http";

const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(app)

initSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})


startCLI()