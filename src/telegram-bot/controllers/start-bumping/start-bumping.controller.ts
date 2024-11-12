import { UserService } from "src/users/user.service";
import { CBQueryCtrlArgs } from "../../types";
import { Database } from "sqlite3";
import { startController } from "../start/start.controller";
import {
  isUrl,
  isValidSlippage,
  isValidSol,
} from "src/telegram-bot/validators";
import { errorController } from "../events/error.controller";
import { PumpFunService } from "src/pump-fun/pump-fun.service";
import { PUMP_FUN_URL } from "src/constants";

// Controller function
export async function startBumpingController({
  bot,
  errMsg,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message, from } = callbackQuery;
  if (!message || !from) return;

  // Add user balance validation. If the user doesn't have enough balance,
  // send an error message and return right away.
  // ...

  // Send error message with a "Got it" button if there's a validation error
  if (errMsg) {
    errorController({ bot, callbackQuery, errMsg });
  } else {
    // Prompt for the CA message, if there's no error
    const userMessage = `Enter the meme coin's *CA* (contract address) you want to bump *OR* its [pump.fun](${PUMP_FUN_URL}) URL link:`;
    bot.sendMessage(message.chat.id, userMessage, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    });
  }

  // Listen for a response from the user
  bot.once("message", async (response) => {
    const db = new Database("telegram_bot.db");
    const userService = new UserService(db);
    const pumpFunService = new PumpFunService();

    // Parse the priority fee as a number
    const text = response.text as string;

    const isUrlBool = isUrl(text);
    const inputType = isUrlBool ? "URL" : "CA";
    const ca = isUrlBool ? getCoinSlug(text) : text;

    const coinData = await pumpFunService.getCoinData(ca);

    // Validate coin data result
    if (!coinData) {
      startBumpingController({
        bot,
        callbackQuery,
        errMsg: `Invalid ${inputType}. Please enter a valid ${inputType}:`,
      });
      return;
    }

    // Start bumping. Respond with the coin name and a "started bumping" message.
    // Once the interval is done, let the start controller handle the rest.
    // ...
    bot.sendMessage(
      message.chat.id,
      `🔥  The bot started bumping meme coin: ${coinData.name}  🔥`,
      {
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }
    );

    return;

    // Redirect to start controller
    startController({ bot, callbackQuery });
  });
}

function getCoinSlug(url: string) {
  const urlParts = url.split("/");
  return urlParts[urlParts.length - 1];
}
