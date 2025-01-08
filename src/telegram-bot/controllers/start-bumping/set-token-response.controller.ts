import { UserService } from "../../../user/user.service";
import {
  CallbackType,
  CBQueryCtrlArgs,
  MsgCtrlArgs,
  UserState,
} from "../../types";
import { startController } from "../start/start.controller";
import { errorController } from "../events/error.controller";
import { PumpFunService } from "../../../pump-fun/pump-fun.service";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { loadingController } from "../events/loading.controller";
import { CustomResponse, ErrorResponse } from "../../../shared/types";
import { SolanaService } from "../../../solana/solana.service";
import { isUrl } from "../../validators";
import { getCoinSlug } from "../../../pump-fun/util";
import {
  MIN_VALIDATOR_TIP_IN_SOL,
  USER_FRIENDLY_ERROR_MESSAGE,
} from "../../../shared/constants";
import { getRandomProxy } from "../../../shared/get-random-proxy";

// Controller function
export async function setTokenResponseController({
  bot,
  message,
  getUserState,
  setUserState,
}: MsgCtrlArgs) {
  const { from } = message;
  if (!message || !from) return;

  // Initialize services
  const userService = new UserService();

  // Get the user
  const user = await userService.getUser(from.id);
  if (!user) return;

  // Start loading
  const sentLoading = await loadingController({
    bot,
    message,
    loadingMsg: "Analyzing data...  🔄",
    getUserState,
    setUserState,
  });
  const loadingMsgId = sentLoading?.message_id;

  const pumpFunService = new PumpFunService();
  const solanaService = new SolanaService();

  const text = message.text as string;

  const isUrlBool = isUrl(text);
  const inputType = isUrlBool ? "URL" : "CA";
  const ca = isUrlBool ? getCoinSlug(text) : text;

  const proxy = getRandomProxy();
  const coinData = await pumpFunService.getCoinData(ca, proxy);

  // Validate coin data result
  if (!coinData) {
    console.log(
      `Failed retrieving coin data for user: ${from.id}. User text-input: ${text}`
    );
    // Stop loading
    await loadingController({
      bot,
      message,
      msgId: loadingMsgId,
      getUserState,
      setUserState,
    });
    errorController({
      bot,
      message,
      errMsg: `Invalid ${inputType}. Please enter a valid ${inputType}:`,
      getUserState,
      setUserState,
    });
    return;
  }

  // Reset state's lastCallback
  const userState = getUserState();
  setUserState!({ ...userState!, lastCallback: null });

  const includeBotFee =
    user.hasServicePass || user.hasPassForToken(coinData.mint);
  const { totalRequiredBalance, payerBalance } =
    await solanaService.getRequiredBalance(
      user.privateKey,
      user.priorityFee,
      user.slippage,
      user.bumpAmount,
      user.bumpsLimit,
      coinData.mint,
      includeBotFee
    );
  const hasSufficientBalance = payerBalance >= totalRequiredBalance;

  // Stop loading
  await loadingController({
    bot,
    message,
    msgId: loadingMsgId,
    getUserState,
    setUserState,
  });

  if (!hasSufficientBalance) {
    const errMsg = `*Insufficient balance.*

Based on the current *amount* you've chosen, the number of *bumps*, your *priority fees*, your *slippage* tolerance, and the current *price* of the coin, you need at least *${
      totalRequiredBalance / LAMPORTS_PER_SOL
    } SOL* to bump *${coinData.name}*.

Please add some *SOL* to your wallet and try again.

_Once done, press Refresh Balance to check your updated balance._`;
    errorController({
      bot,
      message,
      errMsg,
      getUserState,
      setUserState,
    });
    return;
  }

  // Start bumping. Respond with the coin name and a "started bumping" message.
  await bot.sendMessage(
    message.chat.id,
    `🔥  Started bumping meme coin: *${coinData.name}*  🔥
    
_Watch out, any further action will cancel the bumping process._`,
    {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `❌  CANCEL`,
              callback_data: CallbackType.STOP_BUMPING,
            },
          ],
        ],
      },
    }
  );

  // Start the bump interval
  const bump = async () =>
    solanaService.bump(
      user.privateKey,
      user.priorityFee,
      user.slippage,
      user.bumpAmount,
      coinData.mint,
      includeBotFee
    );

  // Set userState.stopBumping to false
  setUserState({ ...getUserState()!, stopBumping: false, isBumping: true });
  const bumpResponse = await startBumpInterval(
    bump,
    user.bumpIntervalInSeconds,
    user.bumpsLimit,
    getUserState
  );
  setUserState({ ...getUserState()!, isBumping: false });

  // Once the interval is done, the rest of the code will run
  if (bumpResponse.success) {
    // Increment the bumps counter
    userService.increaseBumpCounter(user.telegramId, bumpResponse.data);

    if (bumpResponse.code === "FAILED_RETRIEVE_COIN_DATA") {
      // Send a success message BUT with early stoppage
      await bot.sendMessage(
        message.chat.id,
        `🎉  *${coinData.name}* has been bumped successfully BUT stopped earlier due to increased user activity.  ⚠️`,
        {
          parse_mode: "Markdown",
        }
      );
    } else {
      // Send a success message
      await bot.sendMessage(
        message.chat.id,
        `🎉  *${coinData.name}* has been bumped successfully!  🎉`,
        {
          parse_mode: "Markdown",
        }
      );
    }

    // Redirect to start controller once the interval is done
    startController({ bot, message, getUserState, setUserState });
  } else if (bumpResponse.code === "INVALID_PAYLOAD") {
    await errorController({
      bot,
      message,
      errMsg: `Transaction failed. Probably insufficient amount of priority fee. Min fee is: ${MIN_VALIDATOR_TIP_IN_SOL}`,
      getUserState,
      setUserState,
    });
  } else if (bumpResponse.code === "INSUFFICIENT_BALANCE") {
    await errorController({
      bot,
      message,
      errMsg: `You don't have enough balance to bump *${coinData.name}*. Please add some *SOL* to your wallet and try again.`,
      getUserState,
      setUserState,
    });
  } else if (bumpResponse.code === "TRANSACTION_FAILED") {
    await errorController({
      bot,
      message,
      errMsg: `An error occurred while bumping *${coinData.name}*. Try increasing your transaction fee and try again.`,
      getUserState,
      setUserState,
    });
  } else {
    await errorController({
      bot,
      message,
      errMsg: USER_FRIENDLY_ERROR_MESSAGE,
      getUserState,
      setUserState,
    });
  }
}

