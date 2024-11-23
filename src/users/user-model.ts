import mongoose, { Schema, Document } from "mongoose";
import { User } from "./types";

export type IUserModel = Omit<User, "privateKey"> & {
  encryptedPrivateKey: string;
};

// Updated interface based on the new types
export type UserDoc = Document & IUserModel;

const userSchema = new Schema<UserDoc>(
  {
    telegramId: { type: Number, required: true },
    encryptedPrivateKey: { type: String, required: true },
    firstName: { type: String, required: true },
    isBot: { type: Boolean, required: true },
    bumpsCounter: { type: Number, required: true },
    freePassesTotal: { type: Number, required: true },
    freePassesUsed: { type: Number, required: true },
    bumpIntervalInSeconds: { type: Number, required: true },
    bumpAmount: { type: Number, required: true },
    bumpsLimit: { type: Number, required: true },
    slippage: { type: Number, required: true },
    priorityFee: { type: Number, required: true },
    pumpFunAccIsSet: { type: Boolean, required: true },
    lastName: { type: String },
    username: { type: String },
    // Adding tokenPass field as an object where each key maps to an object containing createdAt and optional expirationDate
    tokenPass: {
      type: Map,
      of: new Schema(
        {
          createdAt: { type: String, required: true },
          expirationDate: { type: String, required: false },
        },
        { _id: false } // Disable the creation of _id for each entry in the Map
      ),
      required: true,
      default: {}, // Default to an empty object if no passes exist
    },
    // Adding serviceFeePass as an optional object with createdAt and expirationDate
    serviceFeePass: {
      createdAt: { type: String, required: true },
      expirationDate: { type: String, required: false },
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const UserModel = mongoose.model<UserDoc>("User", userSchema);

export { UserModel };
