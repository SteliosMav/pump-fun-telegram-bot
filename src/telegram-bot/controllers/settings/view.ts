import TelegramBot from "node-telegram-bot-api";
import { User } from "../../../users/types";
import { CallbackType } from "../../types";
import { getSettingsBtn } from "../../../shared/inline-keyboard-button";

export const settingsMsg = `🛠️ Configure your bot settings:

*Amount:* The amount of SOL to use for each bump.

*Slippage:* The maximum percentage change in token price you are willing to accept during bumps.

*Frequency:* The time interval (in seconds) between each bump.

*Priority Fee:* Transactions with higher priority fees are processed faster, especially during high network traffic. Transactions delayed by more than a minute may fail.

*Bumps:* The total number of bumps you want to perform.`;

export function getSettingsInlineKeyboard(
  user: User
): TelegramBot.InlineKeyboardMarkup {
  const backBtn = getSettingsBtn(CallbackType.GO_TO_START);
  return {
    inline_keyboard: [
      [
        {
          text: `💰  ${user.bumpAmount} Amount`,
          callback_data: CallbackType.SET_AMOUNT,
        },
        {
          text: `📈   ${user.slippage * 100}% Slippage`,
          callback_data: CallbackType.SET_SLIPPAGE,
        },
      ],
      [
        {
          text: `🕑   ${user.bumpIntervalInSeconds}s Frequency`,
          callback_data: CallbackType.SET_INTERVAL,
        },
        {
          text: `⚡  ${user.priorityFee} Priority Fee`,
          callback_data: CallbackType.SET_PRIORITY_FEE,
        },
      ],
      [
        {
          text: `♻️  ${user.bumpsLimit} Bump${
            user.bumpsLimit === 1 ? "" : "s"
          }`,
          callback_data: CallbackType.SET_BUMPS_LIMIT,
        },
        backBtn,
      ],
    ],
  };
}
