import { UserMap, UserState } from "./types";
import { InlineKeyboardButton } from "node-telegram-bot-api";
import { CallbackType } from "./types";

export const refreshBalanceBtn: InlineKeyboardButton = {
  text: `🔄  Refresh Balance`,
  callback_data: CallbackType.REFRESH_BALANCE,
};

export function getGoBackBtn(callbackType: CallbackType): InlineKeyboardButton {
  return {
    text: `⬅️  Back`,
    callback_data: CallbackType.GO_TO_START,
  };
}

export function initUserState(): UserState {
  return {
    isBumping: false,
    stopBumping: true,
    createdAt: new Date().toISOString(),
  };
}

// Clean user state every 15 minutes
export function cleanUserStateInterval(userMap: UserMap) {
  const expirationTime = 15 * 60 * 1000; // 15 minutes in milliseconds
  setInterval(() => {
    const now = Date.now();

    userMap.forEach((userState, userId) => {
      const createdAtTimestamp = new Date(userState.createdAt).getTime(); // Convert ISO string to timestamp
      if (!userState.isBumping && now - createdAtTimestamp > expirationTime) {
        userMap.delete(userId); // Remove inactive user states
      }
    });
  }, expirationTime); // Run every 15 minutes
}