// Start the interval function that calls the bump function every X seconds
async function startBumpInterval(
  bump: () => Promise<CustomResponse<string>>, // A function that performs the bump and returns a promise of completion status
  intervalInSeconds: number, // Interval time in seconds
  bumpsLimit: number, // Number of bumps to perform
  getUserState: () => UserState | undefined // Function to get the user state
): Promise<CustomResponse<number>> {
  const intervalMillis = intervalInSeconds * 1000;
  let bumpsCounter = 0;

  return new Promise(async (resolve, reject) => {
    // Function to run a single bump cycle
    const runBumpCycle = async () => {
      try {
        // // Mock response
        // const res: any = {
        //   success: true,
        //   data: bumpsCounter,
        // };
        // return res;
        const res = await bump(); // Call the bump function

        // If the bump was successful
        if (res.success) {
          bumpsCounter++;
        } else {
          // Handle specific failure cases
          if (res.code === "INSUFFICIENT_BALANCE") {
            // If we ran out of balance after the first bump, stop the interval
            if (bumpsCounter > 0) {
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
          } else if (res.code === "FAILED_RETRIEVE_COIN_DATA") {
            // If we ran out of balance after the first bump, stop the interval
            if (bumpsCounter > 0) {
              resolve({
                success: true,
                data: bumpsCounter,
                code: "FAILED_RETRIEVE_COIN_DATA",
              });
            } else {
              resolve({
                success: false,
                code: "FAILED_RETRIEVE_COIN_DATA",
              });
            }
            return; // Stop further bumps if there was insufficient balance
          } else {
            resolve({
              success: false,
              code: "UNKNOWN_ERROR",
            });
            return; // Stop further bumps if an unknown error occurred
          }
        }

        // If the bumps limit was reached, resolve the promise with success
        if (bumpsCounter >= bumpsLimit) {
          resolve({
            success: true,
            data: bumpsCounter,
          });
          return; // Stop further bumps if the limit was reached
        } else {
          if (getUserState()?.stopBumping) {
            resolve({
              success: true,
              data: bumpsCounter,
            });
          } else {
            // Wait for the next bump after the specified interval (only if previous one succeeded)
            setTimeout(runBumpCycle, intervalMillis);
          }
        }
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
