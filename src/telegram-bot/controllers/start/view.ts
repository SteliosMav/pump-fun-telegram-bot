import TelegramBot from "node-telegram-bot-api";
import { User } from "../../../users/types";
import { CallbackType } from "../../types";
import { pubKeyByPrivKey } from "../../../solana/utils";
import { WEBSITE_URL } from "../../../constants";
import { refreshBalanceBtn } from "../../../shared/inline-keyboard-button";

const START_BUMPING_BTN_WORDING = "Start Bumping";

export function getStartingMsg(user: User, balance: number): string {
  const publicKey = pubKeyByPrivKey(user.privateKey);

  return `💳   *Wallet*: \`${publicKey}\`
💰   *Balance*: \`${balance}\` SOL

*To get started:*

1️⃣ Deposit some *SOL* into your *wallet* address shown above

2️⃣ Press the *${START_BUMPING_BTN_WORDING}* button

3️⃣ Enter meme coin's *CA* or *URL* and enjoy bumping! 🔥

🎟  Token pass:  _(coming soon!)_
💎  Service pass:  _(coming soon!)_

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
          text: `🔥  ${START_BUMPING_BTN_WORDING}`,
          callback_data: CallbackType.SET_TOKEN,
        },
      ],
    ],
  };
}
