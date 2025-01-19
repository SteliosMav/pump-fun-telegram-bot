import TelegramBot from "node-telegram-bot-api";

export interface TelegramHandler {
  handle(ctx: TelegramBot.Message): Promise<void>;
}
