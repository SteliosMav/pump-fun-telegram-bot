import { Module } from "@nestjs/common";
import { SolanaService } from "./solana.service";
import { SolanaRpcService } from "./solana-rpc.service";
import { HELIUS_API_STANDARD, QUICKNODE_API } from "./config";

@Module({
  providers: [
    {
      provide: "RPC_PROVIDER",
      useValue: "rotate",
    },
    {
      provide: "RPC_PROVIDERS",
      useValue: [QUICKNODE_API, HELIUS_API_STANDARD],
    },
    SolanaService,
    SolanaRpcService,
  ],
  exports: [SolanaService, SolanaRpcService],
})
export class SolanaModule {}
