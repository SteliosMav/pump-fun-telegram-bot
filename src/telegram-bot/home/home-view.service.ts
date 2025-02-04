import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { UserDoc } from "../../core/user/types";
import { Injectable } from "@nestjs/common";
import { SharedAction } from "../shared/constants";
import { HomeAction } from "./constants";
import { toYYYYMMDD } from "../../shared/utils/date-utils";

@Injectable()
export class HomeViewService {
  private readonly BUMP_WORDING = "START BUMPING";

  getMessage(user: UserDoc, balance: number): string {
    return `${
      user.hasServicePass
        ? `*💎   Enjoy ZERO service-fee bumps!*${
            user.servicePass?.expirationDate
              ? `   -   _Until ${toYYYYMMDD(user.servicePass?.expirationDate)}_`
              : ""
          }\n\n\n`
        : ``
    }💳   *Wallet:*   \`${user.publicKey}\`

💰   *Balance:*   \`${balance}\`

${
  user.hasServicePass
    ? ""
    : `\n🎟️   *Token passes:*   \`${user.tokenPassesLeft}\`
    
💎   *Service pass:*   ❌\n\n`
}
*To get started:*

    1️⃣   Deposit some *SOL* into your wallet address shown above.

    2️⃣   Press the *${this.BUMP_WORDING}* button.

    3️⃣   Enter a meme coin's *CA* or *URL* and enjoy bumping!`;
  }

  getButtons(): InlineKeyboardButton[][] {
    return [
      [
        {
          text: "🌐  INFO",
          callback_data: SharedAction.GO_TO_INFO,
        },
        {
          text: "💵  PRICING",
          callback_data: SharedAction.GO_TO_PRICING,
        },
        {
          text: `⚙️  SETTINGS`,
          callback_data: SharedAction.GO_TO_SETTINGS,
        },
      ],
      [
        {
          text: `🔥  ${this.BUMP_WORDING}`,
          callback_data: HomeAction.SET_TOKEN,
        },
      ],
    ];
  }
}
