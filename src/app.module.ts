import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { TelegramBotModule } from "./telegram-bot";
import { DatabaseModule } from "./core/database";
import { SolanaModule } from "./core/solana";
import { PumpFunModule } from "./core/pump-fun";
import { UserModule } from "./core/user";
import { ConfigModule } from "@nestjs/config";
import * as Joi from "joi";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigModule available globally
      load: [configuration], // Custom configuration function
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        MONGO_URI: Joi.string().required(),
        ENV: Joi.string()
          .valid("development", "production")
          .default("development"),
        QUICKNODE_API: Joi.string().optional(),
        HELIUS_API_STANDARD: Joi.string().optional(),
      }),
    }),
    DatabaseModule,
    TelegramBotModule,
    SolanaModule,
    PumpFunModule,
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
