import mongoose, { Schema, Document } from "mongoose";
import { User } from "./types";

export type IUserModel = Omit<User, "privateKey"> & {
  encryptedPrivateKey: string;
};

// Updated interface based on the new types
export type UserDoc = Document & IUserModel;

// Always convert to string when getting an ObjectId
mongoose.Schema.ObjectId.get((v: any) => v.toString());

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
    slippage: { type: Number, required: true },
    priorityFee: { type: Number, required: true },
    pumpFunAccIsSet: { type: Boolean, required: true },
    createdAt: { type: String, required: true }, // ISO 8601 date string
    updatedAt: { type: String, required: true }, // ISO 8601 date string
    lastName: { type: String },
    username: { type: String },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const UserModel = mongoose.model<UserDoc>("User", userSchema);

export { UserModel };
