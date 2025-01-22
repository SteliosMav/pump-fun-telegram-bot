import { Module } from "@nestjs/common";
import { SolanaService } from "./solana.service";
import { SolanaRpcService } from "./solana-rpc.service";
import { CryptoModule } from "../crypto";

@Module({
  providers: [SolanaService, SolanaRpcService],
  imports: [CryptoModule],
  exports: [SolanaService, SolanaRpcService],
})
export class SolanaModule {}
