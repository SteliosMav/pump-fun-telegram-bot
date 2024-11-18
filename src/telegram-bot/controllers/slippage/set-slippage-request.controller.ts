import { CBQueryCtrlArgs } from "../../types";

// Controller function
export async function setSlippageRequestController({
  bot,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message } = callbackQuery;
  if (!message) return;

  const userMessage =
    "The coin price might slightly change until the bump takes place. How much slippage tolerance would you like to set? Enter a whole number that represents a percentage (e.g. 25):";

  bot.sendMessage(message.chat.id, userMessage);
}
