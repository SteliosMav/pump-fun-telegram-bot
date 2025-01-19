import { UserService } from "../../../core/user/user.service";
import { MsgCtrlArgs } from "../../types";
import { isValidBumpAmount, isValidSol } from "../../validators";
import { errorController } from "../events/error.controller";
import { settingsController } from "../settings/settings.controller";

// Controller function
export async function setAmountResponseController({
  bot,
  message,
  getUserState,
  setUserState,
}: MsgCtrlArgs) {
  const { from } = message;
  if (!from) return;

  const userService = new UserService();

  // Parse the bump amount as a number
  const amount = +(message.text as string);

  // Validate the SOL amount
  const validationError = isValidBumpAmount(amount);
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

  // Update the bump amount in the database
  await userService.updateBumpAmount(from.id, amount);

  // Reset state's lastCallback
  setUserState!({ ...getUserState()!, lastCallback: null });

  // Redirect to start controller
  settingsController({ bot, message, getUserState, setUserState });
}
