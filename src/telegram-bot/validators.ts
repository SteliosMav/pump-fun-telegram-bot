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
