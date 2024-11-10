import dotenv from "dotenv";
dotenv.config();
import TelegramBot from "node-telegram-bot-api";
import { CallbackType } from "./types";
import { startController } from "./controllers/start.controller";
import { TELEGRAM_BOT_TOKEN } from "../constants";

// Initialize bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Start command
bot.onText(/\/start/, (msg) => startController({ bot, msg }));

// Handle callback queries
bot.on("callback_query", async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data as CallbackType | undefined;

  // If no message do nothing
  if (!msg) {
    return;
  }

  // Call the right callback handler
  switch (data) {
    case CallbackType.SET_AMOUNT:
      // getBalanceHandler({ msg, bot });
      break;

    // case "buy_token":
    //   // buyHandler({ msg, bot });
    //   break;

    default:
      break;
  }

  // Acknowledge the callback
  bot.answerCallbackQuery(callbackQuery.id);
});
