import TelegramBot from "node-telegram-bot-api";
import { User } from "src/users/types";
import { CallbackType } from "./types";

export function getStartingInlineKeyboard(
  user: User
): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: `💰 ${user.bumpAmount} Amount`,
          callback_data: CallbackType.SET_AMOUNT,
        },
        {
          text: `🕑 ${user.bumpIntervalInSeconds}s Frequency`,
          callback_data: CallbackType.SET_INTERVAL,
        },
        {
          text: `🔥 Start Bumping`,
          callback_data: CallbackType.START_BUMPING,
        },
      ],
    ],
  };
}
