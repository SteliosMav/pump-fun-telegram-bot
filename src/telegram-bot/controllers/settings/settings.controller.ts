import { CallbackType, CBQueryCtrlArgs, CtrlArgs } from "../../types";
import TelegramBot from "node-telegram-bot-api";
import { UserService } from "../../../users/user.service";
import { getSettingsInlineKeyboard, settingsMsg } from "./view";
import { startController } from "../start/start.controller";

// Callback types that edit the message instead of sending a new one
// i.e. if the user presses the "Settings" button
const callbacksThatEditMsg = [CallbackType.GO_TO_SETTINGS];

export async function settingsController({
  bot,
  ...rest
}: CtrlArgs & { refresh?: boolean }) {
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

  // Prepare inline keyboard for settings
  const inlineKeyboard = getSettingsInlineKeyboard(user);

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
    // Edit the previous message with updated settings and inline keyboard
    bot.editMessageText(settingsMsg, {
      chat_id: message.chat.id,
      message_id: message.message_id, // The ID of the message you want to edit
      ...options,
    });
  } else {
    bot.sendMessage(message.chat.id, settingsMsg, options);
  }
}
