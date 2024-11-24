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
    lastBumpAt: { type: String, required: false }, // Optional field for ISO date format
    tokenPassesTotal: { type: Number, required: true },
    tokenPassesUsed: { type: Number, required: true },
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
    serviceFeePass: {
      type: new Schema(
        {
          createdAt: { type: String, required: true }, // Required if serviceFeePass exists
          expirationDate: { type: String, required: false }, // Optional
        },
        { _id: false } // Prevents an additional _id field for this sub-schema
      ),
      required: false, // Makes the whole serviceFeePass field optional
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const UserModel = mongoose.model<UserDoc>("User", userSchema);

export { UserModel };
