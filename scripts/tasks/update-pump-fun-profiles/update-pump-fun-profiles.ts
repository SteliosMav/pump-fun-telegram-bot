import { INestApplicationContext } from "@nestjs/common";
import { PumpFunService } from "../../../src/core/pump-fun/pump-fun.service";
import { toKeypair } from "../../../src/core/solana";
import { UserService } from "../../../src/core/user/user.service";

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

  // Create a pump.fun profile
  // const res = await pumpFunService.createProfile(keypair);

  // console.log(res);
  // console.log(`Private key: ${privateKey}`);
  // console.log(`Public key: ${keypair.publicKey.toBase58()}`);
  // console.log(`Profile URL: https://pump.fun/profile/${res.address}`);
}
