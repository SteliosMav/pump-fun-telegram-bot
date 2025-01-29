import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { UserDoc } from "../../core/user/types";
import { backButton } from "../shared/view/buttons";
import { Injectable } from "@nestjs/common";
import { SharedAction } from "../shared/constants";
import { PricingAction } from "./constants";

@Injectable()
export class PricingViewService {
  getMarkdown(user: UserDoc, balance: number): string {
    return `PRICING...`;
  }

  getButtons(): InlineKeyboardButton[][] {
    return [
      [
        {
          text: `⬅️  BUY SERVICE PASS`,
          callback_data: PricingAction.BUY_SERVICE_PASS,
        },
      ],
      [
        {
          text: `⬅️  BUY TOKEN PASS`,
          callback_data: PricingAction.BUY_TOKEN_PASS,
        },
        {
          text: `⬅️  USE TOKEN PASS`,
          callback_data: PricingAction.USE_TOKEN_PASS,
        },
      ],
      [backButton(SharedAction.GO_TO_HOME)],
    ];
  }
}
