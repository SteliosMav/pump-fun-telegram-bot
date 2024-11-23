import TelegramBot from "node-telegram-bot-api";
import { CtrlArgs } from "./types";
import { USER_FRIENDLY_ERROR_MESSAGE } from "../config";

export function catchErrors(bot: TelegramBot, handler: Function) {
  return async function (args: any) {
    try {
      await handler(args);
    } catch (error) {
      console.error("Unexpected error:", error);

      // Send a user-friendly error message
      const chatId = "chat" in args ? args.chat.id : args.message?.chat.id;

      if (chatId) {
        bot.sendMessage(chatId, USER_FRIENDLY_ERROR_MESSAGE);
      }
    }
  };
}
