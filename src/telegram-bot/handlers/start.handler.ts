import { BasicHandlerArguments } from "../types";

export async function startHandler({ bot, msg }: BasicHandlerArguments) {
  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Get Balance", callback_data: "get_balance" },
          { text: "Get Coin Data", callback_data: "get_coin_data" },
          { text: "Buy Token", callback_data: "buy_token" },
        ],
      ],
    },
  };
  bot.sendMessage(
    msg.chat.id,
    "Welcome to the Solana Trading Bot! Please select an option:",
    options
  );
}
