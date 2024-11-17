import { UserService } from "src/users/user.service";
import { CBQueryCtrlArgs, MsgCtrlArgs } from "../../types";
import { getStartingMsg, getStartingInlineKeyboard } from "../start/view";
import TelegramBot from "node-telegram-bot-api";
import { SolanaService } from "src/solana/solana.service";
import { pubKeyByPrivKey } from "src/solana/utils";
import { startController } from "../start/start.controller";
import { isValidSol } from "src/telegram-bot/validators";
import { errorController } from "../events/error.controller";

// Controller function
export async function bumpAmountController({
  bot,
  errMsg,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message, from } = callbackQuery;
  if (!message || !from) return;

  const userMessage =
    "Enter the desired SOL amount you want to bump with (e.g. 0.05):";

  // Send error message with a "Got it" button if there's a validation error
  if (errMsg) {
    errorController({ bot, callbackQuery, errMsg });
  } else {
    // Prompt for the initial amount if there's no error
    bot.sendMessage(message.chat.id, userMessage);
  }

  // Listen for a response from the user
  bot.once("message", async (response) => {
    const userService = new UserService();

    // Parse the bump amount as a number
    const amount = +(response.text as string);

    // Validate the SOL amount
    const validationError = isValidSol(amount);
    if (validationError) {
      bumpAmountController({
        bot,
        callbackQuery,
        errMsg: validationError,
      });
      // errorController({ bot, callbackQuery });
      return;
    }

    // Update the bump amount in the database
    await userService.updateBumpAmount(from.id, amount);

    // Redirect to start controller
    startController({ bot, callbackQuery });
  });
}
