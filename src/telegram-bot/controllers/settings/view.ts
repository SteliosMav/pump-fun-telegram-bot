import TelegramBot from "node-telegram-bot-api";
import { User } from "../../../users/types";
import { CallbackType } from "../../types";
import { getGoBackBtn } from "../../../shared/inline-keyboard-button";
import { BOT_SERVICE_FEE, SIGNATURE_FEE_LAMPORTS } from "../../../constants";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getPumpFunFee } from "../../../pump-fun/util";
import { userHasServicePass } from "../../../users/util";

export function getSettingsMsg(user: User) {
  const serviceFee = userHasServicePass(user) ? 0 : BOT_SERVICE_FEE;
  const txFee = SIGNATURE_FEE_LAMPORTS / LAMPORTS_PER_SOL;
  return `*Bump price: ${
    serviceFee + user.priorityFee + getPumpFunFee(user.bumpAmount) + txFee
  } SOL* 

It includes:
• Service fee: ${serviceFee}
• Priority fee: ${user.priorityFee}
• Pump-fun fee: ${getPumpFunFee(user.bumpAmount)}
• Transaction fee: ${txFee}

*- Amount:* _The amount of SOL to use for each bump._
*- Slippage:* _The maximum percentage change in token price you are willing to accept during bumps._
*- Frequency:* _The time interval (in seconds) between each bump._
*- Priority Fee:* _Transactions with higher priority fees are processed faster, especially during high network traffic. Transactions delayed by more than a minute may fail._
*- Bumps:* _The total number of bumps you want to perform._`;
}

export function getSettingsInlineKeyboard(
  user: User
): TelegramBot.InlineKeyboardMarkup {
  const backBtn = getGoBackBtn(CallbackType.GO_TO_START);
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
