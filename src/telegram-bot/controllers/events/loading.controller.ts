import { CBQueryCtrlArgs } from "../../types";

// Controller function
export async function loadingController({
  bot,
  callbackQuery,
  loadingMsg,
  msgId,
}: CBQueryCtrlArgs & { msgId?: number; loadingMsg?: string }) {
  const { message, from } = callbackQuery;
  if (!message || !from) return;

  const chatId = message.chat.id;

  if (loadingMsg) {
    return bot.sendMessage(chatId, loadingMsg, {
      parse_mode: "Markdown",
    });
  } else {
    if (!msgId) return;
    bot.deleteMessage(chatId, msgId);
  }
}
