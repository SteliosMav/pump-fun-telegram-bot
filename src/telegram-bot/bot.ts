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
import { refreshBalanceController } from "./controllers/refresh-balance/refresh-balance.controller";

import { setAmountResponseController } from "./controllers/bump-amount/set-amount-response.controller";
import { setIntervalResponseController } from "./controllers/interval/set-interval-response.controller";
import { setPriorityFeeRequestController } from "./controllers/priority-fee/set-priority-fee-request.controller";
import { setTokenRequestController } from "./controllers/start-bumping/set-token-request.controller";
import { setTokenResponseController } from "./controllers/start-bumping/set-token-response.controller";
import { setBumpsLimitRequestController } from "./controllers/bumps-limit/set-bumps-limit-request.controller";
import { setBumpsLimitResponseController } from "./controllers/bumps-limit/set-bumps-limit-response.controller";
import { settingsController } from "./controllers/settings/settings.controller";
import { get } from "http";
import { stopBumpingController } from "./controllers/events/stop-bumping.controller";
import connectDB from "../lib/mongo";
import http from "http"; // Importing built-in http module
import { tokenPassController } from "./controllers/token-pass/token-pass.controller";
import { buyTokenResponseController } from "./controllers/buy-token-pass/buy-token-pass-response.controller";
import { useTokenPassRequestController } from "./controllers/use-token-pass/use-token-pass-request.controller";
import { useTokenPassResponseController } from "./controllers/use-token-pass/use-token-pass-response.controller";

// Initialize bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// MongoDB connection
connectDB();

// User state management
export interface UserState {
  lastCallback?: CallbackType | null;
  stopBumping: boolean;
}
const userMap = new Map<number, UserState>();

// Define callback (request) controllers
const controllersMap: CBQueryCtrlMap = {
  [CallbackType.SET_AMOUNT]: setAmountRequestController,
  [CallbackType.SET_BUMPS_LIMIT]: setBumpsLimitRequestController,
  [CallbackType.DISMISS_ERROR]: errorController,
  [CallbackType.SET_INTERVAL]: setIntervalRequestController,
  [CallbackType.SET_SLIPPAGE]: setPriorityFeeRequestController,
  [CallbackType.SET_PRIORITY_FEE]: setPriorityFeeRequestController,
  [CallbackType.REFRESH_BALANCE]: refreshBalanceController,
  [CallbackType.SET_TOKEN]: setTokenRequestController,
  [CallbackType.GO_TO_SETTINGS]: settingsController,
  [CallbackType.GO_TO_START]: startController,
  [CallbackType.STOP_BUMPING]: stopBumpingController,
  [CallbackType.GO_TO_TOKEN_PASS]: tokenPassController,
  [CallbackType.BUY_TOKEN_PASS]: buyTokenResponseController,
  [CallbackType.USE_TOKEN_PASS]: useTokenPassRequestController,
};

// Define message (response) controllers
const responseControllersMap: MsgCtrlMap = {
  [CallbackType.SET_AMOUNT]: setAmountResponseController,
  [CallbackType.SET_BUMPS_LIMIT]: setBumpsLimitResponseController,
  [CallbackType.SET_INTERVAL]: setIntervalResponseController,
  [CallbackType.SET_PRIORITY_FEE]: setPriorityFeeResponseController,
  [CallbackType.SET_SLIPPAGE]: setSlippageResponseController,
  [CallbackType.SET_TOKEN]: setTokenResponseController,
  [CallbackType.USE_TOKEN_PASS]: useTokenPassResponseController,
};

// Define the /start command listener
function onStartListenerInit() {
  bot.onText(
    /\/start/,
    catchErrors(bot, (message: TelegramBot.Message) => {
      const { from } = message;
      if (!from) {
        return;
      }
      if (from.is_bot) return; // Ignore bots
      const userTgId = from.id;

      const getUserState = () => userMap.get(userTgId);
      const setUserState = (state: UserState) => userMap.set(userTgId, state);

      const oldUserState = getUserState();
      const userState: UserState = {
        ...oldUserState,
        stopBumping: true,
      };

      setUserState(userState);

      return startController({ bot, message, getUserState, setUserState });
    })
  );
}

// Callback query (request) listeners
function callbackQueryListenerInit() {
  bot.on(
    "callback_query",
    catchErrors(bot, async (callbackQuery: TelegramBot.CallbackQuery) => {
      const data = callbackQuery.data as CallbackType | undefined;

      if (!data || !callbackQuery.from) return;
      if (callbackQuery.from.is_bot) return; // Ignore bots

      const userTgId = callbackQuery.from.id;

      const getUserState = () => userMap.get(userTgId);
      const setUserState = (state: UserState) => userMap.set(userTgId, state);
      const oldUserState = getUserState();
      const userState = { ...oldUserState, stopBumping: true };
      // DISMISS_ERROR callback should not be saved in the state
      if (data !== CallbackType.DISMISS_ERROR) {
        userState.lastCallback = data;
      }

      setUserState(userState);

      const controller = controllersMap[data];
      if (controller) {
        await controller({
          bot,
          callbackQuery,
          getUserState,
          setUserState,
        });
      }

      bot.answerCallbackQuery(callbackQuery.id);
    })
  );
}

// Message (response) listeners
function messageListenersInit() {
  bot.on("message", async (message) => {
    if (!message.from) return;
    if (message.from.is_bot) return; // Ignore bots

    const userTgId = message.from.id;
    const getUserState = () => userMap.get(userTgId);
    const setUserState = (state: UserState) => userMap.set(userTgId, state);
    const oldUserState = getUserState();
    const userState: UserState = {
      ...oldUserState,
      stopBumping: true,
    };

    setUserState(userState);

    const controller = responseControllersMap[userState?.lastCallback!];
    if (controller) {
      await controller({ bot, message, getUserState, setUserState });
    }
  });
}

// Initialize bot with all controllers
function initializeBot() {
  onStartListenerInit();
  callbackQueryListenerInit();
  messageListenersInit();
}

initializeBot();

// Health check endpoint
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.end("OK");
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

// Start the server on port 8080 (or another port of your choice)
server.listen(8080, () => {
  console.log("Health check server is running on port 8080");
});
