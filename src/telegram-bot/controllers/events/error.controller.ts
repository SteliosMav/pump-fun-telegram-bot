import { CBQueryCtrlArgs } from "../../types";

// Controller function
export async function errorController({
  bot,
  callbackQuery,
  errMsg,
}: CBQueryCtrlArgs) {
  const { message, from } = callbackQuery;
  if (!message || !from) return;

  const chatId = message.chat.id;
  const messageId = message.message_id;

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

  // // Optionally, send the prompt message again after clearing the error
  // bot.sendMessage(chatId, "userMessage");
}
