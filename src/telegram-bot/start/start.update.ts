import { Command, Action, Ctx, Update, Next } from "nestjs-telegraf";
import { BotContext } from "../bot.context";

@Update()
export class StartUpdate {
  @Command("start")
  async onStart(@Ctx() ctx: BotContext, @Next() next: () => Promise<void>) {
    await ctx.reply("Welcome to the bot! Press a button to proceed.", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Start Bumping", callback_data: "START_BUMPING" }],
          [{ text: "Settings", callback_data: "SETTINGS" }],
        ],
      },
    });

    // Pass control to other handlers if necessary
    await next();
  }

  @Action("START_BUMPING")
  async onStartBumping(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply("Bumping started!");
    // Logic to start bumping goes here
  }

  @Action("SETTINGS")
  async onSettings(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply("Redirecting to settings...", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Set Slippage", callback_data: "SET_SLIPPAGE" }],
          [{ text: "Back", callback_data: "BACK" }],
        ],
      },
    });
  }
}
