import { UserService } from "src/users/user.service";
import { MsgCtrlArgs } from "../../types";
import { isWholeNumber } from "src/telegram-bot/validators";
import { errorController } from "../events/error.controller";
import { settingsController } from "../settings/settings.controller";

// Controller function
export async function setBumpsLimitResponseController({
  bot,
  message,
  userState,
  setUserState,
}: MsgCtrlArgs) {
  const { from } = message;
  if (!from) return;

  const userService = new UserService();

  // Parse the bumps limit as a number
  const bumpsLimit = +(message.text as string);

  // Validate the bumps limit
  const validationError = isWholeNumber(bumpsLimit);
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

  // Update the bumps limit in the database
  await userService.updateBumpsLimit(from.id, bumpsLimit);

  // Reset state's lastCallback
  setUserState!({ ...userState!, lastCallback: null });

  // Redirect to start controller
  settingsController({ bot, message, userState, setUserState });
}
