import { CBQueryCtrlArgs } from "../../types";

// Controller function
export async function setBumpsLimitRequestController({
  bot,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message } = callbackQuery;
  if (!message) return;

  const userMessage =
    "Enter the maximum number of bumps you would like to perform (e.g. 10):";

  bot.sendMessage(message.chat.id, userMessage);
}
