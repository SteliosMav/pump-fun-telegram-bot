import { UserService } from "src/users/user.service";
import { CBQueryCtrlArgs } from "../../types";
import { startController } from "../start/start.controller";
import { isValidInterval, isValidSol } from "src/telegram-bot/validators";
import { errorController } from "../events/error.controller";

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

  // Listen for a response from the user
  bot.once("message", async (response) => {
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
      // errorController({ bot, callbackQuery });
      return;
    }

    // Update the interval in the database
    await userService.updateInterval(from.id, interval);

    // Redirect to start controller
    startController({ bot, callbackQuery });
  });
}
