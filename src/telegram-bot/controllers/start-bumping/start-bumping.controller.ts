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
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { loadingController } from "../events/loading.controller";

// Controller function
export async function startBumpingController({
  bot,
  errMsg,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message, from } = callbackQuery;
  if (!message || !from) return;

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
    // Initialize services
    const db = new Database("telegram_bot.db");
    const userService = new UserService(db);

    // Add user balance validation. If the user doesn't have enough balance,
    // send an error message and return right away.
    // ...
    const user = await userService.getUser(from.id);
    if (!user) return;

    // Start loading
    const sentLoading = await loadingController({
      bot,
      callbackQuery,
      loadingMsg: "Analyzing data...  🔄",
    });
    const loadingMsgId = sentLoading?.message_id;

    const pumpFunService = new PumpFunService(
      user.privateKey,
      user.priorityFee,
      user.slippage,
      user.bumpAmount
    );

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

    // const sufficientBalance = await pumpFunService.hasSufficientBalance(ca);
    const { totalRequiredBalance, payerBalance } =
      await pumpFunService.getRequiredBalance(coinData.mint);
    const hasSufficientBalance = payerBalance >= totalRequiredBalance;

    // Stop loading
    loadingController({
      bot,
      callbackQuery,
      msgId: loadingMsgId,
    });

    if (!hasSufficientBalance) {
      startController({
        bot,
        callbackQuery,
        errMsg: `*Insufficient balance.* 
        
Based on the current *amount* you've chosen to bump with, your *priority fees*, your *slippage* tolerance, and the current *price* of the coin, you need at least *${
          totalRequiredBalance / LAMPORTS_PER_SOL
        } SOL* to bump *${coinData.name}*. 
        
Please add some *SOL* to your wallet and try again.

_Once done, press Refresh Balance to check your updated balance._`,
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

    // Redirect to start controller once the interval is done
    startController({ bot, callbackQuery });
  });
}

function getCoinSlug(url: string) {
  const urlParts = url.split("/");
  return urlParts[urlParts.length - 1];
}
