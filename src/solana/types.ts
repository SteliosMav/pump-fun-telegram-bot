import { Keypair, PublicKey } from "@solana/web3.js";
import { BumpSettings } from "../user";

export interface BumpParams
  extends Pick<BumpSettings, "amount" | "slippage" | "priorityFee"> {
  mint: PublicKey;
  payer: Keypair;
  associatedTokenAccount: PublicKey;
  createAssociatedTokenAccount: boolean;
  includeBotFee: boolean;
}

export interface OperationInstructionParams {
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

export interface PumpFunOperationIDs {
  BUY: "16927863322537952870";
  SELL: "12502976635542562355";
}
