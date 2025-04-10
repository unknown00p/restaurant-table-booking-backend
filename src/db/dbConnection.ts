import mongoose from "mongoose";

export async function db() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    console.log("db connected successfully")
  } catch (error) {
    console.log(error);
  }
}
