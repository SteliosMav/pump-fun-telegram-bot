import { CBQueryCtrlArgs } from "../../types";

// Callback query controller function
export async function setIntervalRequestController({
  bot,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message, from } = callbackQuery;
  if (!message || !from) return;

  const userMessage =
    "Enter how often you want to bump in seconds from 1 to 60";
  bot.sendMessage(message.chat.id, userMessage);
}
