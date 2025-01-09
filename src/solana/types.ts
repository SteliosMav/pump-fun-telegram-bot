import { Keypair, PublicKey } from "@solana/web3.js";
import { BumpSettings } from "../user";

export interface BumpOptions
  extends Pick<BumpSettings, "amount" | "slippage" | "priorityFee"> {
  mint: PublicKey;
  payer: Keypair;
  includeBotFee: boolean;
}
