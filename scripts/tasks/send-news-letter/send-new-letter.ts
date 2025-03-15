import { INestApplicationContext } from "@nestjs/common";
import { UserService } from "../../../src/core/user/user.service";
import { Telegraf } from "telegraf";
import { ConfigService } from "@nestjs/config";
import { Configuration } from "../../../src/shared/config";
import { DEFAULT_REPLY_OPTIONS } from "../../../src/telegram-bot/shared/constants";
import { isBotBlockedError } from "./utils";
import fs from "fs";

export async function sendNewsLetterTask(appContext: INestApplicationContext) {
  // Dependencies
  const userService = appContext.get(UserService);
  const configService = appContext.get(ConfigService);

  // Initialize the bot
  const botToken =
    configService.get<Configuration["TELEGRAM_BOT_TOKEN"]>(
      "TELEGRAM_BOT_TOKEN"
    )!;
  const bot = new Telegraf(botToken);

  // Send message
  const userIds = [7637618506];
  const unreachedUsers = [];
  for (const userId of userIds) {
    try {
      await bot.telegram.sendMessage(userId, "Test message", {
        ...DEFAULT_REPLY_OPTIONS,
      });
    } catch (error) {
      if (isBotBlockedError(error)) {
        // User banned bot
        console.log(`User: "${userId}", has blocked the bot.`);
      } else {
        // Unknown reason
        console.error(`Failed to send message to user ${userId}:`, error);
      }
      unreachedUsers.push(userId);
    }
  }
  console.log("Total user:", userIds.length);
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
