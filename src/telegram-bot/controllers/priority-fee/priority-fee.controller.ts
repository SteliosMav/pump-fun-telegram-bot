import { UserService } from "src/users/user.service";
import { CBQueryCtrlArgs } from "../../types";
import { Database } from "sqlite3";
import { startController } from "../start/start.controller";
import { isValidSlippage, isValidSol } from "src/telegram-bot/validators";
import { errorController } from "../events/error.controller";

// Controller function
export async function priorityFeeController({
  bot,
  errMsg,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message, from } = callbackQuery;
  if (!message || !from) return;

  const userMessage =
    "When Solana's network is congested, a higher priority fee can help prioritize your bump over others. Enter a the amount of SOL (e.g. 0.01):";

  // Send error message with a "Got it" button if there's a validation error
  if (errMsg) {
    errorController({ bot, callbackQuery, errMsg });
  } else {
    // Prompt for the set-up of priority fee, if there's no error
    bot.sendMessage(message.chat.id, userMessage);
  }

  // Listen for a response from the user
  bot.once("message", async (response) => {
    const db = new Database("telegram_bot.db");
    const userService = new UserService(db);

    // Parse the priority fee as a number
    const priorityFee = +(response.text as string);

    // Validate the SOL amount
    const validationError = isValidSol(priorityFee);
    if (validationError) {
      priorityFeeController({
        bot,
        callbackQuery,
        errMsg: validationError,
      });
      return;
    }

    // Update the priority fee in the database
    await userService.updatePriorityFee(from.id, priorityFee);

    // Redirect to start controller
    startController({ bot, callbackQuery });
  });
}
