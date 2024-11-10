import TelegramBot from "node-telegram-bot-api";

export function catchErrors(bot: TelegramBot, handler: Function) {
  return async function (
    args: TelegramBot.CallbackQuery | TelegramBot.Message
  ) {
    try {
      await handler(args);
    } catch (error) {
      console.error("Unexpected error:", error);

      // Send a user-friendly error message
      const chatId = "chat" in args ? args.chat.id : args.message?.chat.id;

      if (chatId) {
        bot.sendMessage(
          chatId,
          "Oops! Something went wrong. Please try again later."
        );
      }
    }
  };
}
