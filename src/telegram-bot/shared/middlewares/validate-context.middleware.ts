import { MiddlewareFn, Scenes } from "telegraf";
import fs from "fs";
import { UserService } from "../../../core/user/user.service";

export function createValidateContextMiddleware(
  userService: UserService
): MiddlewareFn<Scenes.SceneContext> {
  return async (ctx, next) => {
    // === Validate User ===
    if (!ctx.from) {
      console.warn(`Invalid update without "from" field`);
      logUser(ctx);
      return;
    }
    if (ctx.from.is_bot) {
      console.warn(`Interaction from a bot is ignored`);
      logUser(ctx);
      return;
    }

    // === Validate Chat ===
    if (!ctx.chat) {
      console.warn(
        `Invalid update without "chat" field from user: ${ctx.from.id}`
      );
      logUser(ctx);
      return;
    }

    // === Validate Message ===
    // Only text messages are supported for now. In the future, we can add support for other types.
    // Just create separate interfaces for each type of message like `TextContext`, `PhotoContext`, etc.
    const isTextContext = ctx.message && "text" in ctx.message;
    const isCallbackContext = ctx.callbackQuery && "data" in ctx.callbackQuery;
    if (!isTextContext && !isCallbackContext) {
      // Event is not from text or message
      const telegramId = ctx.from.id;
      const isUserBannedBotEvent =
        "my_chat_member" in ctx.update &&
        ctx.update.my_chat_member.new_chat_member.status === "kicked";
      const isUserUnbannedBotEvent =
        "my_chat_member" in ctx.update &&
        ctx.update.my_chat_member.old_chat_member.status === "kicked" &&
        ctx.update.my_chat_member.new_chat_member.status === "member";

      if (isUserBannedBotEvent) {
        // Mark user who banned the bot
        console.log(`User ${telegramId} banned the bot`);
        await userService.markUsersWhoBannedBot([telegramId]);
      } else if (isUserUnbannedBotEvent) {
        // Unmark user who previously had banned the bot
        console.log(`User ${telegramId} unbanned the bot`);
        await userService.unmarkUserWhoBannedBot(telegramId);
      } else {
        // Unsupported message type
        logUser(ctx);
      }
      return;
    }

    next();
  };
}

/**
 * @WARNING REPLACE WITH A GLOBAL LOGGER. CHECK OUT THE NESTJS LOGGER NATIVE INTEGRATION.
 */
function logUser(ctx: Scenes.SceneContext) {
  console.warn(
    `Unsupported message type from: telegram ID: ${ctx.from?.id}, is-bot: ${ctx.from?.is_bot} username: ${ctx.from?.username}, first-name: ${ctx.from?.first_name}, last-name: ${ctx.from?.last_name}`,
    ctx
  );

  fs.writeFileSync(
    `exported-data/${new Date().getTime()}-unsupported-ctx.json`,
    JSON.stringify(ctx, null, 2)
  );
}
