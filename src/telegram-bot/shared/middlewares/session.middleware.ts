import { MiddlewareFn, Scenes } from "telegraf";
import { session } from "telegraf";
import { BotSessionData } from "../../bot.context";
import { BumpStatus } from "../../start/types";

export const sessionMiddleware: MiddlewareFn<Scenes.SceneContext> = async (
  ctx,
  next
) => {
  if (!ctx.from) {
    console.warn('Invalid update without "from" field');
    return;
  }

  if (ctx.from.is_bot) {
    console.warn("Interaction from a bot is ignored");
    return;
  }

  const userId = ctx.from.id; // Assumes validateUserMiddleware already ran

  // Check if the user exists in your database
  let user = await getUserFromDatabase(userId);

  if (!user) {
    // If user doesn't exist, create one and notify them
    await ctx.reply("Welcome! Creating a wallet for you...");
    user = await createUserInDatabase(userId, { wallet: "new-wallet-id" });
    await ctx.reply("Your wallet has been created!");
  }

  const dateNow = new Date();
  const expirationDate = new Date(dateNow.setHours(dateNow.getHours() + 1)); // Expires in 1 hour

  const defaultSessionData: BotSessionData = {
    bumpStatus: BumpStatus.NOT_BUMPING,
    user,
    expires: Math.floor(expirationDate.getTime() / 1000), // Expects a Unix timestamp in seconds.
  };

  const fn = session({
    defaultSession: () => defaultSessionData,
  });
  fn(ctx, next);
};

// Example database functions (replace with your actual logic)
async function getUserFromDatabase(userId: number): Promise<any> {
  // Fetch user from database
}

async function createUserInDatabase(userId: number, data: any): Promise<any> {
  // Save user to database
}
