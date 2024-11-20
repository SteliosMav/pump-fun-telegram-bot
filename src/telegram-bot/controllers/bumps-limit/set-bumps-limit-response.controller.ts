import { UserService } from "src/users/user.service";
import { MsgCtrlArgs } from "../../types";
import { startController } from "../start/start.controller";
import { isValidSol, isWholeNumber } from "src/telegram-bot/validators";
import { errorController } from "../events/error.controller";

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
    errorController({ bot, message, errMsg: validationError });
    return;
  }

  // Update the bumps limit in the database
  await userService.updateBumpsLimit(from.id, bumpsLimit);

  // Reset state's lastCallback
  setUserState!({ ...userState!, lastCallback: null });

  // Redirect to start controller
  startController({ bot, message });
}
