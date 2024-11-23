import { MAX_BUMPS_LIMIT, MIN_BUMP_AMOUNT } from "src/constants";

// Validation function for SOL amount
export function isValidSol(input: unknown): string | null {
  const MAX_SOL_DECIMALS = 9;

  // Check if it's a valid number
  if (typeof input !== "number" || isNaN(input)) {
    return "Invalid input. Please enter a valid number.";
  }

  // Check for more than 9 decimal places
  const decimalPart = input.toString().split(".")[1];
  if (decimalPart && decimalPart.length > MAX_SOL_DECIMALS) {
    return `Invalid SOL amount. Maximum allowed precision is ${MAX_SOL_DECIMALS} decimal places.`;
  }

  // Amount is valid
  return null;
}

export function isValidBumpAmount(input: unknown): string | null {
  const errMsg = isValidSol(input);
  if (errMsg) {
    return errMsg;
  }

  const number = input as number;
  if (number < MIN_BUMP_AMOUNT) {
    return `Invalid bump amount. The minimum bump amount is ${MIN_BUMP_AMOUNT} SOL.`;
  }

  // Amount is valid
  return null;
}

export function isWholeNumber(input: unknown): string | null {
  // Check if it's a valid number
  if (typeof input !== "number" || isNaN(input)) {
    return "Invalid input. Please enter a valid number.";
  }

  // Check if decimal
  if (input % 1 !== 0) {
    return "Invalid input. Please enter a whole number.";
  }

  return null;
}

export function isValitBumpsLimit(input: unknown): string | null {
  // Check if it's a whole number
  const errMsg = isWholeNumber(input);
  if (errMsg) {
    return errMsg;
  }
  const number = input as number;

  // Check for valid range
  if (number < 1 || number > MAX_BUMPS_LIMIT) {
    return `Invalid bumps limit. Please enter a number between 1 and ${MAX_BUMPS_LIMIT}.`;
  }

  // Bumps limit is valid
  return null;
}

export function isValidInterval(input: unknown): string | null {
  // Check if it's a whole number
  const errMsg = isWholeNumber(input);
  if (errMsg) {
    return errMsg;
  }
  const number = input as number;

  // Check for valid range
  if (number < 1 || number > 60) {
    return "Invalid frequency. Please enter a number between 1 and 60.";
  }

  // Interval is valid
  return null;
}

export function isValidSlippage(slippage: unknown): string | null {
  // Check if it's a valid number
  if (typeof slippage !== "number" || isNaN(slippage)) {
    return "Invalid input. Please enter a valid number.";
  }

  // Check if decimal
  if (slippage % 1 !== 0) {
    return "Invalid input. Please enter a whole number.";
  }

  // Check for valid range
  if (slippage < 1) {
    return "Invalid slippage. Please enter a number bigger than 1.";
  }

  // Slippage is valid
  return null;
}

export function isUrl(input: string) {
  try {
    new URL(input);
    return true;
  } catch (error) {
    return false;
  }
}
