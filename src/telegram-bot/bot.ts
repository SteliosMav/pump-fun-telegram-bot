import dotenv from "dotenv";
dotenv.config();

import TelegramBot from "node-telegram-bot-api";
import { CallbackType, CBQueryCtrlMap } from "./types";
import { TELEGRAM_BOT_TOKEN } from "../constants";
import { catchErrors } from "./middleware";
import { startController } from "./controllers/start/start.controller";
import { bumpAmountController } from "./controllers/bump-amount/bump-amount.controller";
import { errorController } from "./controllers/events/error.controller";
import { intervalController } from "./controllers/interval/interval.controller";

// Initialize bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Handle the /start command
function handleStartCommand() {
  bot.onText(
    /\/start/,
    catchErrors(bot, (message: TelegramBot.Message) =>
      startController({ bot, message })
    )
  );
}

// Define callback controllers
const controllersMap: CBQueryCtrlMap = {
  [CallbackType.SET_AMOUNT]: bumpAmountController,
  [CallbackType.DISMISS_ERROR]: errorController,
  [CallbackType.SET_INTERVAL]: intervalController,
};

// Handle callback queries
function handleCallbackQuery() {
  bot.on(
    "callback_query",
    catchErrors(bot, async (callbackQuery: TelegramBot.CallbackQuery) => {
      const data = callbackQuery.data as CallbackType | undefined;

      if (!data) return;

      const controller = controllersMap[data];
      if (controller) {
        await controller({ bot, callbackQuery });
      }

      bot.answerCallbackQuery(callbackQuery.id);
    })
  );
}

// Initialize bot with all controllers
function initializeBot() {
  handleStartCommand();
  handleCallbackQuery();
}

initializeBot();
