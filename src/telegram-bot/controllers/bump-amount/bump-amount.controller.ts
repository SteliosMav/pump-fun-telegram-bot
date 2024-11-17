import { UserService } from "src/users/user.service";
import { CBQueryCtrlArgs, MsgCtrlArgs } from "../../types";
import { getStartingMsg, getStartingInlineKeyboard } from "../start/view";
import TelegramBot from "node-telegram-bot-api";
import { SolanaService } from "src/solana/solana.service";
import { pubKeyByPrivKey } from "src/solana/utils";
import { startController } from "../start/start.controller";
import { isValidSol } from "src/telegram-bot/validators";
import { errorController } from "../events/error.controller";

// A Map to track which users are currently in the process of submitting a value
const waitingForResponse = new Map<number, boolean>();

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

  // Ensure only one listener is active for each user at a time
  if (waitingForResponse.has(from.id)) return; // If user is already in the process, do nothing

  // Set the flag to prevent multiple responses for the same user
  waitingForResponse.set(from.id, true);

  // Listen for the user's response
  bot.once("message", async (response) => {
    if (!response.from) {
      return;
    }
    // Ensure the response is from the correct user
    if (response.chat.id !== message.chat.id || response.from.id !== from.id) {
      return; // Ignore responses from other users
    }

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
      return;
    }

    // Update the bump amount in the database
    await userService.updateBumpAmount(from.id, amount);

    // Remove the flag once the user input has been processed
    waitingForResponse.delete(from.id);

    // Redirect to start controller
    startController({ bot, callbackQuery });
  });
}
