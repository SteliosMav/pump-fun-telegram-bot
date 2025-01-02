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
  UserQueries,
  UserStatics,
  UserVirtuals,
  TokenPass,
  BumpSettings,
  ServicePass,
} from "./types";

export const userSchema = new Schema<
  UserRaw,
  UserModelType,
  UserMethods,
  UserQueries,
  UserVirtuals,
  UserStatics
>(
  {
    // Required fields
    telegramId: { type: Number, required: true },
    encryptedPrivateKey: { type: String, required: true },
    firstName: { type: String, required: true },
    isBot: { type: Boolean, required: true },

    // Default fields
    bumpsCounter: { type: Number, default: 0 },
    tokenPassesTotal: { type: Number, default: 1 }, // New users get 1 free token pass
    tokenPassesUsed: { type: Number, default: 0 },
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
      default: {
        bumpIntervalInSeconds: 10,
        bumpAmount: 0.0123,
        bumpsLimit: 10,
        slippage: 0.02,
        priorityFee: 0.0001,
      },
    },
    pumpFunAccIsSet: { type: Boolean, required: true, default: false },
    tokenPass: {
      type: Map,
      of: new Schema<TokenPass>(
        {
          createdAt: { type: String, required: true },
          expirationDate: String,
        },
        { _id: false }
      ),
      default: new Map(),
    },

    // Optional fields
    serviceFeePass: new Schema<ServicePass>(
      {
        createdAt: { type: String, required: true },
        expirationDate: String,
      },
      { _id: false }
    ),
    lastName: String,
    username: String,
    lastBumpAt: String,
    hasBannedBot: Boolean,
  },

  {
    // Virtual fields
    virtuals: {
      privateKey: {
        get() {
          return decryptPrivateKey(this.encryptedPrivateKey);
        },
      },
      hasServicePass: {
        get(): boolean {
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
      },
    },

    // Methods
    methods: {
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

    // Query helpers
    query: {
      hasUsedBot(hasUsed = true) {
        if (hasUsed) {
          return this.find({ bumpsCounter: { $gt: 0 } });
        } else {
          return this.find({ bumpsCounter: { $lte: 0 } });
        }
      },
      hasBannedBot(hasBanned = true) {
        return this.find({ hasBannedBot: hasBanned });
      },
    },

    // Schema options
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export const UserModel = model<UserRaw, UserModelType>("User", userSchema);
