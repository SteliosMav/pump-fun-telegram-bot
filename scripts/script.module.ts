import { Module } from "@nestjs/common";
import { UserModule } from "../src/core/user";
import { LoggerModule } from "../src/core/logger/logger.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Configuration, validate } from "../src/shared/config";
import { DatabaseModule } from "../src/core/database";
import { SolanaModule } from "../src/core/solana";
import { PumpFunModule } from "../src/core/pump-fun";
import { CryptoModule } from "../src/core/crypto";
import { BotV2ReleaseViewService } from "./tasks/send-news-letter/views/bot-v2-release.view";
import { Telegraf } from "telegraf";
import { BroadcastService } from "./tasks/send-news-letter/broad-cast.service";
import { MigrationViewService } from "./tasks/send-news-letter/views/migration.view";

@Module({
  providers: [
    // News letter dependencies
    BroadcastService,
    {
      provide: "TELEGRAM_BOT",
      useFactory: (configService: ConfigService) => {
        const botToken =
          configService.get<Configuration["TELEGRAM_BOT_TOKEN"]>(
            "TELEGRAM_BOT_TOKEN"
          )!;
        return new Telegraf(botToken);
      },
      inject: [ConfigService],
    },
    BotV2ReleaseViewService,
    MigrationViewService,
  ],
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
