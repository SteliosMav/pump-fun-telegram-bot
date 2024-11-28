import TelegramBot from "node-telegram-bot-api";

export interface UserState {
  lastCallback?: CallbackType | null;
  stopBumping: boolean;
  isBumping: boolean;
  createdAt: string; // Date iso
}
export type UserMap = Map<number, UserState>;
export enum CallbackType {
  SET_AMOUNT = "set_amount",
  SET_INTERVAL = "set_interval",
  SET_SLIPPAGE = "set_slippage",
  SET_PRIORITY_FEE = "set_priority_fee",
  REFRESH_BALANCE = "refresh_balance",
  SET_BUMPS_LIMIT = "set_bumps_limit",
  START_BUMPING = "start_bumping",
  STOP_BUMPING = "stop_bumping",
  DISMISS_ERROR = "dismiss_error",
  SET_TOKEN = "set_token",
  GO_TO_SETTINGS = "go_to_settings",
  GO_TO_START = "go_to_start",
  GO_TO_TOKEN_PASS = "go_to_token_pass",
  BUY_TOKEN_PASS = "buy_token_pass",
  USE_TOKEN_PASS = "use_token_pass",
}
interface BasicCtrlArgs {
  bot: TelegramBot;
  errMsg?: string;
  getUserState: () => UserState | undefined;
  setUserState: (userState: UserState) => void;
}
export interface CBQueryCtrlArgs extends BasicCtrlArgs {
  callbackQuery: TelegramBot.CallbackQuery;
}
export interface MsgCtrlArgs extends BasicCtrlArgs {
  message: TelegramBot.Message;
}
export type CtrlArgs = CBQueryCtrlArgs | MsgCtrlArgs;
export type MsgCtrlMap = {
  [key in CallbackType]?: (args: MsgCtrlArgs) => Promise<void>;
};
export type CBQueryCtrlMap = {
  [key in CallbackType]?: (args: CBQueryCtrlArgs) => Promise<void>;
};
