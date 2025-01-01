import { CallbackType, CBQueryCtrlArgs, CtrlArgs } from "../../types";
import TelegramBot from "node-telegram-bot-api";
import { UserService } from "../../../user/user.service";
import { getTokenPassInlineKeyboard, getTokenPassMsg } from "./view";
import { startController } from "../start/start.controller";
import { pubKeyByPrivKey } from "../../../solana/utils";
import { SolanaService } from "../../../solana/solana.service";

// Callback types that edit the message instead of sending a new one
// i.e. if the user presses the "Token Pass" button
const callbacksThatEditMsg = [CallbackType.GO_TO_TOKEN_PASS];

export async function tokenPassController({ bot, ...rest }: CtrlArgs) {
  // Check if the controller was called from a callback query
  const calledFromCallback = "callbackQuery" in rest;
  const from = calledFromCallback
    ? rest.callbackQuery.from
    : (rest.message.from as TelegramBot.User);
  const message = calledFromCallback
    ? rest.callbackQuery.message
    : rest.message;

  // Initialize dependencies
  const userService = new UserService();
  const solanaService = new SolanaService();

  if (!message) return;

  const user = await userService.getUser(from.id);

  const { getUserState, setUserState } = rest;
  if (!user) {
    // Redirect user to /start
    if (calledFromCallback) {
      startController({
        bot,
        callbackQuery: rest.callbackQuery,
        getUserState,
        setUserState,
      });
    } else {
      startController({
        bot,
        message: rest.message,
        getUserState,
        setUserState,
      });
    }
    return;
  }

  // Get user's balance
  const pubKey = pubKeyByPrivKey(user.privateKey);
  const balance = await solanaService.getBalance(pubKey);

  // Prepare inline keyboard for token-pass
  const inlineKeyboard = getTokenPassInlineKeyboard(user);

  const options: TelegramBot.EditMessageTextOptions = {
    reply_markup: inlineKeyboard,
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  };

  // If `editMsg` is true, edit the existing message, else send a new one
  const userState = getUserState();
  const editMsg =
    userState?.lastCallback &&
    callbacksThatEditMsg.includes(userState.lastCallback);

  // Reset state's lastCallback
  rest.setUserState({ ...userState!, lastCallback: null });

  if (editMsg) {
    // Edit the previous message with updated token-pass and inline keyboard
    bot.editMessageText(getTokenPassMsg(user, balance), {
      chat_id: message.chat.id,
      message_id: message.message_id, // The ID of the message you want to edit
      ...options,
    });
  } else {
    bot.sendMessage(message.chat.id, getTokenPassMsg(user, balance), options);
  }
}
