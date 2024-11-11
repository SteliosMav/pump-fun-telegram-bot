import dotenv from "dotenv";
dotenv.config();

import TelegramBot from "node-telegram-bot-api";
import { CallbackType, ControllersMap } from "./types";
import { TELEGRAM_BOT_TOKEN } from "../constants";
import { catchErrors } from "./middleware";
import { startController } from "./controllers/start/start.controller";
import { bumpAmountController } from "./controllers/bump-amount/bump-amount.controller";
import { errorController } from "./controllers/events/error.controller";

// Initialize bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Handle the /start command
function handleStartCommand() {
  bot.onText(
    /\/start/,
    catchErrors(bot, (msg: TelegramBot.Message) =>
      startController({ bot, msg })
    )
  );
}

// Define callback controllers
const controllersMap: ControllersMap = {
  [CallbackType.SET_AMOUNT]: bumpAmountController,
  [CallbackType.DISMISS_ERROR]: errorController,
};

// Handle callback queries
function handleCallbackQuery() {
  bot.on(
    "callback_query",
    catchErrors(bot, async (callbackQuery: TelegramBot.CallbackQuery) => {
      const msg = callbackQuery.message;
      const data = callbackQuery.data as CallbackType | undefined;

      if (!msg || !data) return;

      const controller = controllersMap[data];
      if (controller) {
        await controller({ bot, msg });
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
