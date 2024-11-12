// Validation function for SOL amount
export function isValidSol(amount: unknown): string | null {
  const MAX_SOL_DECIMALS = 9;

  // Check if it's a valid number
  if (typeof amount !== "number" || isNaN(amount)) {
    return "Invalid input. Please enter a valid number.";
  }

  // Check for more than 9 decimal places
  const decimalPart = amount.toString().split(".")[1];
  if (decimalPart && decimalPart.length > MAX_SOL_DECIMALS) {
    return `Invalid SOL amount. Maximum allowed precision is ${MAX_SOL_DECIMALS} decimal places.`;
  }

  // Amount is valid
  return null;
}

export function isValidInterval(interval: unknown): string | null {
  // Check if it's a valid number
  if (typeof interval !== "number" || isNaN(interval)) {
    return "Invalid input. Please enter a valid number.";
  }

  // Check if decimal
  if (interval % 1 !== 0) {
    return "Invalid input. Please enter a whole number.";
  }

  // Check for valid range
  if (interval < 1 || interval > 60) {
    return "Invalid frequency. Please enter a number between 1 and 60.";
  }

  // Interval is valid
  return null;
}
