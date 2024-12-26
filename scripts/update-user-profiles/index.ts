import { Keypair } from "@solana/web3.js";
import connectDB from "../../src/lib/mongo";
import { UserService } from "../../src/users/user.service";
import bs58 from "bs58";

// MongoDB connection
connectDB();

(async () => {
  const failedIds = await updateAllUserProfiles();
  if (failedIds.length > 0) {
    console.log(
      "Failed to update profiles for the following users:",
      failedIds
    );
  } else {
    console.log("All profiles updated successfully.");
  }
})();

/**
 * Updates the profiles of all users in the database.
 * Returns an array of IDs for the users whose profiles failed to update.
 *
 * @param users - Array of users to update
 * @returns Promise<number[]> - An array of user IDs that failed to update
 */
async function updateAllUserProfiles(): Promise<number[]> {
  const userService = new UserService();
  const users = await userService.getUsers();
  const failedUpdates: number[] = [];

  // Iterate through each user and attempt to update their profile
  let counter = 0;
  for (const user of users.filter((user) => user.telegramId === 7694797759)) {
    counter++;
    /*
    // Skip
    if (counter <= 150) {
      continue;
    }
    // Amount
    if (counter > 160) {
      break;
    }
    */

    console.log(`Counter: ${counter}, User: ${user.telegramId}`);
    try {
      await userService.setUpUsersPumpFunAcc(user.telegramId, user.privateKey);
    } catch (error) {
      console.error(
        `Failed to update profile for user with ID: ${user.telegramId}`,
        error
      );
      failedUpdates.push(user.telegramId);
    }
  }

  return failedUpdates;
}
