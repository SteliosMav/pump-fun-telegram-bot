import TelegramBot from "node-telegram-bot-api";
import { CallbackData } from "./types";
import { startHandler } from "./handlers/start.handler";
import { getBalanceHandler } from "./handlers/get-balance.handler";
import { buyHandler } from "./handlers/buy.handler";
import { TELEGRAM_BOT_TOKEN } from "src/constants";

// Initialize bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Start command
bot.onText(/\/start/, (msg) => startHandler({ bot, msg }));

// Handle callback queries
bot.on("callback_query", async (callbackQuery) => {
  const msg = callbackQuery.message;
  const data = callbackQuery.data as CallbackData | undefined;

  // If no message do nothing
  if (!msg) {
    return;
  }

  // Call the right callback handler
  switch (data) {
    case "get_balance":
      getBalanceHandler({ msg, bot });
      break;

    case "buy_token":
      buyHandler({ msg, bot });
      break;

    default:
      break;
  }

  // Acknowledge the callback
  bot.answerCallbackQuery(callbackQuery.id);
});
