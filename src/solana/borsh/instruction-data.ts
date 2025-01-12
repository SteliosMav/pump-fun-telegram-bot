import { field } from "@dao-xyz/borsh";
import { PumpFunOperationIDs } from "../types";

export class InstructionData {
  @field({ type: "u64" })
  operation: bigint;

  @field({ type: "u64" })
  tokens: bigint;

  @field({ type: "u64" })
  lamports: bigint;

  constructor(properties: {
    operation: PumpFunOperationIDs[keyof PumpFunOperationIDs];
    tokens: number;
    lamports: number;
  }) {
    this.operation = BigInt(properties.operation);
    this.tokens = BigInt(properties.tokens);
    this.lamports = BigInt(properties.lamports);
  }
}
