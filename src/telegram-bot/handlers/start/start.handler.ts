import { Injectable } from "@nestjs/common";
import TelegramBot from "node-telegram-bot-api";
import { Handler } from "../../handler-system/handler.decorator";
import { TelegramHandler } from "../../handler-system/types";

@Handler("/start")
@Injectable()
export class StartHandler implements TelegramHandler {
  async handle(ctx: TelegramBot.Message): Promise<void> {
    console.log(`Handling /start for chat: ${ctx.chat.id}`);
    // Reply to the user
  }
}
