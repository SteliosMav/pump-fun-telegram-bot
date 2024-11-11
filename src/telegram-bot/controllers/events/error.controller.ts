import { UserService } from "src/users/user.service";
import { BasicCtrlArgs } from "../../types";
import { getStartingMsg, getStartingInlineKeyboard } from "../start/view";
import { Database } from "sqlite3";
import TelegramBot from "node-telegram-bot-api";
import { SolanaService } from "src/solana/solana.service";
import { pubKeyByPrivKey } from "src/solana/utils";
import { startController } from "../start/start.controller";
import { isValidSol } from "src/telegram-bot/validators";

export interface ErrCtrlArgs extends BasicCtrlArgs {
  errorMessage?: string;
}

// Controller function
export async function errorController({ bot, msg, errorMessage }: ErrCtrlArgs) {
  const chatId = msg?.chat.id;
  const messageId = msg.message_id;

  if (errorMessage) {
    bot.sendMessage(msg.chat.id, errorMessage, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Got it ✔️",
              callback_data: "dismiss_error", // Identifier for callback
            },
          ],
        ],
      },
    });
  } else {
    bot.deleteMessage(chatId, messageId);
  }

  // // Optionally, send the prompt message again after clearing the error
  // bot.sendMessage(msg.chat.id, "userMessage");
}
