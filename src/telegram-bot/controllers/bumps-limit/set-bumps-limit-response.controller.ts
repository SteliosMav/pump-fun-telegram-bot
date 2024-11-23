import { UserService } from "../../../users/user.service";
import { MsgCtrlArgs } from "../../types";
import { isValidBumpsLimit } from "../../validators";
import { errorController } from "../events/error.controller";
import { settingsController } from "../settings/settings.controller";

// Controller function
export async function setBumpsLimitResponseController({
  bot,
  message,
  getUserState,
  setUserState,
}: MsgCtrlArgs) {
  const { from } = message;
  if (!from) return;

  const userService = new UserService();

  // Parse the bumps limit as a number
  const bumpsLimit = +(message.text as string);

  // Validate the bumps limit
  const validationError = isValidBumpsLimit(bumpsLimit);
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

  // Update the bumps limit in the database
  await userService.updateBumpsLimit(from.id, bumpsLimit);

  // Reset state's lastCallback
  setUserState!({ ...getUserState()!, lastCallback: null });

  // Redirect to start controller
  settingsController({ bot, message, getUserState, setUserState });
}
