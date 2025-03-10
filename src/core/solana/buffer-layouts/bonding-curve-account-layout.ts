import { struct, u8 } from "@solana/buffer-layout";
import { u64 } from "@solana/buffer-layout-utils";

export const BondingCurveAccountLayout = struct<{
  discriminator: bigint;
  virtualTokenReserves: bigint;
  virtualSolReserves: bigint;
  realTokenReserves: bigint;
  realSolReserves: bigint;
  tokenTotalSupply: bigint;
  complete: number;
}>([
  u64("discriminator"),
  u64("virtualTokenReserves"),
  u64("virtualSolReserves"),
  u64("realTokenReserves"),
  u64("realSolReserves"),
  u64("tokenTotalSupply"),
  u8("complete"),
]);
