import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SolanaService } from "../../../solana/solana.service";
import { pubKeyByPrivKey } from "../../../solana/utils";
import { UserService } from "../../../users/user.service";
import { CBQueryCtrlArgs, MsgCtrlArgs } from "../../types";
import { isValidBumpAmount, isValidSol } from "../../validators";
import { errorController } from "../events/error.controller";
import { settingsController } from "../settings/settings.controller";
import {
  BOT_TOKEN_PASS_PRICE,
  SIGNATURE_FEE_LAMPORTS,
  USER_FRIENDLY_ERROR_MESSAGE,
} from "../../../constants";
import { tokenPassController } from "../token-pass/token-pass.controller";
import { startController } from "../start/start.controller";

// Controller function
export async function buyTokenResponseController({
  bot,
  callbackQuery,
  getUserState,
  setUserState,
}: CBQueryCtrlArgs) {
  const from = callbackQuery.from;
  const message = callbackQuery.message;
  if (!message || !from) return;

  const userService = new UserService();
  const solanaService = new SolanaService();

  // Get the user
  const user = await userService.getUser(from.id);
  if (!user) return;

  // Reset state's lastCallback
  const userState = getUserState();
  setUserState!({ ...userState!, lastCallback: null });

  // Get user's balance
  const pubKey = pubKeyByPrivKey(user.privateKey);
  const balance = await solanaService.getBalance(pubKey);
  const requiredAmount =
    SIGNATURE_FEE_LAMPORTS / LAMPORTS_PER_SOL + BOT_TOKEN_PASS_PRICE;
  const hasSufficientBalance = balance >= requiredAmount;

  if (!hasSufficientBalance) {
    const errMsg = `*Insufficient balance.* You need to have at least ${requiredAmount} SOL in your wallet. Token price at ${BOT_TOKEN_PASS_PRICE} SOL.`;
    errorController({
      bot,
      message,
      errMsg,
      getUserState,
      setUserState,
    });
    return;
  }

  // Buy token pass for the user
  const res = await userService.buyTokenPass(from.id, user.privateKey);

  if (res.success) {
    // Don't use as an error but as a success message - Better change the error controller
    // name with another more non-negative name:
    const successMsg = `🎉  *You have bought a token-pass successfully!*  🎉

Go ahead and choose which token you want to use your token-pass for.`;
    await errorController({
      bot,
      message,
      errMsg: successMsg,
      getUserState,
      setUserState,
    });

    // Redirect to start controller
    startController({ bot, callbackQuery, getUserState, setUserState });
  } else {
    if (res.code === "TRANSACTION_FAILED") {
      const errMsg =
        "Transaction failed. Probably due to insufficient balance or heavy load on Solana network. Please, try again later.";
      errorController({
        bot,
        message,
        errMsg,
        getUserState,
        setUserState,
      });
      return;
    } else if (res.code === "USER_NOT_FOUND") {
      const errMsg =
        "The transaction was successful but the user was not found to be updated. Please contact our support.";
      errorController({
        bot,
        message,
        errMsg,
        getUserState,
        setUserState,
      });
    } else {
      const errMsg = USER_FRIENDLY_ERROR_MESSAGE;
      errorController({
        bot,
        message,
        errMsg,
        getUserState,
        setUserState,
      });
    }
  }
}
