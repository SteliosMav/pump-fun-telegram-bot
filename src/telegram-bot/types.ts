import TelegramBot from "node-telegram-bot-api";

export type CallbackData =
  | "get_balance"
  | "get_coin_data"
  | "buy_token"
  | "sell_token";
export interface BasicHandlerArguments {
  bot: TelegramBot;
  msg: TelegramBot.Message;
}
