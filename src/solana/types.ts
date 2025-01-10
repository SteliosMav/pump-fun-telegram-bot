import { Keypair, PublicKey } from "@solana/web3.js";
import { BumpSettings } from "../user";

export interface BumpOptions
  extends Pick<BumpSettings, "amount" | "slippage" | "priorityFee"> {
  mint: PublicKey;
  payer: Keypair;
  includeBotFee: boolean;
  associatedTokenAccount?: PublicKey;
}

export interface SwapInstructionOptions {
  mint: PublicKey;
  lamports: number;
  slippage: number;
  ownerAccount: PublicKey;
  associatedTokenAccount: PublicKey;
  liquidityPool: LiquidityPool;
}

export interface LiquidityPool {
  virtualTokenReserves: number;
  virtualSolReserves: number;
  bondingCurveAccount: PublicKey;
  associatedBondingCurveAccount: PublicKey;
}
