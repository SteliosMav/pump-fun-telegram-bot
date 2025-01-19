import { Module } from "@nestjs/common";
import { SolanaService } from "./solana.service";
import { SolanaRpcService } from "./solana-rpc.service";

@Module({
  providers: [SolanaService, SolanaRpcService],
  exports: [SolanaService, SolanaRpcService],
})
export class SolanaModule {}
