import { INestApplicationContext } from "@nestjs/common";
import { UserService } from "../../../src/core/user/user.service";

export async function giveUsersServicePassTask(
  appContext: INestApplicationContext
) {
  // Dependencies
  const userService = appContext.get(UserService);

  // Get users to give service pass
  const userIds = [7637618506];
  // const userIds = await userService.findReachableUsers();

  // Give service pass to users
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  const servicePassRes = await userService.addServicePass(userIds, expiresAt);
  console.log(servicePassRes);
}
