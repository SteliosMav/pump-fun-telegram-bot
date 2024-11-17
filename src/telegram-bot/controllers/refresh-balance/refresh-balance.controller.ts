import { UserService } from "src/users/user.service";
import { CBQueryCtrlArgs } from "../../types";
import { startController } from "../start/start.controller";
import { isValidSlippage } from "src/telegram-bot/validators";
import { errorController } from "../events/error.controller";

// Controller function
export async function refreshBalanceController({
  bot,
  errMsg,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message, from } = callbackQuery;
  if (!message || !from) return;

  startController({ bot, callbackQuery, refresh: true });
}
