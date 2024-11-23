import { UserService } from "../../../users/user.service";
import { CBQueryCtrlArgs, MsgCtrlArgs } from "../../types";
import { startController } from "../start/start.controller";
import { isValidInterval } from "../../validators";
import { errorController } from "../events/error.controller";
import { settingsController } from "../settings/settings.controller";

// Controller function
export async function setIntervalResponseController({
  bot,
  message,
  getUserState,
  setUserState,
}: MsgCtrlArgs) {
  const { from } = message;
  if (!from) return;

  const userService = new UserService();

  // Parse the bump interval as a number
  const interval = +(message.text as string);

  // Validate the interval
  const validationError = isValidInterval(interval);
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

  // Update the interval in the database
  await userService.updateInterval(from.id, interval);

  // Reset state's lastCallback
  setUserState!({ ...getUserState()!, lastCallback: null });

  // Redirect to start controller
  settingsController({ bot, message, getUserState, setUserState });
}
