import TelegramBot from "node-telegram-bot-api";

export enum CallbackType {
  SET_AMOUNT = "set_amount",
  SET_INTERVAL = "set_interval",
  SET_SLIPPAGE = "set_slippage",
  SET_PRIORITY_FEE = "set_priority_fee",
  REFRESH_BALANCE = "refresh_balance",
  START_BUMPING = "start_bumping",
  DISMISS_ERROR = "dismiss_error",
}
interface BasicCtrlArgs {
  bot: TelegramBot;
  errMsg?: string;
}
export interface CBQueryCtrlArgs extends BasicCtrlArgs {
  callbackQuery: TelegramBot.CallbackQuery;
}
export interface MsgCtrlArgs extends BasicCtrlArgs {
  message: TelegramBot.Message;
}
export type CtrlArgs = CBQueryCtrlArgs | MsgCtrlArgs;
export interface CBQueryCtrlMap {
  [key: string]: (args: CBQueryCtrlArgs) => Promise<void>;
}
