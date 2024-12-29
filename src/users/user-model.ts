import mongoose, { Schema, Document } from "mongoose";
import { User } from "./types";

/**
 * @WARNING Keep this schema in sync with the User interface!
 *
 * Any changes to this schema (e.g., adding, removing, or modifying fields)
 * must also be reflected in the corresponding User interface to maintain
 * consistency across the codebase.
 *
 * @Usage This schema is used for runtime validation and database operations.
 */
export type IUserModel = Omit<User, "privateKey"> & {
  encryptedPrivateKey: string;
};
export type UserDoc = Document & IUserModel;
const userSchema = new Schema<UserDoc>(
  {
    // Required fields
    telegramId: { type: Number, required: true },
    encryptedPrivateKey: { type: String, required: true },
    firstName: { type: String, required: true },
    isBot: { type: Boolean, required: true },
    bumpsCounter: { type: Number, required: true },
    tokenPassesTotal: { type: Number, required: true },
    tokenPassesUsed: { type: Number, required: true },
    bumpIntervalInSeconds: { type: Number, required: true },
    bumpAmount: { type: Number, required: true },
    bumpsLimit: { type: Number, required: true },
    slippage: { type: Number, required: true },
    priorityFee: { type: Number, required: true },
    pumpFunAccIsSet: { type: Boolean, required: true },
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
      default: {},
    },

    // Optional fields
    serviceFeePass: {
      type: new Schema(
        {
          createdAt: { type: String, required: true },
          expirationDate: { type: String, required: false },
        },
        { _id: false } // Disable the creation of _id for each entry in the Map
      ),
      required: false,
    },
    lastName: { type: String, required: false },
    username: { type: String, required: false },
    lastBumpAt: { type: String, required: false },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);
const UserModel = mongoose.model<UserDoc>("User", userSchema);
export { UserModel };
