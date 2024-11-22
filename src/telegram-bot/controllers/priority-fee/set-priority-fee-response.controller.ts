import { UserService } from "src/users/user.service";
import { startController } from "../start/start.controller";
import { isValidSol } from "src/telegram-bot/validators";
import { MsgCtrlArgs } from "src/telegram-bot/types";
import { errorController } from "../events/error.controller";
import { settingsController } from "../settings/settings.controller";

// Controller function
export async function setPriorityFeeResponseController({
  bot,
  message,
  getUserState,
  setUserState,
}: MsgCtrlArgs) {
  const { from } = message;
  if (!from) return;

  const userService = new UserService();

  // Parse the priority fee as a number
  const priorityFee = +(message.text as string);

  // Validate the SOL amount
  const validationError = isValidSol(priorityFee);
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

  // Update the priority fee in the database
  await userService.updatePriorityFee(from.id, priorityFee);

  // Reset state's lastCallback
  setUserState!({ ...getUserState()!, lastCallback: null });

  // Redirect to start controller
  settingsController({ bot, message, getUserState, setUserState });
}
