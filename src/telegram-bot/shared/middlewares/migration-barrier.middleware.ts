import { MiddlewareFn } from "telegraf";
import { DEFAULT_REPLY_OPTIONS, MIGRATION_IMAGE_PATH } from "../constants";
import { BotContext } from "../../bot.context";

const MIGRATION_MESSAGE = `*🚀   The Next Chapter for EzPump*

EzPump launched as a fast, lightweight pump companion and quickly built a strong, active community. Now, its journey continues as part of the MicroPump ecosystem, where the core vision and experience will live on and grow even stronger.


*💼   No action needed* — all connected wallets have been securely transferred to MicroPump. Everything you had with EzPump is already waiting for you there.


*🙏   Thank you* to everyone who supported, used, and believed in EzPump. This evolution is part of the bigger picture and we're excited for what's next.`;

export function createMigrationBarrierMiddleware(): MiddlewareFn<BotContext> {
  return async (ctx, next) => {
    // Allow admins through
    if (ctx.session?.user?.isAdmin) {
      return next();
    }

    // For all other users, block and inform
    if (ctx.from) {
      await ctx.replyWithPhoto(
        { source: MIGRATION_IMAGE_PATH },
        {
          caption: MIGRATION_MESSAGE,
          ...DEFAULT_REPLY_OPTIONS,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔗  Continue to MicroPump Bot",
                  url: "https://t.me/micropump_bot",
                },
              ],
            ],
          },
        }
      );
    }
    // Do not call next() for non-admins
  };
}
