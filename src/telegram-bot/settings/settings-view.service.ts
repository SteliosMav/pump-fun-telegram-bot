import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { UserDoc } from "../../core/user/types";
import { BOT_SERVICE_FEE_IN_SOL, SIGNATURE_FEE } from "../../shared/constants";
import { backButton } from "../shared/view/buttons";
import { Injectable } from "@nestjs/common";
import { SharedAction } from "../shared/constants";
import { SettingsAction } from "./constants";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { calculatePumpFunFee } from "../../core/pump-fun";

@Injectable()
export class SettingsViewService {
  getMessage(user: UserDoc): string {
    const { priorityFee, amount } = user.bumpSettings;
    const serviceFee = user.hasServicePass ? 0 : BOT_SERVICE_FEE_IN_SOL;
    const txFee = SIGNATURE_FEE / LAMPORTS_PER_SOL;
    return `*Bump price: ${
      serviceFee + priorityFee + calculatePumpFunFee(amount) + txFee
    } SOL* 

It includes:
• Service fee: ${
      serviceFee > 0 ? serviceFee : "0 - _Enjoy ZERO service fees!_ 🎉"
    }
• Priority fee: ${priorityFee}
• Pump-fun fee: ${calculatePumpFunFee(amount)}
• Transaction fee: ${txFee}

*- Amount:* _The amount of SOL to use for each bump._
*- Slippage:* _The maximum percentage change in token price you are willing to accept during bumps._
*- Frequency:* _The time interval (in seconds) between each bump._
*- Priority Fee:* _Transactions with higher priority fees are processed faster, especially during high network traffic. Transactions delayed by more than a minute may fail._
*- Bumps:* _The total number of bumps you want to perform._`;
  }

  getButtons(user: UserDoc): InlineKeyboardButton[][] {
    const { amount, slippage, intervalInSeconds, priorityFee, limit } =
      user.bumpSettings;
    const backBtn = backButton(SharedAction.GO_TO_HOME);
    return [
      [
        backBtn,
        {
          text: `💰  ${amount} Amount`,
          callback_data: SettingsAction.SET_AMOUNT,
        },
      ],
      [
        {
          text: `📈   ${slippage * 100}% Slippage`,
          callback_data: SettingsAction.SET_SLIPPAGE,
        },
        {
          text: `🕑   ${intervalInSeconds}s Frequency`,
          callback_data: SettingsAction.SET_INTERVAL,
        },
      ],
      [
        {
          text: `⚡  ${priorityFee} Priority Fee`,
          callback_data: SettingsAction.SET_PRIORITY_FEE,
        },
        {
          text: `♻️  ${limit} Bump${limit === 1 ? "" : "s"}`,
          callback_data: SettingsAction.SET_LIMIT,
        },
      ],
    ];
  }
}
