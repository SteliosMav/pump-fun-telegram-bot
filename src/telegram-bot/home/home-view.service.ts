import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { UserDoc } from "../../core/user/types";
import { BOT_WEBSITE_URL } from "../../shared/constants";
import { refreshBalanceButton } from "../shared/view/buttons";
import { Injectable } from "@nestjs/common";
import { SharedAction } from "../shared/constants";
import { HomeAction } from "./constants";

@Injectable()
export class HomeViewService {
  private readonly BUMP_WORDING = "START BUMPING";

  getMessage(user: UserDoc, balance: number): string {
    return `💳   *Wallet:*   \`${user.publicKey}\`

💰   *Balance:*   \`${balance}\`
${
  user.hasServicePass
    ? ""
    : `\n🎟️   *Token passes:*   \`${user.tokenPassesLeft}\``
}

💎   *Service pass:*   ${
      user.hasServicePass
        ? "*Congratulations! Enjoy service fee FREE bumps!*"
        : "❌"
    }


*To get started:*

    1️⃣   Deposit some *SOL* into your wallet address shown above.

    2️⃣   Press the *${this.BUMP_WORDING}* button.

    3️⃣   Enter a meme coin's *CA* or *URL* and enjoy bumping!`;
    /** @note Add the below to a contact/help page */
    // Reach out to us:
    // 🌐 [ezpump.fun](${BOT_WEBSITE_URL})    ✉️ [info@ezpump.fun](mailto:info@ezpump.fun)  ❓@ezpumpsupport
  }

  getButtons(): InlineKeyboardButton[][] {
    return [
      [
        /**
         * Can be removed
         */
        refreshBalanceButton(),
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
