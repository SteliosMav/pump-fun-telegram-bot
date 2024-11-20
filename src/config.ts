import { User, UserDefaultValues } from "./users/types";

// User
export const USER_DEFAULT_VALUES: UserDefaultValues = {
  bumpsCounter: 0,
  freePassesTotal: 0,
  freePassesUsed: 0,
  bumpAmount: 0.0123, // 0.012 is the minimum amount to be shown in pump.fun history
  bumpsLimit: 1,
  priorityFee: 0.01,
  bumpIntervalInSeconds: 1,
  slippage: 0.25,
};

export const USER_FRIENDLY_ERROR_MESSAGE =
  "We are currently unavailable due to high demand. Please try again later.";
