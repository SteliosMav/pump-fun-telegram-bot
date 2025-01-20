import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BotUpdate } from "./bot.update";
import { SlippageModule } from "./slippage/slippage.module";
import { session } from "telegraf";
import { Configuration } from "../shared/config";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration>) => ({
        token: configService.get("TELEGRAM_BOT_TOKEN")!,
        middlewares: [session()],
      }),
    }),
    SlippageModule,
  ],
  providers: [BotUpdate],
})
export class BotModule {}
