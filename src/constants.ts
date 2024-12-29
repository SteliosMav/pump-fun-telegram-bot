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
export const TELEGRAM_BOT_TOKEN = (
  ENV === "production"
    ? process.env.TELEGRAM_BOT_TOKEN_PROD
    : process.env.TELEGRAM_BOT_TOKEN_DEV
) as string;

// === Bot ===
export const BOT_WEBSITE_URL = "https://www.ezpump.fun";
export const USER_FRIENDLY_ERROR_MESSAGE =
  "We are currently unavailable due to high demand. Please try again later.";

// === Pump.fun ===
export const PUMP_FUN_URL = "https://pump.fun";

// === Solana ===
export const SIGNATURE_FEE_LAMPORTS = 5000;

// === JITO ===
export const MIN_VALIDATOR_TIP_IN_SOL = 0.00001; // 1,000 lamports
