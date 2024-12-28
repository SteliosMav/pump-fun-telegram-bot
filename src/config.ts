import { User, UserDefaultValues } from "./users/types";

// Environment
export const ENV: "production" | "development" = "development";

// User
export const USER_DEFAULT_VALUES: UserDefaultValues = {
  bumpsCounter: 0,
  tokenPassesTotal: 1,
  tokenPassesUsed: 0,
  bumpAmount: 0.0123, // 0.012 is the minimum amount to be shown in pump.fun history
  bumpsLimit: 10,
  priorityFee: 0.0001,
  bumpIntervalInSeconds: 10,
  slippage: 0.02,
  tokenPass: {},
};

export const USER_FRIENDLY_ERROR_MESSAGE =
  "We are currently unavailable due to high demand. Please try again later.";
