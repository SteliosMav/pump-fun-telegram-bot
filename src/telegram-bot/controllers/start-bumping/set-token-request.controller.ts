import { CBQueryCtrlArgs } from "../../types";
import { PUMP_FUN_URL } from "../../../constants";

// Controller function
export async function setTokenRequestController({
  bot,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message } = callbackQuery;
  if (!message) return;

  // Prompt for the CA message, if there's no error
  const userMessage = `Enter the meme coin's *CA* (contract address) you want to bump *OR* its [pump.fun](${PUMP_FUN_URL}) URL link:`;
  bot.sendMessage(message.chat.id, userMessage, {
    parse_mode: "Markdown",
    disable_web_page_preview: true,
  });
}
