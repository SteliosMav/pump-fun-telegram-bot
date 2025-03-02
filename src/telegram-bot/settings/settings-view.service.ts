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

\`Total Cost:        ${bumpPrice}  SOL
--------------------------------
Service Fee:       ${serviceFee > 0 ? `${serviceFee}   SOL` : "0.00  SOL"}
Priority Fee:      ${priorityFeeInSol}    SOL    
Pump Fun Fee:      ${pumpFunFee}  SOL   
Transaction Fee:   ${txFee}  SOL\`    


💰  *Amount:*  Displayed as trades on pump.fun _(no charge applied)_

⚡  *Priority Fee:*  A higher fee results in faster processing

📈  *Slippage:*  Maximum price change allowable

🕑  *Frequency:*  Time between bumps

♻️  *Bumps:*  Total number of bumps to execute`;
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
          text: `💰  AMOUNT:  ${amountInSol}`,
          callback_data: SettingsAction.SET_AMOUNT,
        },
      ],
      [
        {
          text: `⚡  PRIORITY FEE:  ${priorityFeeInSol}`,
          callback_data: SettingsAction.SET_PRIORITY_FEE,
        },
        {
          text: `📈  SLIPPAGE:  ${slippage * 100}%`,
          callback_data: SettingsAction.SET_SLIPPAGE,
        },
      ],
      [
        {
          text: `🕑  FREQUENCY:  ${intervalInSeconds}s`,
          callback_data: SettingsAction.SET_INTERVAL,
        },
        {
          text: `♻️  BUMP${limit === 1 ? "" : "S"}:  ${limit}`,
          callback_data: SettingsAction.SET_LIMIT,
        },
      ],
      [backBtn],
    ];
  }
}
