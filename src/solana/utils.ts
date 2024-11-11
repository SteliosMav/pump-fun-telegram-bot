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
