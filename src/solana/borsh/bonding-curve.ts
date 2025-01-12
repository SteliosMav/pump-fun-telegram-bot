import { field } from "@dao-xyz/borsh";

export class BondingCurveAccount {
  @field({ type: "u64" })
  discriminator: bigint = BigInt(0);

  @field({ type: "u64" })
  virtualTokenReserves: bigint = BigInt(0);

  @field({ type: "u64" })
  virtualSolReserves: bigint = BigInt(0);

  @field({ type: "u64" })
  realTokenReserves: bigint = BigInt(0);

  @field({ type: "u64" })
  realSolReserves: bigint = BigInt(0);

  @field({ type: "u64" })
  tokenTotalSupply: bigint = BigInt(0);

  @field({ type: "u8" })
  complete: number = 0;

  constructor(data: BondingCurveAccount) {
    Object.assign(this, data);
  }
}
