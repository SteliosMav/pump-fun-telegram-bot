import { PublicKey, SystemProgram } from "@solana/web3.js";
import { ENV } from "./config";

// === Environment Variables ===
export const BOT_ACCOUNT_PRIVATE_KEY = process.env
  .BOT_ACCOUNT_PRIVATE_KEY as string;
export const ADMIN_ACCOUNT_PRIVATE_KEY = process.env
  .ADMIN_ACCOUNT_PRIVATE_KEY as string;
export const HELIUS_API_STANDARD = process.env.HELIUS_API_STANDARD as string; // process.env.QUICK_NODE_API as string;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
export const MONGO_URI = (
  ENV === "production" ? process.env.MONGO_URI_PROD : process.env.MONGO_URI_DEV
) as string;
export const PERSONAL_TG_ID = +(process.env.PERSONAL_TG_ID as string) as number;

// === Pump.fun ===
export const PUMP_FUN_PROGRAM = new PublicKey(
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
);
export const PUMP_FUN_ACCOUNT = new PublicKey(
  "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"
);
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
export const PUMP_FUN_URL = "https://pump.fun";

// === JITO ===
export const MIN_VALIDATOR_TIP_IN_SOL = 0.00001; // 1,000 lamports

// === Bot ===
export const TELEGRAM_BOT_TOKEN = (
  ENV === "production"
    ? process.env.TELEGRAM_BOT_TOKEN_PROD
    : process.env.TELEGRAM_BOT_TOKEN_DEV
) as string;
export const BOT_WEBSITE_URL = "https://www.ezpump.fun";
export const USER_FRIENDLY_ERROR_MESSAGE =
  "We are currently unavailable due to high demand. Please try again later.";
