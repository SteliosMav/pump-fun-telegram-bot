import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { UserDoc } from "../../core/user/types";
import { BOT_WEBSITE_URL } from "../../shared/constants";
import { refreshBalanceButton } from "../shared/view/buttons";
import { Injectable } from "@nestjs/common";
import { SharedAction } from "../shared/constants";
import { HomeAction } from "./constants";

@Injectable()
export class HomeViewService {
  private readonly BUMP_WORDING = "Start Bumping";

  getMarkdown(user: UserDoc, balance: number): string {
    // ...
    return `💳   *Wallet*: \`${user.publicKey}\`
💰   *Balance*: \`${balance}\` SOL


*To get started:*

*1)*  Deposit some *SOL* into your *wallet* address shown above

*2)*  Press the *${this.BUMP_WORDING}* button

*3)*  Enter meme coin's *CA* or *URL* and enjoy bumping! 🔥

${user.hasServicePass ? "" : `\n🎟️  *Token pass:*  ${user.tokenPassesLeft}`}
💎  *Service pass:*  ${
      user.hasServicePass
        ? "*Congratulations! Enjoy service fee FREE bumps!*"
        : "_(coming soon!)_"
    }

Reach out to us:
🌐 [ezpump.fun](${BOT_WEBSITE_URL})    ✉️ [info@ezpump.fun](mailto:info@ezpump.fun)  ❓@ezpumpsupport`;
  }

  getButtons(): InlineKeyboardButton[][] {
    return [
      [
        refreshBalanceButton(),
        {
          text: `⚙️  Settings`,
          callback_data: SharedAction.SETTINGS,
        },
      ],
      [
        {
          text: "🎟️  Token Pass",
          callback_data: SharedAction.TOKEN_PASS,
        },
        {
          text: `🔥  ${this.BUMP_WORDING}`,
          callback_data: HomeAction.SET_TOKEN,
        },
      ],
    ];
  }
}
