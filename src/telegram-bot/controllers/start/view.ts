import TelegramBot from "node-telegram-bot-api";
import { User } from "../../../users/types";
import { CallbackType } from "../../types";
import { pubKeyByPrivKey } from "../../../solana/utils";
import { WEBSITE_URL, BOT_TOKEN_PASS_PRICE } from "../../../constants";
import { refreshBalanceBtn } from "../../../shared/inline-keyboard-button";
import { userHasServicePass } from "../../../users/util";

const START_BUMPING_BTN_WORDING = "Start Bumping";

export function getStartingMsg(user: User, balance: number): string {
  const publicKey = pubKeyByPrivKey(user.privateKey);
  const hasServicePass = userHasServicePass(user);
  const tokenPassLeft = user.tokenPassesTotal - user.tokenPassesUsed;

  return `💳   *Wallet*: \`${publicKey}\`
💰   *Balance*: \`${balance}\` SOL

*To get started:*
*1)* Deposit some *SOL* into your *wallet* address shown above
*2)* Press the *${START_BUMPING_BTN_WORDING}* button
*3)* Enter meme coin's *CA* or *URL* and enjoy bumping! 🔥
${hasServicePass ? "" : `\n🎟️  *Token pass:*  ${tokenPassLeft}`}
💎  *Service pass:*  ${
    hasServicePass
      ? "*Congratulations! Enjoy service fee FREE bumps!*"
      : "_(coming soon!)_"
  }

Reach out to us:
🌐 [ezpump.fun](${WEBSITE_URL})    ✉️ [info@ezpump.fun](mailto:info@ezpump.fun)`;
}

export function getStartingInlineKeyboard(
  user: User
): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        refreshBalanceBtn,
        {
          text: `⚙️  Settings`,
          callback_data: CallbackType.GO_TO_SETTINGS,
        },
      ],
      [
        {
          text: "🎟️  Token Pass",
          callback_data: CallbackType.GO_TO_TOKEN_PASS,
        },
        {
          text: `🔥  ${START_BUMPING_BTN_WORDING}`,
          callback_data: CallbackType.SET_TOKEN,
        },
      ],
    ],
  };
}
