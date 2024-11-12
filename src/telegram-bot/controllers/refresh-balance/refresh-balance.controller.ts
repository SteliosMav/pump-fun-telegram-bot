import { UserService } from "src/users/user.service";
import { CBQueryCtrlArgs } from "../../types";
import { Database } from "sqlite3";
import { startController } from "../start/start.controller";
import { isValidSlippage } from "src/telegram-bot/validators";
import { errorController } from "../events/error.controller";

// Controller function
export async function refreshBalanceController({
  bot,
  errMsg,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message, from } = callbackQuery;
  if (!message || !from) return;

  startController({ bot, callbackQuery, refresh: true });

  // const userMessage =
  //   "The coin price might slightly change until the bump takes place. How much slippage tolerance would you like to set? Enter a whole number that represents a percentage (e.g. 25):";

  // // Send error message with a "Got it" button if there's a validation error
  // if (errMsg) {
  //   errorController({ bot, callbackQuery, errMsg });
  // } else {
  //   // Prompt for the initial slippage if there's no error
  //   bot.sendMessage(message.chat.id, userMessage);
  // }

  // // Listen for a response from the user
  // bot.once("message", async (response) => {
  //   const db = new Database("telegram_bot.db");
  //   const userService = new UserService(db);

  //   // Parse the slippage as a number
  //   const slippage = +(response.text as string);

  //   // Validate the SOL amount
  //   const validationError = isValidSlippage(slippage);
  //   if (validationError) {
  //     slippageController({
  //       bot,
  //       callbackQuery,
  //       errMsg: validationError,
  //     });
  //     return;
  //   }

  //   // Update the slippage in the database
  //   const slippageInDecimal = slippage / 100;
  //   await userService.updateSlippage(from.id, slippageInDecimal);

  //   // Redirect to start controller
  //   startController({ bot, callbackQuery });
  // });
}
