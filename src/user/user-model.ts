import { model, Schema } from "mongoose";
import {
  MIN_VALIDATOR_TIP_IN_SOL,
  MIN_VISIBLE_BUMP_AMOUNT,
} from "../constants";
import { MAX_BUMPS_LIMIT } from "../config";
import { decryptPrivateKey } from "../lib/crypto";
import {
  UserRaw,
  UserMethods,
  UserModelType,
  UserQueryHelpers,
  UserStatics,
  UserVirtuals,
  BumpSettings,
  ServicePass,
  TokenPass,
  TelegramInfo,
} from "./types";

export const userSchema = new Schema<
  UserRaw,
  UserModelType,
  UserMethods,
  UserQueryHelpers,
  UserVirtuals,
  UserStatics
>(
  {
    // === Required fields ===
    encryptedPrivateKey: { type: String, required: true },
    telegram: {
      type: new Schema<TelegramInfo>(
        {
          id: { type: Number, required: true, min: 1 },
          firstName: { type: String, required: true },
          isBot: { type: Boolean, required: true },
          lastName: String,
          username: String,
          hasBannedBot: Boolean,
        },
        { _id: false }
      ),
      default: {},
    },

    // === Default fields ===
    paidBumps: { type: Number, default: 0 },
    totalTokenPasses: { type: Number, default: 1 }, // New users get 1 free token pass
    bumpSettings: {
      type: new Schema<BumpSettings>(
        {
          intervalInSeconds: {
            type: Number,
            default: 10,
            max: 60,
            min: 1,
          },
          amount: {
            type: Number,
            default: MIN_VISIBLE_BUMP_AMOUNT,
            max: 1,
            min: MIN_VISIBLE_BUMP_AMOUNT,
          },
          limit: {
            type: Number,
            default: 10,
            max: MAX_BUMPS_LIMIT,
            min: 1,
          },
          slippage: {
            type: Number,
            default: 0.02,
          },
          priorityFee: {
            type: Number,
            default: 0.0001,
            min: MIN_VALIDATOR_TIP_IN_SOL,
            max: 1,
          },
        },
        { _id: false }
      ),
      default: {},
    },
    isPumpFunAccountSet: { type: Boolean, required: true, default: false },
    usedTokenPasses: {
      type: Map,
      of: new Schema<TokenPass>(
        {
          bumps: { type: Number, default: 0 },
        },
        { _id: false, timestamps: true } // Nested timestamps are set initially but the updatedAt must be updated manually
      ),
      default: new Map(),
    },

    // === Optional fields ===
    servicePass: new Schema<ServicePass>(
      {
        bumps: { type: Number, default: 0 },
        expirationDate: Date,
      },
      { _id: false, timestamps: true } // Nested timestamps are set initially but the updatedAt must be updated manually
    ),
    lastBumpAt: Date,
  },

  {
    // === Virtual fields ===
    virtuals: {
      hasServicePass: {
        get(): boolean {
          if (this.servicePass && this.servicePass.createdAt) {
            const expirationDate = this.servicePass.expirationDate
              ? new Date(this.servicePass.expirationDate)
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
    },

    // === Methods ===
    methods: {
      getPrivateKey() {
        return decryptPrivateKey(this.encryptedPrivateKey);
      },
    },

    // === Query helpers ===
    query: {
      hasUsedBot(hasUsed = true) {
        return this.find({ totalBumps: hasUsed ? { $gt: 0 } : { $lte: 0 } });
      },

      hasBannedBot(hasBanned = true) {
        return this.find({ hasBannedBot: hasBanned ? true : { $ne: true } });
      },
    },

    // === Schema options ===
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: "throw",
  }
);

export const UserModel = model<UserRaw, UserModelType, UserQueryHelpers>(
  "User",
  userSchema
);
