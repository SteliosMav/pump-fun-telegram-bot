import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { Configuration } from "../shared/config";
import { SettingsModule } from "./settings/settings.module";
import { StartModule } from "./start/start.module";
import { sessionMiddleware } from "./shared/middlewares/session.middleware";

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
        middlewares: [
          sessionMiddleware,
          // Test session middleware
          (ctx, next) => {
            console.log("Session:", ctx.session);
            return next();
          },
        ],
      }),
    }),
    StartModule,
    SettingsModule,
  ],
})
export class BotModule {}
