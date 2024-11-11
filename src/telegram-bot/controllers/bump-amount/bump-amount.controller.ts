import { UserService } from "src/users/user.service";
import { BasicHandlerArguments } from "../../types";
import { getStartingMsg, getStartingInlineKeyboard } from "../start/view";
import { Database } from "sqlite3";
import TelegramBot from "node-telegram-bot-api";
import { SolanaService } from "src/solana/solana.service";
import { pubKeyByPrivKey } from "src/solana/utils";
import { startController } from "../start/start.controller";

export async function bumpAmountController({
  bot,
  msg,
}: BasicHandlerArguments) {
  bot.sendMessage(
    msg.chat.id,
    "Enter the desired SOL amount you want to bump with (e.g. 0.05):"
  );
  bot.once("message", async (response) => {
    // Initialize providers
    const db = new Database("telegram_bot.db");
    const userService = new UserService(db);

    // Update the bump amount
    const from = msg.from as TelegramBot.User;
    const amount = +(response.text as string);
    await userService.updateBumpAmount(from.id, amount);

    // Redirect to to start controller
    startController({ bot, msg });
  });
}
