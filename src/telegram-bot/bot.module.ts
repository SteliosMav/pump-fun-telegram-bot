import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Configuration } from "../shared/config";
import { SettingsModule } from "./settings/settings.module";
import { HomeModule } from "./home/home.module";
import { SessionService } from "./shared/middlewares/session/session.service";
import { SessionModule } from "./shared/middlewares/session/session.module";
import { createValidateContextMiddleware } from "./shared/middlewares/validate-context.middleware";
import { APP_FILTER } from "@nestjs/core";
import { BotExceptionFilter } from "./bot-exception.filter";
import { PricingModule } from "./pricing/pricing.module";
import { InfoModule } from "./info/info.module";
import { AdminModule } from "./admin/admin.module";
import { UserModule } from "../core/user";
import { UserService } from "../core/user/user.service";

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: BotExceptionFilter,
    },
  ],
  imports: [
    // === Configuration ===
    ConfigModule.forRoot(),
    TelegrafModule.forRootAsync({
      imports: [ConfigModule, SessionModule, UserModule],
      inject: [ConfigService, SessionService, UserService],
      useFactory: (
        configService: ConfigService<Configuration, true>,
        sessionService: SessionService,
        userService: UserService
      ) => ({
        token:
          configService.get<Configuration["TELEGRAM_BOT_TOKEN"]>(
            "TELEGRAM_BOT_TOKEN"
          )!,
        middlewares: [
          // === Middlewares ===
          createValidateContextMiddleware(userService),
          sessionService.getMiddleware(),
        ],
      }),
    }),

    // === Features ===
    HomeModule,
    SettingsModule,
    PricingModule,
    InfoModule,
    AdminModule,
  ],
})
export class BotModule {}
