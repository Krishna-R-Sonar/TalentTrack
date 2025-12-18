// backend/database/connections.js
import mongoose from "mongoose";

export const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "Track_talent_with_Automation"
    });
    console.log("MongoDB Successfully Connected!");
  } catch (error) {
    console.error(`Some error occurred while connecting to the database: ${error}`);
  }
};