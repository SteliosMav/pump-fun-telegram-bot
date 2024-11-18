import TelegramBot from "node-telegram-bot-api";
import { User } from "src/users/types";
import { CallbackType } from "../../types";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";
import { pubKeyByPrivKey } from "src/solana/utils";
import { BOT_NAME, WEBSITE_URL } from "src/constants";

const START_BUMPING_BTN_WORDING = "Start Bumping";

export function getStartingMsg(user: User, balance: number): string {
  const publicKey = pubKeyByPrivKey(user.privateKey);

  return `💳   *Wallet*: \`${publicKey}\`
💰   *Balance*: \`${balance}\` SOL

*To get started:*

1️⃣ Deposit some *SOL* into your *wallet* address shown above

2️⃣ Press the *${START_BUMPING_BTN_WORDING}* button

3️⃣ Enter meme coin's *CA* and enjoy bumping! 🔥

For any help, visit us on [ezpump.fun](${WEBSITE_URL})`;
}

export function getStartingInlineKeyboard(
  user: User
): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: `💰  ${user.bumpAmount} Amount`,
          callback_data: CallbackType.SET_AMOUNT,
        },
        {
          text: `📈   ${user.slippage * 100}% Slippage`,
          callback_data: CallbackType.SET_SLIPPAGE,
        },
      ],
      [
        {
          text: `🕑   ${user.bumpIntervalInSeconds}s Frequency`,
          callback_data: CallbackType.SET_INTERVAL,
        },
        {
          text: `⚡  ${user.priorityFee} Priority Fee`,
          callback_data: CallbackType.SET_PRIORITY_FEE,
        },
      ],
      [
        {
          text: `🔄  Refresh Wallet's Balance`,
          callback_data: CallbackType.REFRESH_BALANCE,
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
