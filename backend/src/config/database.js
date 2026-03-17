import mongoose from "mongoose";

 async function connectDB(){

    await mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB:", err);
    })
}

export default connectDB;