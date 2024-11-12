import TelegramBot from "node-telegram-bot-api";
import { User } from "src/users/types";
import { CallbackType } from "../../types";
import bs58 from "bs58";
import { Keypair } from "@solana/web3.js";
import { pubKeyByPrivKey } from "src/solana/utils";

const START_BUMPING_BTN_WORDING = "🔥 Start Bumping";

export function getStartingMsg(user: User, balance: number): string {
  const publicKey = pubKeyByPrivKey(user.privateKey);

  return `👋 Welcome to **Solana Bump Bot** 🚀
  
  💼 **Wallet**: \`${publicKey}\` 

  💰 **Balance**: \`${balance}\` SOL
  
  To get started, deposit some SOL into your wallet above and press "${START_BUMPING_BTN_WORDING}" to ignite your trading journey! 🔥`;
}

export function getStartingInlineKeyboard(
  user: User
): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: `💰 ${user.bumpAmount} Amount`,
          callback_data: CallbackType.SET_AMOUNT,
        },
        {
          text: `📈 ${user.slippagePercentage * 100}% Slippage`,
          callback_data: CallbackType.SET_SLIPPAGE,
        },
      ],
      [
        {
          text: `🕑 ${user.bumpIntervalInSeconds}s Frequency`,
          callback_data: CallbackType.SET_INTERVAL,
        },
        {
          text: START_BUMPING_BTN_WORDING,
          callback_data: CallbackType.START_BUMPING,
        },
      ],
    ],
  };
}
