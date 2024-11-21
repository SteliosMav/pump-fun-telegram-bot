import { PublicKey, SystemProgram } from "@solana/web3.js";

// Environment variables
export const SOLANA_BOT_PRIVATE_KEY = process.env
  .SOLANA_PRIVATE_KEY_1 as string;
export const SOLANA_PAYER_PRIVATE_KEY = process.env
  .SOLANA_PRIVATE_KEY_2 as string;
export const BOT_SERVICE_FEE = +(process.env.BOT_SERVICE_FEE as string);
export const RPC_API = process.env.HELIUS_API as string; // process.env.QUICK_NODE_API as string;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY as string;
export const MONGO_URI = process.env.MONGO_URI as string;

// Bot info
export const WEBSITE_URL = "https://www.ezpump.fun";
export const BOT_NAME = "EzPump";
export const BOT_USERNAME_BASE = "EzPump"; // The whole username must be max 10 characters
export const BOT_IMAGE_GIF =
  "https://plum-near-goat-819.mypinata.cloud/ipfs/QmRSbGEC7Ezikm4WXm45DuTsmoLYbYXNkZRvHfyC9KEnv7";
// bot description must be maximum 250 characters
export const BOT_DESCRIPTION = `🔥 Boost your token with ${BOT_NAME} - https://ezpump.fun ! 🔥 The simplest, cheapest pump bot for Pump.Fun - just ${BOT_SERVICE_FEE} SOL service fee. Fast, reliable, and hassle-free visibility with every click!`;

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

// Telegram bot
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
