import { INestApplicationContext } from "@nestjs/common";
import { PumpFunService } from "../../../src/core/pump-fun/pump-fun.service";
import { UserService } from "../../../src/core/user/user.service";
import { isAxiosError } from "axios";
import { delay } from "../../../src/shared/utils";

export async function updatePumpFunProfilesTask(
  appContext: INestApplicationContext
) {
  // Dependencies
  const userService = appContext.get(UserService);
  const pumpFunService = appContext.get(PumpFunService);

  // Fetch user wallets
  const accounts = await userService.findPumpFunAccountsToUpdate();
  console.log("Accounts: ", accounts);
  console.log("Users with unset accounts:", accounts.length);

  // Create a pump.fun profile, for every account
  const usersWithAccountSet: number[] = [];
  const usersWithAccountNotSet: number[] = [];
  for (const [index, account] of accounts.entries()) {
    const isFirstIteration = index === 0;
    if (!isFirstIteration) {
      await delay(1000); // delay to not get rate limit from pump.fun
    }
    console.log(`Processing ${index + 1}/${accounts.length}...`);
    try {
      await pumpFunService.createProfile(account.keypair);
      usersWithAccountSet.push(account.telegram.id);
      console.log(`Account updated!`);
    } catch (e) {
      console.error(`Account update failed!`);
      if (isAxiosError(e)) {
        console.log(`Axios error: status: ${e.status}, message: ${e.message}.`);
      } else {
        console.error("Unknown error:", e);
      }
      usersWithAccountNotSet.push(account.telegram.id);
    }
  }
  console.log(`Total accounts to update: ${accounts.length}`);
  console.log(`Users with account set: ${usersWithAccountSet.length}`);
  console.log(`Users with account NOT set: ${usersWithAccountNotSet.length}`);

  // Update users's pump.fun account status property
  if (usersWithAccountSet.length) {
    const res = await userService.updatePumpFunAccountStatus(
      usersWithAccountSet,
      true
    );
    console.log(`Updating users with account set:`, res);
  }
  if (usersWithAccountNotSet.length) {
    const res = await userService.updatePumpFunAccountStatus(
      usersWithAccountNotSet,
      false
    );
    console.log(`Updating users with account NOT set:`, res);
  }
}
