import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { UserDoc } from "../../core/user/types";
import { backButton } from "../shared/view/buttons";
import { Injectable } from "@nestjs/common";
import { SharedAction } from "../shared/constants";
import { PricingAction } from "./constants";
import {
  BOT_SERVICE_FEE_IN_SOL,
  BOT_SERVICE_PASS_PRICE_IN_SOL,
  BOT_TOKEN_PASS_PRICE_IN_SOL,
} from "../../shared/constants";

@Injectable()
export class PricingViewService {
  getMessage(user: UserDoc, balance: number): string {
    return `*📌  PRICING*
━━━━━━━━

💰  *Pay-Per-Bump*   -   _(${BOT_SERVICE_FEE_IN_SOL} SOL)_ 
   - No commitment, just pay per bump
   - Ideal for casual users 

💎  *Service Pass*   -   _(${BOT_SERVICE_PASS_PRICE_IN_SOL} SOL)_ 
   - Unlimited bumps without service fees  
   - Applies to all tokens
   - Best for frequent traders & pumpers  

🎟️  *Token Pass*   -   _(${BOT_TOKEN_PASS_PRICE_IN_SOL} SOL)_  
   - No service fees for one selected token 
   - Limited to a specific token  
   - Perfect for focused pumping


_“The more you bump, the more you grow. Grab a pass and pump smarter!”_`;
  }

  getButtons(): InlineKeyboardButton[][] {
    return [
      [
        {
          text: `💎  BUY SERVICE PASS`,
          callback_data: PricingAction.BUY_SERVICE_PASS,
        },
      ],
      [
        {
          text: `🎟️  BUY TOKEN PASS`,
          callback_data: PricingAction.BUY_TOKEN_PASS,
        },
        {
          text: `🔑  USE TOKEN PASS`,
          callback_data: PricingAction.USE_TOKEN_PASS,
        },
      ],
      [backButton(SharedAction.GO_TO_HOME)],
    ];
  }
}
