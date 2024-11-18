import { CBQueryCtrlArgs } from "../../types";

// Controller function
export async function setPriorityFeeRequestController({
  bot,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message } = callbackQuery;
  if (!message) return;

  const userMessage =
    "When Solana's network is congested, a higher priority fee can help prioritize your bump over others. Enter a the amount of SOL (e.g. 0.01):";

  bot.sendMessage(message.chat.id, userMessage);
}
