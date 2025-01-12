import { field } from "@dao-xyz/borsh";

export class InstructionSchema {
  @field({ type: "u64" })
  operation!: bigint;

  @field({ type: "u64" })
  tokens!: bigint;

  @field({ type: "u64" })
  lamports!: bigint;

  constructor(data: InstructionSchema) {
    Object.assign(this, data);
  }
}
