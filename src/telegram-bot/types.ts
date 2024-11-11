import TelegramBot from "node-telegram-bot-api";

export enum CallbackType {
  SET_AMOUNT = "set_amount",
  SET_INTERVAL = "set_interval",
  SET_SLIPPAGE = "set_slippage",
  START_BUMPING = "start_bumping",
}
export interface BasicHandlerArguments {
  bot: TelegramBot;
  msg: TelegramBot.Message;
}
