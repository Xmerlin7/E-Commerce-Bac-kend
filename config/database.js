import mongoose from "mongoose";
export const connectDB = async () => {
  try {
    // Force a 5-second timeout so it doesn't hang forever
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 
    });
    console.log("✅ MongoDB Connected via Docker");
  } catch (error) {
    console.error("❌ CONNECTION ERROR DETAILS:");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
  }
};
