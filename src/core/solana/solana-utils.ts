import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

export function keyPairFromEncodedPrivateKey(privateKey: string): Keypair {
  return Keypair.fromSecretKey(bs58.decode(privateKey));
}

export function getPublicKeyStringFromEncodedPrivateKey(
  privateKey: string
): string {
  return keyPairFromEncodedPrivateKey(privateKey).publicKey.toString();
}
