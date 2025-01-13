import { struct, nu64 } from "@solana/buffer-layout";

export const InstructionLayout = struct<{
  operation: number;
  tokens: number;
  lamports: number;
}>([nu64("operation"), nu64("tokens"), nu64("lamports")]);
