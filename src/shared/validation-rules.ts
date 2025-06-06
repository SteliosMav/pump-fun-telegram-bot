import { MIN_VALIDATOR_TIP_IN_SOL } from "./constants";

export const validationRules = {
  bumpSettings: {
    amountInSol: {
      min: 0.0123,
      max: 1,
      default: 0.0123,
    },
    slippage: { min: 0.02, max: 0.5, default: 0.02 },
    intervalInSeconds: { min: 1, max: 60, default: 10 },
    limit: { min: 1, max: 250, default: 50 },
    priorityFeeInSol: {
      min: MIN_VALIDATOR_TIP_IN_SOL,
      max: 1,
      default: 0.0001,
    },
  },
} as const;
