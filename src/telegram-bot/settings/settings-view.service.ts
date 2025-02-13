import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { UserDoc } from "../../core/user/types";
import { BOT_SERVICE_FEE_IN_SOL, SIGNATURE_FEE } from "../../shared/constants";
import { backButton } from "../shared/view/buttons";
import { Injectable } from "@nestjs/common";
import { SharedAction } from "../shared/constants";
import { SettingsAction } from "./constants";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { calculatePumpFunFee } from "../../core/pump-fun";
import { PricingService } from "../pricing/pricing.service";
import { toSol } from "../../core/solana";

@Injectable()
export class SettingsViewService {
  constructor(private readonly pricingService: PricingService) {}

  getMessage(user: UserDoc): string {
    const { priorityFeeInSol, amountInSol } = user.bumpSettings;
    const serviceFee = user.hasServicePass ? 0 : BOT_SERVICE_FEE_IN_SOL;
    const txFee = SIGNATURE_FEE / LAMPORTS_PER_SOL;
    const pumpFunFee = calculatePumpFunFee(amountInSol);
    const bumpPrice = toSol(this.pricingService.calculateBumpPrice(user));

    return `*📌  SETTINGS*
━━━━━━━━

   *Total Cost*:                 *${bumpPrice}  SOL*
  ━━━━━━             ━━━━━━━  
   Service Fee:               ${
     serviceFee > 0 ? `${serviceFee}  SOL` : "0.00  SOL"
   }     
   Priority Fee:              ${priorityFeeInSol}  SOL    
   Pump Fun Fee:         ${pumpFunFee}  SOL   
   Transaction Fee:      ${txFee}  SOL    

 
  *Settings                Explanation:*
  - Amount:             Shown as trades on pump.fun  
  - Slippage:            Max % price change allowed  
  - Frequency:        Time interval between bumps  
  - Priority Fee:       Higher fee = faster processing  
  - Bumps:               Total bumps to execute`;
  }

  getButtons(user: UserDoc): InlineKeyboardButton[][] {
    const {
      amountInSol,
      slippage,
      intervalInSeconds,
      priorityFeeInSol,
      limit,
    } = user.bumpSettings;
    const backBtn = backButton(SharedAction.GO_TO_HOME);
    return [
      [
        {
          text: `💰  ${amountInSol} Amount`,
          callback_data: SettingsAction.SET_AMOUNT,
        },
        {
          text: `⚡  ${priorityFeeInSol} Priority Fee`,
          callback_data: SettingsAction.SET_PRIORITY_FEE,
        },
      ],
      [
        {
          text: `📈  ${slippage * 100}% Slippage`,
          callback_data: SettingsAction.SET_SLIPPAGE,
        },
        {
          text: `🕑  ${intervalInSeconds}s Frequency`,
          callback_data: SettingsAction.SET_INTERVAL,
        },
        {
          text: `♻️  ${limit} Bump${limit === 1 ? "" : "s"}`,
          callback_data: SettingsAction.SET_LIMIT,
        },
      ],
      [backBtn],
    ];
  }
}
