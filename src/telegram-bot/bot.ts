import dotenv from "dotenv";
dotenv.config();

import TelegramBot from "node-telegram-bot-api";
import { CallbackType, CBQueryCtrlMap, MsgCtrlArgs, MsgCtrlMap } from "./types";
import { TELEGRAM_BOT_TOKEN } from "../constants";
import { catchErrors } from "./middleware";
import { startController } from "./controllers/start/start.controller";
import { setAmountRequestController } from "./controllers/bump-amount/set-amount-request.controller";
import { errorController } from "./controllers/events/error.controller";
import { setIntervalRequestController } from "./controllers/interval/set-interval-request.controller";
import { setSlippageResponseController } from "./controllers/slippage/set-slippage-response.controller";
import { setPriorityFeeResponseController } from "./controllers/priority-fee/set-priority-fee-response.controller";
import { startBumpingController } from "./controllers/start-bumping/start-bumping.controller";
import { refreshBalanceController } from "./controllers/refresh-balance/refresh-balance.controller";
import connectDB from "src/lib/mongo";
import { setAmountResponseController } from "./controllers/bump-amount/set-amount-response.controller";
import { setIntervalResponseController } from "./controllers/interval/set-interval-response.controller";
import { setPriorityFeeRequestController } from "./controllers/priority-fee/set-priority-fee-request.controller";

// Initialize bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// MongoDB connection
connectDB();

// User state management
export interface UserState {
  lastCallback: CallbackType | null;
}
const userMap = new Map<number, UserState>();

// Define callback controllers
const controllersMap: CBQueryCtrlMap = {
  [CallbackType.SET_AMOUNT]: setAmountRequestController,
  [CallbackType.DISMISS_ERROR]: errorController,
  [CallbackType.SET_INTERVAL]: setIntervalRequestController,
  [CallbackType.SET_SLIPPAGE]: setPriorityFeeRequestController,
  [CallbackType.SET_PRIORITY_FEE]: setPriorityFeeRequestController,
  [CallbackType.REFRESH_BALANCE]: refreshBalanceController,
  [CallbackType.START_BUMPING]: startBumpingController,
};

// Define response controllers
const responseControllersMap: MsgCtrlMap = {
  [CallbackType.SET_AMOUNT]: setAmountResponseController,
  [CallbackType.SET_INTERVAL]: setIntervalResponseController,
  [CallbackType.SET_PRIORITY_FEE]: setPriorityFeeResponseController,
  [CallbackType.SET_SLIPPAGE]: setSlippageResponseController,
};

// Handle the /start command
function onStartListener() {
  bot.onText(
    /\/start/,
    catchErrors(bot, (message: TelegramBot.Message) =>
      startController({ bot, message })
    )
  );
}

// Handle callback queries
function callbackQueryListener() {
  bot.on(
    "callback_query",
    catchErrors(bot, async (callbackQuery: TelegramBot.CallbackQuery) => {
      const data = callbackQuery.data as CallbackType | undefined;

      if (!data || !callbackQuery.from) return;

      const userState = userMap.get(callbackQuery.from.id);
      if (data !== CallbackType.DISMISS_ERROR) {
        userMap.set(callbackQuery.from.id, {
          ...userState,
          lastCallback: data,
        });
      }

      const controller = controllersMap[data];
      if (controller) {
        await controller({ bot, callbackQuery, userState });
      }

      bot.answerCallbackQuery(callbackQuery.id);
    })
  );
}

// Message response listeners
function onMessageListenersInit() {
  bot.on("message", async (message) => {
    if (!message.from) return;

    const userTgId = message.from.id;
    const userState = userMap.get(userTgId);
    const setUserState = (state: UserState) => userMap.set(userTgId, state);

    console.log(
      `User ${message.from.first_name} last callback: ${userState?.lastCallback}`
    );

    const controller = responseControllersMap[userState?.lastCallback!];
    if (controller) {
      await controller({ bot, message, userState, setUserState });
    }
  });
}

// Initialize bot with all controllers
function initializeBot() {
  onStartListener();
  callbackQueryListener();
  onMessageListenersInit();
}

initializeBot();
