import { Module } from "@nestjs/common";
import { UserModule } from "../src/core/user";
import { LoggerModule } from "../src/core/logger/logger.module";
import { ConfigModule } from "@nestjs/config";
import { validate } from "../src/shared/config";
import { DatabaseModule } from "../src/core/database";
import { SolanaModule } from "../src/core/solana";
import { PumpFunModule } from "../src/core/pump-fun";
import { CryptoModule } from "../src/core/crypto";

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV}`,
      isGlobal: true,
      validate,
    }),
    DatabaseModule,
    SolanaModule,
    PumpFunModule,
    UserModule,
    CryptoModule,
  ], // Only import modules needed for scripts
})
export class ScriptModule {}
