import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

/**
 * @description These utils are the only ones that should be used
 * to interact with the Solana module along with the SolanaService.
 * They are responsible for converting keys to the correct format
 * that solana module expects.
 */

export function toKeypair(privateKey: string): Keypair {
  return Keypair.fromSecretKey(bs58.decode(privateKey));
}

export const toPublicKey = (key: string): PublicKey => {
  return new PublicKey(key);
};
