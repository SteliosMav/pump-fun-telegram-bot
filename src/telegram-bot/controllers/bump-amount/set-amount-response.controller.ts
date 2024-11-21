import { UserService } from "src/users/user.service";
import { MsgCtrlArgs } from "../../types";
import { isValidSol } from "src/telegram-bot/validators";
import { errorController } from "../events/error.controller";
import { settingsController } from "../settings/settings.controller";

// Controller function
export async function setAmountResponseController({
  bot,
  message,
  userState,
  setUserState,
}: MsgCtrlArgs) {
  const { from } = message;
  if (!from) return;

  const userService = new UserService();

  // Parse the bump amount as a number
  const amount = +(message.text as string);

  // Validate the SOL amount
  const validationError = isValidSol(amount);
  if (validationError) {
    errorController({
      bot,
      message,
      errMsg: validationError,
      userState,
      setUserState,
    });
    return;
  }

  // Update the bump amount in the database
  await userService.updateBumpAmount(from.id, amount);

  // Reset state's lastCallback
  setUserState!({ ...userState!, lastCallback: null });

  // Redirect to start controller
  settingsController({ bot, message, userState, setUserState });
}
