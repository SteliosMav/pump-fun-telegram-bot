import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";

export function keyPairFromEncodedPrivateKey(privateKey: string): Keypair {
  // If this doesn't work do this instead: return Keypair.fromSecretKey(new Uint8Array(bs58.decode(privateKey)));
  return Keypair.fromSecretKey(bs58.decode(privateKey));
}
