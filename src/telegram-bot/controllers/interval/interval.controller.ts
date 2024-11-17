import { UserService } from "src/users/user.service";
import { CBQueryCtrlArgs } from "../../types";
import { startController } from "../start/start.controller";
import { isValidInterval, isValidSol } from "src/telegram-bot/validators";
import { errorController } from "../events/error.controller";

// A Map to track which users are currently in the process of submitting a value
const waitingForResponse = new Map<number, boolean>();

// Controller function
export async function intervalController({
  bot,
  errMsg,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message, from } = callbackQuery;
  if (!message || !from) return;

  const userMessage =
    "Enter how often you want to bump in seconds from 1 to 60";

  // Send error message with an "OK, GOT IT" button if there's a validation error
  if (errMsg) {
    errorController({ bot, callbackQuery, errMsg });
  } else {
    // Prompt for the desired interval if there's no error
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

    // Parse the bump interval as a number
    const interval = +(response.text as string);

    // Validate the interval
    const validationError = isValidInterval(interval);
    if (validationError) {
      intervalController({
        bot,
        callbackQuery,
        errMsg: validationError,
      });
      return;
    }

    // Update the interval in the database
    await userService.updateInterval(from.id, interval);

    // Remove the flag once the user input has been processed
    waitingForResponse.delete(from.id);

    // Redirect to start controller
    startController({ bot, callbackQuery });
  });
}
