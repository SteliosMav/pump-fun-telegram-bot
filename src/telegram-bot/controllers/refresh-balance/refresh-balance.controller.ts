import { CBQueryCtrlArgs } from "../../types";
import { startController } from "../start/start.controller";

// Controller function
export async function refreshBalanceController({
  bot,
  callbackQuery,
  getUserState,
  setUserState,
}: CBQueryCtrlArgs) {
  const { message } = callbackQuery;
  if (!message) return;

  // Reset state's lastCallback
  setUserState!({ ...getUserState()!, lastCallback: null });

  startController({
    bot,
    callbackQuery,
    refresh: true,
    getUserState,
    setUserState,
  });
}
