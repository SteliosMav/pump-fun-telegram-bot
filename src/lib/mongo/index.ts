import mongoose from "mongoose";
import { MONGO_URI } from "../../shared/constants";
import { ENV } from "../../shared/config";

// MongoDB connection URI
const mongoURI = MONGO_URI;

// Connect to MongoDB using Mongoose
const connectDB = () => {
  mongoose
    .connect(mongoURI, { autoIndex: ENV === "production" ? false : true })
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Failed to connect to MongoDB", err);
    });
};

export default connectDB;
