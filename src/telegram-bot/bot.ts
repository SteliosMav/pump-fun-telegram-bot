import TelegramBot from "node-telegram-bot-api";
import { catchErrors } from "./middleware";
import { TELEGRAM_BOT_TOKEN } from "../shared/constants";
import { CallbackType } from "./types";
import { initUserState } from "./util";
import { startController } from "./controllers/start/start.controller";
import { controllersMap, responseControllersMap } from "./router";
import { UserState, UserStore } from "./user-store";

export class Bot {
  private bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

  constructor(private userStore: UserStore) {}

  init(): void {
    this.initStartListener();
    this.initCallbackQueryListener();
    this.initMessageListeners();
  }

  private initStartListener() {
    this.bot.onText(
      /\/start/,
      catchErrors(this.bot, async (message: TelegramBot.Message) => {
        const { from } = message;
        if (!from) {
          return;
        }
        // Ignore bots
        if (from.is_bot) {
          console.warn("Incoming message from bot: ", message);
          return;
        }
        const userTgId = from.id;

        await this.handleStartParams(message);

        // Init use-state functions
        const getUserState = () => this.userStore.get(userTgId);
        const setUserState = (state: UserState) =>
          this.userStore.set(userTgId, state);

        // Init user's state
        const oldUserState = getUserState();
        const userState: UserState = oldUserState
          ? {
              ...oldUserState,
              stopBumping: true,
            }
          : initUserState();
        setUserState(userState);

        return startController({
          bot: this.bot,
          message,
          getUserState,
          setUserState,
        });
      })
    );
  }

  private initCallbackQueryListener() {
    this.bot.on(
      "callback_query",
      catchErrors(
        this.bot,
        async (callbackQuery: TelegramBot.CallbackQuery) => {
          const data = callbackQuery.data as CallbackType | undefined;

          if (!data || !callbackQuery.from) return;
          // Ignore bots
          if (callbackQuery.from.is_bot) {
            console.warn("Incoming callback-query from bot: ", callbackQuery);
            return;
          }

          const userTgId = callbackQuery.from.id;

          // Init use-state functions
          const getUserState = () => this.userStore.get(userTgId);
          const setUserState = (state: UserState) =>
            this.userStore.set(userTgId, state);

          // Init user's state
          const oldUserState = getUserState();
          const userState: UserState = oldUserState
            ? {
                ...oldUserState,
                stopBumping: true,
              }
            : initUserState();
          // DISMISS_ERROR callback should not be saved in the state
          if (data !== CallbackType.DISMISS_ERROR) {
            userState.lastCallback = data;
          }

          setUserState(userState);

          const controller = controllersMap[data];
          if (controller) {
            await controller({
              bot: this.bot,
              callbackQuery,
              getUserState,
              setUserState,
            });
          }

          this.bot.answerCallbackQuery(callbackQuery.id);
        }
      )
    );
  }

  // Message (response) listeners
  private initMessageListeners() {
    this.bot.on("message", async (message) => {
      if (!message.from) return;
      // Ignore bots
      if (message.from.is_bot) {
        console.warn("Incoming message from bot: ", message);
        return;
      }

      const userTgId = message.from.id;

      // Init user's state
      const getUserState = () => this.userStore.get(userTgId);
      const setUserState = (state: UserState) =>
        this.userStore.set(userTgId, state);

      // Init user's state
      const oldUserState = getUserState();
      const userState: UserState = oldUserState
        ? {
            ...oldUserState,
            stopBumping: true,
          }
        : initUserState();

      setUserState(userState);

      const controller = responseControllersMap[userState?.lastCallback!];
      if (controller) {
        await controller({
          bot: this.bot,
          message,
          getUserState,
          setUserState,
        });
      }
    });
  }

  private async handleStartParams({
    text,
    from,
  }: TelegramBot.Message): Promise<void> {
    type ParamType =
      | ["token_pass", string]
      | ["service_pass", string]
      | ["referral", number];

    const param = text?.split(" ")[1];
    if (param) {
      const [type, value] = param.split("-") as [string, string | number];

      if (type === "token_pass" && typeof value === "string" && value) {
        // Token Pass
        console.log("Token pass: ", value);
      }
    }
  }
}
