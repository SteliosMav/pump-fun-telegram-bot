import { Keypair, PublicKey } from "@solana/web3.js";
import { BumpSettings } from "../user/types";

export interface BumpParams {
  mint: PublicKey;
  payer: Keypair;
  associatedTokenAccount: PublicKey;
  createAssociatedTokenAccount: boolean;
  amount: number;
  slippage: number;
  priorityFee: number;
  includeBotFee: boolean;
}

export interface OperationInstructionParams {
  mint: PublicKey;
  lamports: number;
  slippage: number;
  ownerAccount: PublicKey;
  associatedTokenAccount: PublicKey;
  bondingCurve: BondingCurve;
}

export interface BondingCurve {
  virtualTokenReserves: number;
  virtualSolReserves: number;
  account: PublicKey;
  associatedAccount: PublicKey;
}

export interface PumpFunOperationIDs {
  // Too big to be number type. A string that's later converted to BigInt is preferable.
  BUY: "16927863322537952870";
  SELL: "12502976635542562355";
}

export type TransferParams = {
  lamports: number;
  from: Keypair;
  to: PublicKey;
  validatorTip: number;
};
