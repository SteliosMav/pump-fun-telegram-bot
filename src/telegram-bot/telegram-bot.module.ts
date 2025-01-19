import { Module } from "@nestjs/common";
import { TelegramBotService } from "./telegram-bot.service";
import { HandlerModule } from "./handlers/handler.module";

@Module({
  providers: [TelegramBotService],
  imports: [HandlerModule],
  exports: [TelegramBotService],
})
export class TelegramBotModule {}
