import { MiddlewareFn, Scenes } from "telegraf";

export const validateContextMiddleware: MiddlewareFn<
  Scenes.SceneContext
> = async (ctx, next) => {
  // === Validate User ===
  if (!ctx.from) {
    console.warn('Invalid update without "from" field');
    return;
  }
  if (ctx.from.is_bot) {
    console.warn("Interaction from a bot is ignored");
    return;
  }

  // === Validate Chat ===
  if (!ctx.chat) {
    console.warn('Invalid update without "chat" field');
    return;
  }

  next();
};
