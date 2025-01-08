import { keyPairFromEncodedPrivateKey } from "./solana-utils";

// === Solana Private Keys ===
const BOT_PRIVATE_KEY = process.env.BOT_PRIVATE_KEY as string;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY as string;

// === Solana Keypairs ===
export const BOT_KEYPAIR = keyPairFromEncodedPrivateKey(BOT_PRIVATE_KEY);
export const ADMIN_KEYPAIR = keyPairFromEncodedPrivateKey(ADMIN_PRIVATE_KEY);

// === Solana APIs ===
export const HELIUS_API_STANDARD = process.env.HELIUS_API_STANDARD as string;
