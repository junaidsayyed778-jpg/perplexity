
import app from "./src/app.js";
import { startCLI } from "./src/services/aiService.js";


const PORT = process.env.PORT || 3000;
app.listen(3000, () => {
    console.log(`Server is running on PORT ${PORT}`)
})

startCLI()