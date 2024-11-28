import { Keypair, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export function pubKeyByPrivKey(privateKey: string | Uint8Array): string {
  // Convert the private key if it is in base58 format
  const secretKey =
    typeof privateKey === "string" ? bs58.decode(privateKey) : privateKey;

  // Generate the Keypair from the secret key
  const keypair = Keypair.fromSecretKey(secretKey);

  // Return the public key as a base58 encoded string
  return keypair.publicKey.toBase58();
}

/**
 * Rounds a value to SOL's decimal precision and ensures it's a valid number.
 * @param value - The value to round.
 * @returns The rounded value.
 */
export function toSolDecimals(value: number): number {
  const decimals: number = 9;
  if (isNaN(value)) {
    throw new Error("Invalid number: value is not a number");
  }
  if (!Number.isFinite(value)) {
    throw new Error("Invalid number: value is not finite");
  }

  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
