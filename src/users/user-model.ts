import mongoose, { Schema } from "mongoose";
import { MIN_VALIDATOR_TIP_IN_SOL } from "../constants";
import { MAX_BUMPS_LIMIT } from "../config";
import { decryptPrivateKey } from "../lib/crypto";
import { TokenPass } from "./types";

export const userSchema = new Schema(
  {
    // Required fields
    telegramId: { type: Number, required: true },
    encryptedPrivateKey: { type: String, required: true },
    firstName: { type: String, required: true },
    isBot: { type: Boolean, required: true },

    // Default fields
    bumpsCounter: { type: Number, required: true, default: 0 },
    tokenPassesTotal: { type: Number, required: true, default: 1 }, // New users get 1 free token pass
    tokenPassesUsed: { type: Number, required: true, default: 0 },
    bumpIntervalInSeconds: {
      type: Number,
      required: true,
      default: 10,
    },
    bumpAmount: {
      type: Number,
      required: true,
      default: 0.0123, // 0.012 is the minimum amount to be shown in pump.fun history
    },
    bumpsLimit: {
      type: Number,
      required: true,
      default: 10,
      validate: {
        validator: (value: number) => value >= MAX_BUMPS_LIMIT,
        message: (props: unknown) =>
          `Bumps limit must be at least ${MAX_BUMPS_LIMIT}.`,
      },
    },
    slippage: {
      type: Number,
      required: true,
      default: 0.02,
    },
    priorityFee: {
      type: Number,
      required: true,
      default: 0.0001,
      validate: {
        validator: (value: number) => value >= MIN_VALIDATOR_TIP_IN_SOL,
        message: (props: unknown) =>
          `Priority fee must be at least ${MIN_VALIDATOR_TIP_IN_SOL}.`,
      },
    },
    pumpFunAccIsSet: { type: Boolean, required: true, default: false },
    tokenPass: {
      type: Map,
      of: new Schema<TokenPass>(
        {
          createdAt: { type: String, required: true },
          expirationDate: { type: String, required: false },
        },
        { _id: false }
      ),
      required: true,
      default: new Map(),
    },

    // Optional fields
    serviceFeePass: {
      type: new Schema(
        {
          createdAt: { type: String, required: true },
          expirationDate: { type: String, required: false },
        },
        { _id: false }
      ),
      required: false,
    },
    lastName: { type: String, required: false, default: "" },
    username: { type: String, required: false, default: "" },
    lastBumpAt: { type: String, required: false },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true }, // Include virtuals when converting to an object
    virtuals: {
      privateKey: {
        get() {
          return decryptPrivateKey(this.encryptedPrivateKey);
        },
      },
    },
  }
);

export const UserModel = mongoose.model("User", userSchema);
