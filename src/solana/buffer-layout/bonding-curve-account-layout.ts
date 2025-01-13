import { struct, nu64, u8 } from "@solana/buffer-layout";

export const BondingCurveAccountLayout = struct<{
  discriminator: number;
  virtualTokenReserves: number;
  virtualSolReserves: number;
  realTokenReserves: number;
  realSolReserves: number;
  tokenTotalSupply: number;
  complete: number;
}>([
  nu64("discriminator"),
  nu64("virtualTokenReserves"),
  nu64("virtualSolReserves"),
  nu64("realTokenReserves"),
  nu64("realSolReserves"),
  nu64("tokenTotalSupply"),
  u8("complete"),
]);
