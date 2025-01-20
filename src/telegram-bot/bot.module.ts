import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { StartUpdate } from "./start/start.update";
import { session } from "telegraf";
import { Configuration } from "../shared/config";
import { SettingsModule } from "./settings/settings.module";
import { StartModule } from "./start/start.module";

/**
 * @WARNING need to implement custom logic that will clean sessions periodically
 * if they have not been updated any time soon.
 */

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
    StartModule,
    SettingsModule,
  ],
})
export class BotModule {}
