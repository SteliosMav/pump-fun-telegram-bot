import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { BotModule } from "./telegram-bot";
import { DatabaseModule } from "./core/database";
import { SolanaModule } from "./core/solana";
import { PumpFunModule } from "./core/pump-fun";
import { UserModule } from "./core/user";
import { ConfigModule } from "@nestjs/config";
import { validate } from "./shared/config";
import { CryptoModule } from "./core/crypto";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.ENV}`,
      isGlobal: true,
      validate,
    }),
    DatabaseModule,
    BotModule,
    SolanaModule,
    PumpFunModule,
    UserModule,
    CryptoModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
