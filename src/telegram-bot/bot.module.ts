import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Configuration } from "../shared/config";
import { SettingsModule } from "./settings/settings.module";
import { HomeModule } from "./home/home.module";
import { SessionService } from "./shared/middlewares/session/session.service";
import { SessionModule } from "./shared/middlewares/session/session.module";
import { validateContextMiddleware } from "./shared/middlewares/validate-context.middleware";
import { APP_FILTER } from "@nestjs/core";
import { BotExceptionFilter } from "./bot-exception.filter";
import { PricingModule } from "./pricing/pricing.module";

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: BotExceptionFilter,
    },
  ],
  imports: [
    ConfigModule.forRoot(),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule, SessionModule],
      inject: [ConfigService, SessionService],
      useFactory: (
        configService: ConfigService<Configuration, true>,
        sessionService: SessionService
      ) => ({
        token:
          configService.get<Configuration["TELEGRAM_BOT_TOKEN"]>(
            "TELEGRAM_BOT_TOKEN"
          )!,
        middlewares: [
          validateContextMiddleware,
          sessionService.getMiddleware(),
        ],
      }),
    }),
    HomeModule,
    SettingsModule,
    PricingModule,
  ],
})
export class BotModule {}
