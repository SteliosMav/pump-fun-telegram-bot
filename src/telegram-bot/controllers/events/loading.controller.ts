import { MsgCtrlArgs } from "../../types";

// Controller function
export async function loadingController({
  bot,
  message,
  loadingMsg,
  msgId,
}: MsgCtrlArgs & { msgId?: number; loadingMsg?: string }) {
  if (!message) return;

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
