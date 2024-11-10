import dotenv from "dotenv";
dotenv.config();
import TelegramBot from "node-telegram-bot-api";
import { CallbackType } from "./types";
import { startController } from "./controllers/start.controller";
import { TELEGRAM_BOT_TOKEN } from "../constants";
import { bumpAmountController } from "./controllers/bump-amount.controller";
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
      default:
        break;
    }

    // Acknowledge the callback
    bot.answerCallbackQuery(callbackQuery.id);
  })
);
