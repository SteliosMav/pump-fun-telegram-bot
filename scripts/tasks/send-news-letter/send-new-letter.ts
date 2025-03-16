import { INestApplicationContext } from "@nestjs/common";
import { UserService } from "../../../src/core/user/user.service";
import fs from "fs";
import { BotV2ReleaseViewService } from "./views/bot-v2-release.view";
import { BroadcastService } from "./broad-cast.service";

export async function sendNewsLetterTask(appContext: INestApplicationContext) {
  // Dependencies
  const userService = appContext.get(UserService);
  const view = appContext.get(BotV2ReleaseViewService);
  const broadcastService = appContext.get(BroadcastService);

  // Fetch news letter recipients
  const userIds = [7637618506];
  // const userIds = await userService.findReachableUsers();
  console.log("Total user:", userIds.length);

  // Send message
  const message = view.getMessage();
  const buttons = view.getButtons();
  const unreachedUsers = await broadcastService.sendMessageToUsers(
    userIds,
    message,
    buttons
  );
  console.log("Unreached users:", unreachedUsers.length);

  // Mark users who banned bot
  try {
    const markUsersRes = await userService.markUsersWhoBannedBot(
      unreachedUsers
    );
    console.log("Marked users response:", markUsersRes);
  } catch (e) {
    console.log("Marking users failed:", e);
  }

  // Export unreached users
  fs.writeFileSync(
    `exported-data/${new Date().getTime()}-unreached-users.json`,
    JSON.stringify(unreachedUsers)
  );
}
