import { CBQueryCtrlArgs } from "../../types";

// Controller function
export async function setAmountRequestController({
  bot,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message, from } = callbackQuery;
  if (!message || !from) return;

  const userMessage =
    "Enter the desired SOL amount you want to bump with (e.g. 0.05):";

  bot.sendMessage(message.chat.id, userMessage);
}
