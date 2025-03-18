import { Schema } from "mongoose";
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
import { CryptoService } from "../crypto/crypto.service";
import { toKeypair } from "../solana";
import { validationRules } from "../../shared/validation-rules";
import { PublicKey } from "@solana/web3.js";

/**
 * @improvements Break down the schema into smaller schemas.
 */

export const createUserSchema = (cryptoService: CryptoService) => {
  const userSchema = new Schema<
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
      role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
      },
      paidBumps: { type: Number, default: 0 },
      totalTokenPasses: { type: Number, default: 1 }, // New users get 1 free token pass
      bumpSettings: {
        type: new Schema<BumpSettings>(
          {
            intervalInSeconds: {
              type: Number,
              default: validationRules.bumpSettings.intervalInSeconds.default,
              max: validationRules.bumpSettings.intervalInSeconds.max,
              min: validationRules.bumpSettings.intervalInSeconds.min,
            },
            amountInSol: {
              type: Number,
              default: validationRules.bumpSettings.amountInSol.default,
              max: validationRules.bumpSettings.amountInSol.max,
              min: validationRules.bumpSettings.amountInSol.min,
            },
            limit: {
              type: Number,
              default: validationRules.bumpSettings.limit.default,
              max: validationRules.bumpSettings.limit.max,
              min: validationRules.bumpSettings.limit.min,
            },
            slippage: {
              type: Number,
              default: validationRules.bumpSettings.slippage.default,
              max: validationRules.bumpSettings.slippage.max,
              min: validationRules.bumpSettings.slippage.min,
            },
            priorityFeeInSol: {
              type: Number,
              default: validationRules.bumpSettings.priorityFeeInSol.default,
              max: validationRules.bumpSettings.priorityFeeInSol.max,
              min: validationRules.bumpSettings.priorityFeeInSol.min,
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
          expiresAt: Date,
        },
        { _id: false, timestamps: true } // Nested timestamps are set initially but the updatedAt must be updated manually
      ),
      lastBumpAt: Date,
    },

    {
      // === Virtual fields ===
      virtuals: {
        publicKey: {
          get(): PublicKey {
            /**
             * @note For some reason the methods are not available in the virtuals
             * in order to reuse the this.getPrivateKey(). Typescript keeps complain.
             */
            const privateKey = cryptoService.decryptPrivateKey(
              this.encryptedPrivateKey
            );
            return toKeypair(privateKey).publicKey;
          },
        },
        tokenPassesLeft: {
          get(): number {
            return this.totalTokenPasses - this.usedTokenPasses.size;
          },
        },
        hasServicePass: {
          get(): boolean {
            if (this.servicePass && this.servicePass.createdAt) {
              const expiresAt = this.servicePass.expiresAt
                ? new Date(this.servicePass.expiresAt)
                : null;
              if (expiresAt) {
                if (expiresAt > new Date()) {
                  return true;
                }
              } else {
                return true;
              }
            }
            return false;
          },
        },
        isAdmin: {
          get(): boolean {
            return this.role === "ADMIN";
          },
        },
      },

      // === Methods ===
      methods: {
        getPrivateKey() {
          return cryptoService.decryptPrivateKey(this.encryptedPrivateKey);
        },

        hasPassFor(mint: string): boolean {
          return this.hasServicePass || this.usedTokenPasses.has(mint);
        },
      },

      // === Query helpers ===
      query: {},

      // === Schema options ===
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
      strict: "throw",
    }
  );

  return userSchema;
};
