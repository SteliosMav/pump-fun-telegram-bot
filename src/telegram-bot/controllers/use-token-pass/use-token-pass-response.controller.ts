import { USER_FRIENDLY_ERROR_MESSAGE } from "../../../shared/constants";
import { PumpFunService } from "../../../pump-fun/pump-fun.service";
import { getCoinSlug } from "../../../pump-fun/util";
import { getRandomProxy } from "../../../shared/get-random-proxy";
import { SolanaService } from "../../../solana/solana.service";
import { UserService } from "../../../user/user.service";
import { MsgCtrlArgs } from "../../types";
import { isUrl, isValidBumpAmount, isValidSol } from "../../validators";
import { errorController } from "../events/error.controller";
import { loadingController } from "../events/loading.controller";
import { settingsController } from "../settings/settings.controller";
import { startController } from "../start/start.controller";
import { tokenPassController } from "../token-pass/token-pass.controller";

// Controller function
export async function useTokenPassResponseController({
  bot,
  message,
  getUserState,
  setUserState,
}: MsgCtrlArgs) {
  const { from } = message;
  if (!message || !from) return;

  // Initialize services
  const userService = new UserService();
  const pumpFunService = new PumpFunService();

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

  const text = message.text as string;
  const isUrlBool = isUrl(text);
  const inputType = isUrlBool ? "URL" : "CA";
  const ca = isUrlBool ? getCoinSlug(text) : text;

  const proxy = getRandomProxy();
  const coinData = await pumpFunService.getCoinData(ca, proxy);

  // Stop loading
  loadingController({
    bot,
    message,
    msgId: loadingMsgId,
    getUserState,
    setUserState,
  });

  // Validate coin data result
  if (!coinData) {
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

  // Update the user's profile in the database
  const res = await userService.useTokenPass(from.id, ca);

  if (res.success) {
    // Don't use as an error but as a success message - Better change the error controller
    // name with another more non-negative name:
    const successMsg = `🎉  *Congratulations, you've used a token-pass!*  🎉
      
    Now each time you bump this token, you won't be charged any additional service fees!`;

    await errorController({
      bot,
      message,
      errMsg: successMsg,
      getUserState,
      setUserState,
    });

    startController({ bot, message, getUserState, setUserState });
  } else {
    // Add error handling for cases such as token-pass usage for an already existed
    // and assigned with token-pass token, user not found etc.
    if (res.code === "INSUFFICIENT_BALANCE") {
      errorController({
        bot,
        message,
        errMsg: `You do not have any token passes left to use.`,
        getUserState,
        setUserState,
      });
    } else if (res.code === "USER_NOT_FOUND") {
      errorController({
        bot,
        message,
        errMsg: `User could not be found. Contact our support team.`,
        getUserState,
        setUserState,
      });
    } else if (res.code === "DUPLICATE_IDENTIFIER") {
      errorController({
        bot,
        message,
        errMsg: `You have already used a token-pass for that token.`,
        getUserState,
        setUserState,
      });
    } else {
      errorController({
        bot,
        message,
        errMsg: USER_FRIENDLY_ERROR_MESSAGE,
        getUserState,
        setUserState,
      });
    }
  }
}
