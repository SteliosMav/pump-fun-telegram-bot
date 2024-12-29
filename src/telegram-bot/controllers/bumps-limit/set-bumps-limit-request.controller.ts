import { MAX_BUMPS_LIMIT } from "../../../config";
import { CBQueryCtrlArgs } from "../../types";

// Controller function
export async function setBumpsLimitRequestController({
  bot,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message } = callbackQuery;
  if (!message) return;

  const userMessage = `Enter the maximum number of bumps you would like to perform between 1 and ${MAX_BUMPS_LIMIT} (e.g. 50):`;

  bot.sendMessage(message.chat.id, userMessage);
}
