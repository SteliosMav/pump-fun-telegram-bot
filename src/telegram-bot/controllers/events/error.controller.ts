import { CBQueryCtrlArgs, MsgCtrlArgs } from "../../types";

// Controller function
export async function errorController({
  bot,
  errMsg,
  ...rest
}: MsgCtrlArgs | CBQueryCtrlArgs) {
  // Check if the controller was called from a callback query
  const calledFromCallback = "callbackQuery" in rest;
  const message = calledFromCallback
    ? rest.callbackQuery.message
    : rest.message;
  if (!message) return;

  const chatId = message.chat.id;
  const messageId = message.message_id;

  console.log("Error message: ", errMsg);

  if (errMsg) {
    bot.sendMessage(chatId, errMsg, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "OK ✔️",
              callback_data: "dismiss_error", // Identifier for callback
            },
          ],
        ],
      },
      parse_mode: "Markdown",
    });
  } else {
    bot.deleteMessage(chatId, messageId);
  }
}
