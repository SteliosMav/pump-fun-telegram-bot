import { CallbackType, CtrlArgs, MsgCtrlArgs } from "../../types";
import TelegramBot from "node-telegram-bot-api";
import { UserService } from "../../../user/user.service";
import { SolanaService } from "../../../solana/solana.service";
import { getStartingInlineKeyboard, getStartingMsg } from "./view";
import { pubKeyByPrivKey } from "../../../solana/utils";
import {
  ADMIN_ACCOUNT_PRIVATE_KEY,
  PERSONAL_TG_ID,
  USER_FRIENDLY_ERROR_MESSAGE,
} from "../../../constants";
import { errorController } from "../events/error.controller";
import { UserModel } from "../../../user/user.model";
import { encryptPrivateKey } from "../../../lib/crypto";

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
  const newUser = user ? false : true;

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
    const isTestUser = from.id === PERSONAL_TG_ID;
    const privateKey = isTestUser
      ? ADMIN_ACCOUNT_PRIVATE_KEY
      : await solanaService.createSolanaAccount();

    if (!privateKey) {
      console.error("Error creating Solana account");
      bot.sendMessage(message.chat.id, USER_FRIENDLY_ERROR_MESSAGE);
      return;
    }

    // Create new user
    try {
      user = new UserModel({
        encryptedPrivateKey: encryptPrivateKey(privateKey),
        telegramId: from.id,
        firstName: from.first_name,
        lastName: from.last_name || "",
        isBot: from.is_bot,
        username: from.username || "",
      });
      const newUserRes = await user.save();

      // Prompt message that the user recieved a free token pass
      if (user.tokenPassesTotal > 0) {
        const msg = `🎉  *Congratulations, you've been gifted a FREE token-pass!*  🎉`;
        errorController({
          bot,
          message,
          errMsg: msg,
          getUserState: rest.getUserState,
          setUserState: rest.setUserState,
        });
      }

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

  // Update user's tg info in database every time he uses /start command
  if (!calledFromCallback && !newUser) {
    userService.updateTgInfo(user.telegramId, from);
  }

  // Get user's balance
  const pubKey = pubKeyByPrivKey(user.privateKey);
  const balance = await solanaService.getBalance(pubKey);
  // Get start's inline keyboard
  const inlineKeyboard = getStartingInlineKeyboard(user);

  // If loading message was sent, edit it with the starting message.
  // Otherwise, send the starting message directly.
  if (loadingMessage) {
    // Edit the initial "loading" message with the final options inline keyboard
    await bot.editMessageText(getStartingMsg(user, balance), {
      chat_id: message.chat.id,
      message_id: loadingMessage.message_id as number,
      reply_markup: inlineKeyboard,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
  } else {
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
