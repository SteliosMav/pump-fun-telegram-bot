import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
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

export const toLamports = (sol: number): number => {
  return sol * LAMPORTS_PER_SOL;
};

export const toSol = (lamports: number): number => {
  return Number((lamports / LAMPORTS_PER_SOL).toFixed(9));
};

/**
 * Accepts a possible solana address string and returns weather it's valid format or not
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    const publicKey = new PublicKey(address);
    return PublicKey.isOnCurve(publicKey.toBytes());
  } catch (err) {
    return false;
  }
}

export function isValidPrivateKey(key: string): boolean {
  try {
    const keyPair = toKeypair(key);
    return isValidSolanaAddress(keyPair.publicKey.toString());
  } catch (err) {
    return false;
  }
}
