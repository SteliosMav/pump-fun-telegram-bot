import { Module } from "@nestjs/common";
import { SessionService } from "./session.service";
import { UserModule } from "../../../../core/user";
import { SolanaModule } from "../../../../core/solana";
import { CryptoModule } from "../../../../core/crypto";
import { PumpFunModule } from "../../../../core/pump-fun";
import { LoggerModule } from "../../../../core/logger/logger.module";

@Module({
  providers: [SessionService],
  imports: [
    UserModule,
    SolanaModule,
    CryptoModule,
    PumpFunModule,
    LoggerModule,
  ],
  exports: [SessionService],
})
export class SessionModule {}
