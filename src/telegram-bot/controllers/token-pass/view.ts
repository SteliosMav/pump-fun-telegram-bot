import TelegramBot from "node-telegram-bot-api";
import { UserDoc } from "../../../user/types";
import { CallbackType } from "../../types";
import { getGoBackBtn } from "../../../shared/inline-keyboard-button";
import { pubKeyByPrivKey } from "../../../solana/solana-utils";
import { BOT_TOKEN_PASS_PRICE_IN_SOL } from "../../../shared/config";

export function getTokenPassMsg(user: UserDoc, balance: number) {
  const publicKey = pubKeyByPrivKey(user.privateKey);
  return `💳   *Wallet*: \`${publicKey}\`
💰   *Balance*: \`${balance}\` SOL
  
🎟️ *Token Pass*
- Pay a *fixed* amount per token
- Bump it *unlimited* times with *ZERO* service fees
- Costs *${BOT_TOKEN_PASS_PRICE_IN_SOL} SOL* per token`;
}

export function getTokenPassInlineKeyboard(
  user: UserDoc
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
