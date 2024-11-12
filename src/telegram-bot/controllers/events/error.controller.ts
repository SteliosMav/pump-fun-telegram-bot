import { UserService } from "src/users/user.service";
import { CBQueryCtrlArgs, CtrlArgs } from "../../types";
import { getStartingMsg, getStartingInlineKeyboard } from "../start/view";
import { Database } from "sqlite3";
import TelegramBot from "node-telegram-bot-api";
import { SolanaService } from "src/solana/solana.service";
import { pubKeyByPrivKey } from "src/solana/utils";
import { startController } from "../start/start.controller";
import { isValidSol } from "src/telegram-bot/validators";

// Controller function
export async function errorController({
  bot,
  callbackQuery,
  errMsg,
}: CBQueryCtrlArgs) {
  const { message, from } = callbackQuery;
  if (!message || !from) return;

  const chatId = message.chat.id;

  if (errMsg) {
    bot.sendMessage(chatId, errMsg, {
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
    bot.deleteMessage(chatId, chatId);
  }

  // Optionally, send the prompt message again after clearing the error
  bot.sendMessage(chatId, "userMessage");
}
