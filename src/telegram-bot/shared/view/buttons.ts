import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { SharedAction } from "../constants";

// export function refreshBalanceButton(): InlineKeyboardButton {
//   return {
//     text: `🔄  REFRESH`,
//     callback_data: HomeAction.REFRESH_BALANCE,
//   };
// }

export function backButton(action: SharedAction): InlineKeyboardButton {
  return { text: `⬅️  Back`, callback_data: action };
}
