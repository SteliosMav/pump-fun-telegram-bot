import { UserService } from "src/users/user.service";
import { MsgCtrlArgs } from "../../types";
import { startController } from "../start/start.controller";
import { isValidSlippage } from "src/telegram-bot/validators";
import { errorController } from "../events/error.controller";

// Controller function
export async function setSlippageResponseController({
  bot,
  message,
  userState,
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
    errorController({ bot, message, errMsg: validationError });
    return;
  }

  // Update the slippage in the database
  const slippageInDecimal = slippage / 100;
  await userService.updateSlippage(from.id, slippageInDecimal);

  // Reset state's lastCallback
  setUserState!({ ...userState!, lastCallback: null });

  // Redirect to start controller
  startController({ bot, message });
}
