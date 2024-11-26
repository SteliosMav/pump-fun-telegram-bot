import { User } from "./types";

export function getIncludeBotFeeForUser(user: User, mint: string): boolean {
  // Check serviceFeePass if it exists and has an expiration date
  if (userHasServicePass(user)) {
    return false;
  }

  // Check tokenPass for the specific mint if it exists and has an expiration date
  if (userHasTokenPass(user, mint)) {
    return false;
  }

  // If no valid passes found, include bot fee
  return true;
}

export function userHasServicePass(user: User) {
  const { serviceFeePass } = user;

  // Check serviceFeePass if it exists and has an expiration date
  if (serviceFeePass && serviceFeePass.createdAt) {
    const expirationDate = serviceFeePass.expirationDate
      ? new Date(serviceFeePass.expirationDate)
      : null;
    if (expirationDate) {
      // Compare expiration date with the current date
      if (expirationDate > new Date()) {
        return true; // Service fee pass is valid, do not include bot fee
      }
    } else {
      return true; // If there's no expiration date, treat it as valid
    }
  }

  // If no valid passes found
  return false;
}

export function userHasTokenPass(user: User, mint: string): boolean {
  const { tokenPass } = user;

  // Check tokenPass for the specific mint if it exists and has an expiration date
  const tokenPassToken = tokenPass?.get(mint)
  if (tokenPassToken &&  tokenPassToken.createdAt) {
    const expirationDate = tokenPassToken.expirationDate
      ? new Date(tokenPassToken.expirationDate)
      : null;
    if (expirationDate) {
      // Compare expiration date with the current date
      if (expirationDate > new Date()) {
        return true; // Token pass is valid, do not include bot fee
      }
    } else {
      return true; // If there's no expiration date, treat it as valid
    }
  }

  // If no valid passes found, include bot fee
  return false;
}
