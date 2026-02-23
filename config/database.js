import mongoose from "mongoose";
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("DB Connected Successfully");
  } catch {
    console.log("DB Not Connected Successfully");
  }
};
