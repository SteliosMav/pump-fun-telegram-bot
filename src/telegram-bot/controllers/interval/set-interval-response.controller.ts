import { UserService } from "src/users/user.service";
import { CBQueryCtrlArgs, MsgCtrlArgs } from "../../types";
import { startController } from "../start/start.controller";
import { isValidInterval } from "src/telegram-bot/validators";
import { errorResponseController } from "../events/error-response.controller";

// Controller function
export async function setIntervalResponseController({
  bot,
  message,
  userState,
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
    errorResponseController({ bot, message, errMsg: validationError });
    return;
  }

  // Update the interval in the database
  await userService.updateInterval(from.id, interval);

  // Reset state's lastCallback
  setUserState!({ ...userState!, lastCallback: null });

  // Redirect to start controller
  startController({ bot, message });
}
