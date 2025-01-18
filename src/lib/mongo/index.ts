import mongoose from "mongoose";
import { MONGO_URI } from "../../shared/constants";
import { ENV } from "../../shared/config";

function connectDB(): Promise<void> {
  return mongoose
    .connect(MONGO_URI, { autoIndex: ENV === "production" ? false : true })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
    });
}

export default connectDB;
