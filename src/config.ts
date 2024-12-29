import { BumpSettings } from "./users/types";

// === Environment ===
export const ENV: "production" | "development" = "development";

// === Bot ===
export const BOT_IMAGE =
  "https://pump.mypinata.cloud/ipfs/QmRSbGEC7Ezikm4WXm45DuTsmoLYbYXNkZRvHfyC9KEnv7";
// Bot description must be maximum 250 characters
export const BOT_DESCRIPTION = `🎁FREE token-pass for new users! 🌐 Add "ez" in front of "pump.fun" | Telegram: "ez_" and "pump_" and "bot". The most reliable, cheap and easy to use!`;
export const BOT_SERVICE_FEE = 0.00019;
export const BOT_TOKEN_PASS_PRICE = 0.07;
export const MAX_BUMPS_LIMIT = 250;
export const DEFAULT_SETTINGS: BumpSettings = {
  bumpsCounter: 0,
  tokenPassesTotal: 1,
  tokenPassesUsed: 0,
  bumpAmount: 0.0123, // 0.012 is the minimum amount to be shown in pump.fun history
  bumpsLimit: 10,
  priorityFee: 0.0001,
  bumpIntervalInSeconds: 10,
  slippage: 0.02,
};
