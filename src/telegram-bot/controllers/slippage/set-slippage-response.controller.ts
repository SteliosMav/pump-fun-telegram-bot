import { UserService } from "../../../user/user.service";
import { MsgCtrlArgs } from "../../types";
import { isValidSlippage } from "../../validators";
import { errorController } from "../events/error.controller";
import { settingsController } from "../settings/settings.controller";

// Controller function
export async function setSlippageResponseController({
  bot,
  message,
  getUserState,
  setUserState,
}: MsgCtrlArgs) {
  const { from } = message;
  if (!from) return;

  const userService = new UserService();

  // Parse the slippage as a number
  const slippage = +(message.text as string);

  // Validate the SOL amount
  const validationError = isValidSlippage(slippage);
  if (validationError) {
    errorController({
      bot,
      message,
      errMsg: validationError,
      getUserState,
      setUserState,
    });
    return;
  }

  // Update the slippage in the database
  const slippageInDecimal = slippage / 100;
  await userService.updateSlippage(from.id, slippageInDecimal);

  // Reset state's lastCallback
  setUserState!({ ...getUserState()!, lastCallback: null });

  // Redirect to start controller
  settingsController({ bot, message, getUserState, setUserState });
}
