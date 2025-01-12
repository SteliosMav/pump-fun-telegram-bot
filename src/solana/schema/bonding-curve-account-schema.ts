import { field } from "@dao-xyz/borsh";

export class BondingCurveAccountSchema {
  @field({ type: "u64" })
  discriminator!: bigint;

  @field({ type: "u64" })
  virtualTokenReserves!: bigint;

  @field({ type: "u64" })
  virtualSolReserves!: bigint;

  @field({ type: "u64" })
  realTokenReserves!: bigint;

  @field({ type: "u64" })
  realSolReserves!: bigint;

  @field({ type: "u64" })
  tokenTotalSupply!: bigint;

  @field({ type: "u8" })
  complete!: number;

  constructor(data: BondingCurveAccountSchema) {
    Object.assign(this, data);
  }
}
