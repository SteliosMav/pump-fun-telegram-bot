import TelegramBot from "node-telegram-bot-api";
import { User } from "../../../users/types";
import { CallbackType } from "../../types";
import { getGoBackBtn } from "../../../shared/inline-keyboard-button";
import { BOT_TOKEN_PASS_PRICE } from "../../../constants";
import { pubKeyByPrivKey } from "../../../solana/utils";

export function getTokenPassMsg(user: User, balance: number) {
  const publicKey = pubKeyByPrivKey(user.privateKey);
  return `💳   *Wallet*: \`${publicKey}\`
💰   *Balance*: \`${balance}\` SOL
  
🎟️ *Token Pass*
- Pay a *fixed* amount per token
- Bump it *unlimited* times with *ZERO* service fees
- Costs *${BOT_TOKEN_PASS_PRICE}* SOL per token`;
}

export function getTokenPassInlineKeyboard(
  user: User
): TelegramBot.InlineKeyboardMarkup {
  const backBtn = getGoBackBtn(CallbackType.GO_TO_START);
  const inlineKeyboard = {
    inline_keyboard: [
      [
        {
          text: `💲  Buy Token Pass`,
          callback_data: CallbackType.BUY_TOKEN_PASS,
        },
      ],
      [backBtn],
    ],
  };

  const userHasTokenPass = user.tokenPassesTotal - user.tokenPassesUsed > 0;
  if (userHasTokenPass) {
    inlineKeyboard.inline_keyboard[0].push({
      text: `🎟️   Use Token Pass`,
      callback_data: CallbackType.USE_TOKEN_PASS,
    });
  }

  return inlineKeyboard;
}
