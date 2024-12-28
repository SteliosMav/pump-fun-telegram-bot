import { PublicKey, SystemProgram } from "@solana/web3.js";
import { toSolDecimals } from "./solana/utils";
import { ENV } from "./config";

// Environment variables
export const BOT_ACCOUNT_PRIVATE_KEY = process.env
  .BOT_ACCOUNT_PRIVATE_KEY as string;
export const ADMIN_ACCOUNT_PRIVATE_KEY = process.env
  .ADMIN_ACCOUNT_PRIVATE_KEY as string;
export const HELIUS_API_STANDARD = process.env.HELIUS_API_STANDARD as string; // process.env.QUICK_NODE_API as string;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
export const MONGO_URI = (
  ENV === "production" ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_DEV
) as string;
export const TEST_USER_TG_ID = +(process.env
  .PERSONAL_TG_ID as string) as number;

// Bot info
export const WEBSITE_URL = "https://www.ezpump.fun";
export const BOT_NAME = "EzPump";
export const BOT_SERVICE_FEE = toSolDecimals(0.00019);
export const BOT_TOKEN_PASS_PRICE = toSolDecimals(0.07);
export const BOT_USERNAME_BASE = "EzPump"; // The whole username must be max 10 characters
export const BOT_IMAGE_GIF =
  // "https://plum-near-goat-819.mypinata.cloud/ipfs/bafkreiflsmxwkmr66yv2euvnb4xkwp6jjafbqvj2woy35efs35dzlbyhnm";
  // "https://plum-near-goat-819.mypinata.cloud/ipfs/QmRSbGEC7Ezikm4WXm45DuTsmoLYbYXNkZRvHfyC9KEnv7";
  "https://pump.mypinata.cloud/ipfs/QmRSbGEC7Ezikm4WXm45DuTsmoLYbYXNkZRvHfyC9KEnv7?img-width=64&img-dpr=2&img-onerror=redirect";
// bot description must be maximum 250 characters
export const BOT_DESCRIPTION = `🎁FREE token-pass for new users! 🌐 Add "ez" in front of "pump.fun" | Telegram: "ez_" and "pump_" and "bot". The most reliable, cheap and easy to use!`;
export const MIN_USER_BALANCE_SAFE_NET = 0.001; // Used as a safe net for users to always have a small SOL amount in their wallets

// Pump.fun
export const PUMP_FUN_PROGRAM = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
);
export const PUMP_FUN_ACCOUNT = new PublicKey(
  "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"
);
export const PUMP_FUN_URL = "https://pump.fun";
export const PUMP_FUN_API = "https://frontend-api.pump.fun";

// Solana
export const GLOBAL = new PublicKey(
  "4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf"
);
export const FEE_RECIPIENT = new PublicKey(
  "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM"
);
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
export const ASSOC_TOKEN_ACC_PROG = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);
export const RENT = new PublicKey(
  "SysvarRent111111111111111111111111111111111"
);
export const PUMP_FUN_SWAP_FEE_PERCENT = 0.01;
export const ASSOCIATED_TOKEN_ACC_SIZE = 165;
export const SIGNATURE_FEE_LAMPORTS = 5000;
export const SYSTEM_PROGRAM_ID = SystemProgram.programId;
export const MIN_BUMP_AMOUNT = 0.0123;
export const MAX_BUMP_AMOUNT = 1;
export const MAX_BUMPS_LIMIT = 250;

// Jito
export const MIN_VALIDATOR_TIP_IN_SOL = 0.00001; // 1,000 lamports

// Telegram bot
export const TELEGRAM_BOT_TOKEN = (
  ENV === "production"
    ? process.env.TELEGRAM_BOT_TOKEN_PROD
    : process.env.TELEGRAM_BOT_TOKEN_DEV
) as string;
