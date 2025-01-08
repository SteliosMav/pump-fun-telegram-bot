import TelegramBot from "node-telegram-bot-api";
import { UserDoc } from "../../../user/types";
import { CallbackType } from "../../types";
import { getGoBackBtn } from "../../../shared/inline-keyboard-button";
import { SIGNATURE_FEE_LAMPORTS } from "../../../shared/constants";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getPumpFunFee } from "../../../pump-fun/util";
import { userHasServicePass } from "../../../user/util";
import { BOT_SERVICE_FEE_IN_SOL } from "../../../shared/config";

export function getSettingsMsg(user: UserDoc) {
  const serviceFee = userHasServicePass(user) ? 0 : BOT_SERVICE_FEE_IN_SOL;
  const txFee = SIGNATURE_FEE_LAMPORTS / LAMPORTS_PER_SOL;
  return `*Bump price: ${
    serviceFee + user.priorityFee + getPumpFunFee(user.bumpAmount) + txFee
  } SOL* 

It includes:
• Service fee: ${
    serviceFee > 0 ? serviceFee : "0 - _Enjoy ZERO service fees!_ 🎉"
  }
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
  user: UserDoc
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
