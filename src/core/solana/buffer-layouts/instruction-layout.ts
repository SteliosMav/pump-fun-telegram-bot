import { struct } from "@solana/buffer-layout";
import { u64 } from "@solana/buffer-layout-utils";

export const InstructionLayout = struct<{
  operation: bigint;
  tokens: bigint;
  lamports: bigint;
}>([u64("operation"), u64("tokens"), u64("lamports")]);
