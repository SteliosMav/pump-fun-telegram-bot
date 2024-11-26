import { User } from "../../../users/types";
import { CallbackType, CtrlArgs, MsgCtrlArgs } from "../../types";
import TelegramBot from "node-telegram-bot-api";
import { UserService } from "../../../users/user.service";
import { SolanaService } from "../../../solana/solana.service";
import {
  USER_DEFAULT_VALUES,
  USER_FRIENDLY_ERROR_MESSAGE,
} from "../../../config";
import { getStartingInlineKeyboard, getStartingMsg } from "./view";
import { pubKeyByPrivKey } from "../../../solana/utils";
import { SOLANA_TEST_PRIVATE_KEY, TEST_USER_TG_ID } from "../../../constants";

// Callback types that edit the message instead of sending a new one
// i.e. if the user presses the "Back" button
const callbacksThatEditMsg = [CallbackType.GO_TO_START];

export async function startController({
  bot,
  ...rest
}: CtrlArgs & { refresh?: boolean; editMsg?: boolean }) {
  // Initialize dependencies
  const userService = new UserService();
  const solanaService = new SolanaService();

  // Check if the controller was called from a callback query
  const calledFromCallback = "callbackQuery" in rest;
  const from = calledFromCallback
    ? rest.callbackQuery.from
    : (rest.message.from as TelegramBot.User);
  const message = calledFromCallback
    ? rest.callbackQuery.message
    : rest.message;

  if (!message) return;

  let user = await userService.getUser(from.id);

  // Incase of new user, it takes time to respond, thus a loading message is sent
  let loadingMessage: TelegramBot.Message | undefined;

  // New user
  if (!user) {
    // Send initial "loading" message
    loadingMessage = await bot.sendMessage(
      message.chat.id,
      "Setting up your personal wallet, please wait a moment..."
    );

    // Create new wallet for new user
    const isTestUser = from.id === TEST_USER_TG_ID;
    const privateKey = isTestUser
      ? SOLANA_TEST_PRIVATE_KEY
      : await solanaService.createSolanaAccount();

    if (!privateKey) {
      console.error("Error creating Solana account");
      bot.sendMessage(message.chat.id, USER_FRIENDLY_ERROR_MESSAGE);
      return;
    }

    // Create new user
    const userByTelegram = userByTelegramUser(from, privateKey);
    try {
      const newUserRes = await userService.create(userByTelegram);
      user = newUserRes;

      // Set up pumpFun account
      userService.setUpUsersPumpFunAcc(user.telegramId, privateKey);
    } catch (e) {
      console.error(`Error creating ${
        isTestUser ? "test-" : ""
      }user with telegramId: ${from.id}
Private key: ${privateKey}
Error: ${e}`);
      bot.sendMessage(message.chat.id, USER_FRIENDLY_ERROR_MESSAGE);
      return;
    }
  }

  const inlineKeyboard = getStartingInlineKeyboard(user);

  // If loading message was sent, edit it with the starting message.
  // Otherwise, send the starting message directly.
  if (loadingMessage) {
    // Edit the initial "loading" message with the final options inline keyboard
    await bot.editMessageText(getStartingMsg(user, 0), {
      chat_id: message.chat.id,
      message_id: loadingMessage.message_id as number,
      reply_markup: inlineKeyboard,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
  } else {
    // Get user's balance
    const pubKey = pubKeyByPrivKey(user.privateKey);
    const balance = await solanaService.getBalance(pubKey);

    if (rest.refresh) {
      try {
        await bot.editMessageText(getStartingMsg(user, balance), {
          chat_id: message.chat.id,
          message_id: message.message_id as number,
          reply_markup: inlineKeyboard,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        });
      } catch (e) {
        // console.error("Error editing message: ", e);
      }
    } else {
      const options: TelegramBot.SendMessageOptions = {
        reply_markup: inlineKeyboard,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      };

      // If `editMsg` is true, edit the existing message, else send a new one
      const userState = rest.getUserState();
      const editMsg =
        userState?.lastCallback &&
        callbacksThatEditMsg.includes(userState.lastCallback);

      // Reset state's lastCallback
      rest.setUserState({ ...userState!, lastCallback: null });

      if (editMsg) {
        bot.editMessageText(getStartingMsg(user, balance), {
          chat_id: message.chat.id,
          message_id: message.message_id as number,
          reply_markup: inlineKeyboard,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        });
      } else {
        bot.sendMessage(
          message.chat.id,
          getStartingMsg(user, balance),
          options
        );
      }
    }
  }
}

function userByTelegramUser(
  telegramUser: TelegramBot.User,
  privateKey: string
): Omit<User, "_id"> {
  const dateISO = new Date().toISOString();
  const user: Omit<User, "_id"> = {
    telegramId: telegramUser.id, // identifier
    firstName: telegramUser.first_name,
    lastName: telegramUser.last_name || "",
    isBot: telegramUser.is_bot,
    username: telegramUser.username || "",
    privateKey,
    bumpsCounter: USER_DEFAULT_VALUES.bumpsCounter,
    tokenPassesTotal: USER_DEFAULT_VALUES.tokenPassesTotal,
    tokenPassesUsed: USER_DEFAULT_VALUES.tokenPassesUsed,
    bumpAmount: USER_DEFAULT_VALUES.bumpAmount,
    bumpsLimit: USER_DEFAULT_VALUES.bumpsLimit,
    priorityFee: USER_DEFAULT_VALUES.priorityFee,
    bumpIntervalInSeconds: USER_DEFAULT_VALUES.bumpIntervalInSeconds,
    slippage: USER_DEFAULT_VALUES.slippage,
    pumpFunAccIsSet: false,
    tokenPass: new Map(),
    createdAt: dateISO,
    updatedAt: dateISO,
  };
  return user;
}
