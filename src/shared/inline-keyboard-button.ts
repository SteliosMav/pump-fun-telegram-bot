import { InlineKeyboardButton } from "node-telegram-bot-api";
import { CallbackType } from "src/telegram-bot/types";

export const refreshBalanceBtn: InlineKeyboardButton = {
  text: `🔄  Refresh Balance`,
  callback_data: CallbackType.REFRESH_BALANCE,
};

export function getSettingsBtn(
  callbackType: CallbackType
): InlineKeyboardButton {
  return {
    text: `⬅️  Back`,
    callback_data: CallbackType.GO_TO_START,
  };
}
