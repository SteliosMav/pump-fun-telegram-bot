import { Inject, Injectable } from "@nestjs/common";
import { UserService } from "../../../src/core/user/user.service";
import { Telegraf } from "telegraf";
import { DEFAULT_REPLY_OPTIONS } from "../../../src/telegram-bot/shared/constants";
import _ from "lodash";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";

@Injectable()
export class BroadcastService {
  constructor(
    private readonly userService: UserService,
    @Inject("TELEGRAM_BOT") private readonly bot: Telegraf
  ) {}

  async sendMessageToUsers(
    userIds: number[],
    message: string,
    buttons: InlineKeyboardButton[][]
  ) {
    const unreachedUsers: number[] = [];

    for (const userId of userIds) {
      try {
        await this.bot.telegram.sendMessage(userId, message, {
          ...DEFAULT_REPLY_OPTIONS,
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
      } catch (error) {
        if (this.isBotBlockedError(error)) {
          // User banned bot
          console.log(`User: "${userId}", has blocked the bot.`);
        } else {
          // Unknown reason
          console.error(`Failed to send message to user ${userId}:`, error);
        }
        unreachedUsers.push(userId);
      }
    }

    await this.userService.markUsersWhoBannedBot(unreachedUsers);
    return unreachedUsers;
  }

  private isBotBlockedError(e: unknown): boolean {
    return (
      _.isObject(e) &&
      "response" in e &&
      _.isObject(e.response) &&
      "error_code" in e.response &&
      e.response.error_code === 403
    );
  }
}
