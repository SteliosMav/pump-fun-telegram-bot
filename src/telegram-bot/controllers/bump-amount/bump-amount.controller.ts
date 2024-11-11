import { UserService } from "src/users/user.service";
import { BasicCtrlArgs } from "../../types";
import { getStartingMsg, getStartingInlineKeyboard } from "../start/view";
import { Database } from "sqlite3";
import TelegramBot from "node-telegram-bot-api";
import { SolanaService } from "src/solana/solana.service";
import { pubKeyByPrivKey } from "src/solana/utils";
import { startController } from "../start/start.controller";
import { isValidSol } from "src/telegram-bot/validators";
import { ErrCtrlArgs, errorController } from "../events/error.controller";

// Controller function
export async function bumpAmountController({
  bot,
  msg,
  errorMessage,
}: ErrCtrlArgs) {
  const userMessage =
    "Enter the desired SOL amount you want to bump with (e.g. 0.05):";

  // Send error message with a "Got it" button if there's a validation error
  if (errorMessage) {
    errorController({ bot, msg, errorMessage });
  } else {
    // Prompt for the initial amount if there's no error
    bot.sendMessage(msg.chat.id, userMessage);
  }

  // Listen for a response from the user
  bot.once("message", async (response) => {
    const db = new Database("telegram_bot.db");
    const userService = new UserService(db);

    // Parse the bump amount as a number
    const from = msg.from as TelegramBot.User;
    const amount = +(response.text as string);

    // Validate the SOL amount
    const validationError = isValidSol(amount);
    if (validationError) {
      bumpAmountController({
        bot,
        msg,
        errorMessage: validationError,
      });
      // errorController({ bot, msg });
      return;
    }

    // Update the bump amount in the database
    await userService.updateBumpAmount(from.id, amount);

    // Redirect to start controller
    startController({ bot, msg });
  });
}
