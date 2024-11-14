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
import { CustomResponse, ErrorResponse } from "src/shared/types";
import { USER_FRIENDLY_ERROR_MESSAGE } from "src/config";
import { SolanaService } from "src/solana/solana.service";

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

    const pumpFunService = new PumpFunService();
    const solanaService = new SolanaService();

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
      await solanaService.getRequiredBalance(
        user.privateKey,
        user.priorityFee,
        user.slippage,
        user.bumpAmount,
        coinData.mint
      );
    const hasSufficientBalance = payerBalance >= totalRequiredBalance;

    // Stop loading
    loadingController({
      bot,
      callbackQuery,
      msgId: loadingMsgId,
    });

    if (!hasSufficientBalance) {
      const errMsg = `*Insufficient balance.*

Based on the current *amount* you've chosen to bump with, your *priority fees*, your *slippage* tolerance, and the current *price* of the coin, you need at least *${
        totalRequiredBalance / LAMPORTS_PER_SOL
      } SOL* to bump *${coinData.name}*.

Please add some *SOL* to your wallet and try again.

_Once done, press Refresh Balance to check your updated balance._`;
      startController({
        bot,
        callbackQuery,
        errMsg,
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

    // Start the bump interval
    const bump = async () =>
      solanaService.bump(
        user.privateKey,
        user.priorityFee,
        user.slippage,
        user.bumpAmount,
        coinData.mint
      );
    const bumpResponse = await startBumpInterval(
      bump,
      user.bumpIntervalInSeconds
    );

    if (bumpResponse.success) {
      // Increment the bumps counter
      await userService.incrementBumpsCounter(
        user.telegramId,
        bumpResponse.data
      );

      // Send a success message
      bot.sendMessage(
        message.chat.id,
        `🎉  *${coinData.name}* has been bumped successfully!  🎉`,
        {
          parse_mode: "Markdown",
        }
      );
    } else if (bumpResponse.code === "INSUFFICIENT_BALANCE") {
      errorController({
        bot,
        callbackQuery,
        errMsg: `You don't have enough balance to bump *${coinData.name}*. Please add some *SOL* to your wallet and try again.`,
      });
    } else if (bumpResponse.code === "TRANSACTION_FAILED") {
      errorController({
        bot,
        callbackQuery,
        errMsg: `An error occurred while bumping *${coinData.name}*. Try increasing your transaction fee and try again.`,
      });
    } else {
      errorController({
        bot,
        callbackQuery,
        errMsg: USER_FRIENDLY_ERROR_MESSAGE,
      });
    }

    // Redirect to start controller once the interval is done
    startController({ bot, callbackQuery });
  });
}

function getCoinSlug(url: string) {
  const urlParts = url.split("/");
  return urlParts[urlParts.length - 1];
}

// Start the interval function that calls the bump function every X seconds
async function startBumpInterval(
  bump: () => Promise<CustomResponse<string>>, // A function that performs the bump and returns a promise of completion status
  intervalInSeconds: number // Interval time in seconds
): Promise<CustomResponse<number>> {
  const intervalMillis = intervalInSeconds * 1000;
  let bumpsCounter = 0;

  return new Promise(async (resolve, reject) => {
    // Function to run a single bump cycle
    const runBumpCycle = async () => {
      try {
        const res = await bump(); // Call the bump function

        // If the bump was successful
        if (res.success) {
          bumpsCounter++;
        } else {
          // Handle specific failure cases
          if (res.code === "INSUFFICIENT_BALANCE") {
            console.log("Bump failed due to insufficient balance.");

            // If we ran out of balance after the first bump, stop the interval
            if (bumpsCounter > 0) {
              console.log(
                "Bump succeeded but ran out of balance. Stopping interval."
              );
              resolve({
                success: true,
                data: bumpsCounter,
              });
            } else {
              resolve({
                success: false,
                code: "INSUFFICIENT_BALANCE",
              });
            }
            return; // Stop further bumps if there was insufficient balance
          } else {
            console.log("Bump failed due to an unknown error.");
            resolve({
              success: false,
              code: "UNKNOWN_ERROR",
            });
            return; // Stop further bumps if an unknown error occurred
          }
        }

        // Wait for the next bump after the specified interval (only if previous one succeeded)
        setTimeout(runBumpCycle, intervalMillis);
      } catch (error) {
        console.error("Error during bump function:", error);
        const errorResponse: ErrorResponse = {
          success: false,
          code: "UNKNOWN_ERROR",
          error,
        };
        resolve(errorResponse); // Resolve the promise with error details
      }
    };

    // Start the first bump immediately
    await runBumpCycle(); // Await the first bump to finish before setting the interval
  });
}
