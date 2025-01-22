import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Configuration } from "../shared/config";
import { SettingsModule } from "./settings/settings.module";
import { StartModule } from "./start/start.module";
import { SessionService } from "./shared/middlewares/session/session.service";
import { SessionModule } from "./shared/middlewares/session/session.module";
import { validateContextMiddleware } from "./shared/middlewares/validate-context.middleware";

@Module({
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule, SessionModule],
      inject: [ConfigService, SessionService],
      useFactory: (
        configService: ConfigService<Configuration>,
        sessionService: SessionService
      ) => ({
        token: configService.get("TELEGRAM_BOT_TOKEN")!,
        middlewares: [
          validateContextMiddleware,
          sessionService.getMiddleware(),
        ],
      }),
    }),
    StartModule,
    SettingsModule,
  ],
})
export class BotModule {}
