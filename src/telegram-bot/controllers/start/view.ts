import TelegramBot from "node-telegram-bot-api";
import { UserDoc } from "../../../core/user/types";
import { CallbackType } from "../../types";
import { pubKeyByPrivKey } from "../../../core/solana/solana-utils";
import { BOT_WEBSITE_URL } from "../../../shared/constants";
import { refreshBalanceBtn } from "../../../shared/inline-keyboard-button";

const START_BUMPING_BTN_WORDING = "Start Bumping";

/*
💎  *Service pass:*  ${
    hasServicePass
      ? "*Congratulations! Enjoy service fee FREE bumps!*"
      : "_(coming soon!)_"
  }
*/

export function getStartingMsg(user: UserDoc, balance: number): string {
  const publicKey = pubKeyByPrivKey(user.privateKey);
  const hasServicePass = user.hasServicePass;
  const tokenPassLeft = user.tokenPassesTotal - user.tokenPassesUsed;

  return `💳   *Wallet*: \`${publicKey}\`
💰   *Balance*: \`${balance}\` SOL

*To get started:*
*1)* Deposit some *SOL* into your *wallet* address shown above
*2)* Press the *${START_BUMPING_BTN_WORDING}* button
*3)* Enter meme coin's *CA* or *URL* and enjoy bumping! 🔥
${hasServicePass ? "" : `\n🎟️  *Token pass:*  ${tokenPassLeft}`}

Reach out to us:
🌐 [ezpump.fun](${BOT_WEBSITE_URL})    ✉️ [info@ezpump.fun](mailto:info@ezpump.fun)  ❓@ezpumpsupport`;
}

export function getStartingInlineKeyboard(
  user: UserDoc
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
