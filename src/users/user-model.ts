import { model, Schema } from "mongoose";
import { MIN_VALIDATOR_TIP_IN_SOL } from "../constants";
import { MAX_BUMPS_LIMIT } from "../config";
import { decryptPrivateKey } from "../lib/crypto";

const tokenSchema = new Schema(
  {
    createdAt: { type: String, required: true },
    expirationDate: String,
  },
  { _id: false }
);

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
      of: tokenSchema,
      required: true,
      default: new Map(),
    },

    // Optional fields
    serviceFeePass: {
      type: new Schema(
        {
          createdAt: { type: String, required: true },
          expirationDate: String,
        },
        { _id: false }
      ),
    },
    lastName: String,
    username: String,
    lastBumpAt: String,
  },

  {
    // Virtual fields
    virtuals: {
      privateKey: {
        get() {
          return decryptPrivateKey(this.encryptedPrivateKey);
        },
      },
    },

    // Methods
    methods: {
      hasServicePass(): boolean {
        if (this.serviceFeePass && this.serviceFeePass.createdAt) {
          const expirationDate = this.serviceFeePass.expirationDate
            ? new Date(this.serviceFeePass.expirationDate)
            : null;
          if (expirationDate) {
            if (expirationDate > new Date()) {
              return true;
            }
          } else {
            return true;
          }
        }
        return false;
      },

      hasPassForToken(mint: string): boolean {
        const tokenPassToken = this.tokenPass.get(mint);
        if (tokenPassToken && tokenPassToken.createdAt) {
          const expirationDate = tokenPassToken.expirationDate
            ? new Date(tokenPassToken.expirationDate)
            : null;
          if (expirationDate) {
            if (expirationDate > new Date()) {
              return true;
            }
          } else {
            return true;
          }
        }
        return false;
      },
    },

    // Static Methods
    statics: {
      findByTgId(tgId: number) {
        return this.find({ telegramId: tgId });
      },
    },

    // Schema options
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const UserModel = model("User", userSchema);
