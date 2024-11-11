import dotenv from "dotenv";
dotenv.config();
import TelegramBot from "node-telegram-bot-api";
import { CallbackType } from "./types";
import { startController } from "./controllers/start/start.controller";
import { TELEGRAM_BOT_TOKEN } from "../constants";
import { bumpAmountController } from "./controllers/bump-amount/bump-amount.controller";
import { catchErrors } from "./middleware";

// Initialize bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Start command with error handling
bot.onText(
  /\/start/,
  catchErrors(bot, (msg: TelegramBot.Message) => startController({ bot, msg }))
);

// Handle callback queries with error handling
bot.on(
  "callback_query",
  catchErrors(bot, async (callbackQuery: TelegramBot.CallbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data as CallbackType | undefined;

    // If no message, do nothing
    if (!msg) {
      return;
    }

    // Call the right callback handler
    switch (data) {
      case CallbackType.SET_AMOUNT:
        await bumpAmountController({ msg, bot });
        break;
      case CallbackType.DISMISS_ERROR:
        break;
      default:
        break;
    }

    if (callbackQuery.data === "dismiss_error") {
      // Delete the message with the error and button, ensuring message_id is treated as a number
      const chatId = callbackQuery.message?.chat.id;
      const messageId = callbackQuery.message?.message_id;

      if (chatId && messageId) {
        bot.deleteMessage(chatId, messageId);
      }

      // // Optionally, send the prompt message again after clearing the error
      // bot.sendMessage(msg.chat.id, "userMessage");
    }

    // Acknowledge the callback
    bot.answerCallbackQuery(callbackQuery.id);
  })
);
