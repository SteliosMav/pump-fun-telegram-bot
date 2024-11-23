import { User } from "./types";

export function getIncludeBotFeeForUser(user: User, mint: string): boolean {
  const { serviceFeePass, tokenPass } = user;

  // Check serviceFeePass if it exists and has an expiration date
  if (serviceFeePass && serviceFeePass.createdAt) {
    const expirationDate = serviceFeePass.expirationDate
      ? new Date(serviceFeePass.expirationDate)
      : null;
    if (expirationDate) {
      // Compare expiration date with the current date
      if (expirationDate > new Date()) {
        return false; // Service fee pass is valid, do not include bot fee
      }
    } else {
      return false; // If there's no expiration date, treat it as valid
    }
  }

  // Check tokenPass for the specific mint if it exists and has an expiration date
  if (tokenPass && tokenPass[mint] && tokenPass[mint].createdAt) {
    const expirationDate = tokenPass[mint].expirationDate
      ? new Date(tokenPass[mint].expirationDate)
      : null;
    if (expirationDate) {
      // Compare expiration date with the current date
      if (expirationDate > new Date()) {
        return false; // Token pass is valid, do not include bot fee
      }
    } else {
      return false; // If there's no expiration date, treat it as valid
    }
  }

  // If no valid passes found, include bot fee
  return true;
}
