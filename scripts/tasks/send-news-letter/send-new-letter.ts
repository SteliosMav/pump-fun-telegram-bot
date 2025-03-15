import { INestApplicationContext } from "@nestjs/common";
import { UserService } from "../../../src/core/user/user.service";

export async function sendNewsLetterTask(appContext: INestApplicationContext) {
  // Dependencies
  const userService = appContext.get(UserService);

  // Mark users who banned bot
  const userIds: number[] = [];
  const markUsersRes = await userService.markUsersWhoBannedBot(userIds);

  console.log("Mark users response:", markUsersRes);
}
