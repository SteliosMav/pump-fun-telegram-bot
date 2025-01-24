import { MiddlewareFn, Scenes } from "telegraf";

export const validateContextMiddleware: MiddlewareFn<
  Scenes.SceneContext
> = async (ctx, next) => {
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
    console.warn("Unsupported message type");
    logUser(ctx);
    return;
  }

  next();
};

/**
 * @WARNING REPLACE WITH A GLOBAL LOGGER. CHECK OUT THE NESTJS LOGGER NATIVE INTEGRATION.
 */
function logUser(ctx: Scenes.SceneContext) {
  console.warn(
    `telegram ID: ${ctx.from?.id}, is-bot: ${ctx.from?.is_bot} username: ${ctx.from?.username}, first-name: ${ctx.from?.first_name}, last-name: ${ctx.from?.last_name}`
  );
}
