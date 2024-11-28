import { CBQueryCtrlArgs, MsgCtrlArgs } from "../../types";

// Controller function
export async function stopBumpingController({
  bot,
  callbackQuery,
  getUserState,
  setUserState,
}: CBQueryCtrlArgs) {
  setUserState({ ...getUserState()!, stopBumping: true, lastCallback: null });

  const message = callbackQuery.message;

  if (!message) return;

  bot.editMessageText("❌   Cancelling bumping...", {
    chat_id: message.chat.id,
    message_id: message.message_id as number,
    parse_mode: "Markdown",
  });
}
