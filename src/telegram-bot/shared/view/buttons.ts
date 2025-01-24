import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { HomeCallbackType } from "../../home/constants";
import { SharedCallbackType } from "../constants";

export const refreshBalanceBtn: () => InlineKeyboardButton = () => ({
  text: `🔄  Refresh Balance`,
  callback_data: HomeCallbackType.REFRESH_BALANCE,
});

export const backBtn: () => InlineKeyboardButton = () => ({
  text: `⬅️  Back`,
  callback_data: SharedCallbackType.HOME,
});
