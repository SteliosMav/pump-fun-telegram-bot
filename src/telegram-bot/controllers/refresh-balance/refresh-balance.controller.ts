import { CBQueryCtrlArgs } from "../../types";
import { startController } from "../start/start.controller";

// Controller function
export async function refreshBalanceController({
  bot,
  callbackQuery,
}: CBQueryCtrlArgs) {
  const { message } = callbackQuery;
  if (!message) return;

  startController({ bot, callbackQuery, refresh: true });
}
