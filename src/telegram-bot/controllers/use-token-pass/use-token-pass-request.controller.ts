import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SolanaService } from "../../../solana/solana.service";
import { pubKeyByPrivKey } from "../../../solana/utils";
import { UserService } from "../../../users/user.service";
import { CBQueryCtrlArgs, MsgCtrlArgs } from "../../types";
import { isValidBumpAmount, isValidSol } from "../../validators";
import { errorController } from "../events/error.controller";
import { settingsController } from "../settings/settings.controller";
import { SIGNATURE_FEE_LAMPORTS } from "../../../constants";
import { BOT_TOKEN_PASS_PRICE } from "../../../config";

// Controller function
export async function useTokenPassRequestController({
  bot,
  callbackQuery,
  getUserState,
  setUserState,
}: CBQueryCtrlArgs) {
  const from = callbackQuery.from;
  const message = callbackQuery.message;
  if (!message || !from) return;

  const userService = new UserService();

  // Get the user
  const user = await userService.getUser(from.id);
  if (!user) return;

  // Get user's balance
  const userHasTokenPass = user.tokenPassesTotal - user.tokenPassesUsed > 0;

  if (!userHasTokenPass) {
    // Reset state's lastCallback
    const userState = getUserState();
    setUserState!({ ...userState!, lastCallback: null });

    const errMsg = `*You do not have a token pass.* 
    
Go ahead and buy a token pass for only *${BOT_TOKEN_PASS_PRICE} SOL*`;
    errorController({
      bot,
      message,
      errMsg,
      getUserState,
      setUserState,
    });
    return;
  }

  const userMessage =
    "For which token would you like to use a token-pass? Enter the token's *CA* or pump.fun *URL*:";

  bot.sendMessage(message.chat.id, userMessage, { parse_mode: "Markdown" });
}
