import { PublicKey } from "@solana/web3.js";

// === Bot ===
export const BOT_WEBSITE_URL = "https://www.ezpump.fun";
export const USER_FRIENDLY_ERROR_MESSAGE =
  "We are currently unavailable due to high demand. Please try again later.";
export const BOT_ACCOUNT = new PublicKey(
  "3FaWUTrfj8T3YonTZFK3ZGgu84J8oTUGxPhEYC2r2a9D"
);
export const BOT_SUPPORT_USERNAME = "ezpumpsupport";

// === Pump.fun ===
export const PUMP_FUN_URL = "https://pump.fun";

// === Solana ===
export const SIGNATURE_FEE = 5000;

// === JITO ===
export const MIN_VALIDATOR_TIP_IN_SOL = 0.00001; // 1,000 lamports

// === Config ===
export const BOT_IMAGE =
  "https://pump.mypinata.cloud/ipfs/QmRSbGEC7Ezikm4WXm45DuTsmoLYbYXNkZRvHfyC9KEnv7";
// Bot description must be maximum 250 characters
export const BOT_DESCRIPTION = `🎁FREE token-pass for new users! 🌐 Add "ez" in front of "pump.fun" | Telegram: "ez_" and "pump_" and "bot". The most reliable, cheap and easy to use!`;
export const BOT_SERVICE_FEE_IN_SOL = 0.00019;
export const BOT_TOKEN_PASS_PRICE_IN_SOL = 0.048;
export const BOT_SERVICE_PASS_PRICE_IN_SOL = 0.48;
